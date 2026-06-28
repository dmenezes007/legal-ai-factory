import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { GoogleGenAI, createPartFromBase64, createPartFromText } from "@google/genai";
import { classifySource } from "./classifier";
import type { IngestionResult, IngestionSummary } from "./types";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".docx"]);
const GEMINI_PDF_MAX_BYTES = 20 * 1024 * 1024;

function isRetryableGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /503|unavailable|high demand|timeout|deadline exceeded|resource_exhausted|429/i.test(message);
}

function uniqueOcrModels(preferredModel: string): string[] {
  const candidates = [preferredModel, "gemini-2.5-flash", "gemini-2.0-flash"];
  const seen = new Set<string>();
  return candidates.filter((model) => {
    const normalized = (model || "").trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractPdfTextWithGemini(data: Buffer): Promise<{ text: string | null; warning?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return { text: null, warning: "Fallback Gemini OCR indisponivel: GEMINI_API_KEY ausente." };
  }

  if (data.byteLength > GEMINI_PDF_MAX_BYTES) {
    return { text: null, warning: `Fallback Gemini OCR ignorado: PDF maior que ${GEMINI_PDF_MAX_BYTES} bytes.` };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const models = uniqueOcrModels(process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash");
    let lastError: unknown;

    for (const model of models) {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              createPartFromText(
                "Extraia o texto integral deste PDF juridico em portugues do Brasil. Retorne somente o texto extraido, sem comentarios.",
              ),
              createPartFromBase64(data.toString("base64"), "application/pdf"),
            ],
          });

          const text = response.text?.trim();
          if (text && text.length > 0) {
            return { text };
          }

          lastError = new Error(`Modelo ${model} nao retornou texto no OCR multimodal.`);
          break;
        } catch (error) {
          lastError = error;
          if (!isRetryableGeminiError(error)) {
            break;
          }

          if (attempt < 3) {
            await delay(1200 * attempt);
          }
        }
      }
    }

    if (!lastError) {
      return { text: null, warning: "Fallback Gemini OCR nao retornou texto para o PDF." };
    }

    const message = lastError instanceof Error ? lastError.message : String(lastError ?? "erro desconhecido");
    return { text: null, warning: `Fallback Gemini OCR falhou: ${message}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "erro desconhecido");
    return { text: null, warning: `Fallback Gemini OCR falhou: ${message}` };
  }
}

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursively(fullPath);
      }
      return [fullPath];
    }),
  );
  return nested.flat();
}

async function extractText(filePath: string): Promise<{ text: string; warnings: string[]; extracted: boolean }> {
  const ext = path.extname(filePath).toLowerCase();
  const warnings: string[] = [];

  try {
    if (ext === ".txt" || ext === ".md") {
      return { text: await fs.readFile(filePath, "utf8"), warnings, extracted: true };
    }

    if (ext === ".pdf") {
      const data = await fs.readFile(filePath);
      const parsed = await pdfParse(data);
      const parsedText = parsed.text?.trim() ?? "";
      if (parsedText.length > 0) {
        return { text: parsedText, warnings, extracted: true };
      }

      const geminiOcr = await extractPdfTextWithGemini(data);
      if (geminiOcr.text && geminiOcr.text.length > 0) {
        warnings.push("Texto do PDF extraido via Gemini multimodal (fallback OCR). ");
        return { text: geminiOcr.text, warnings, extracted: true };
      }

      if (geminiOcr.warning) {
        warnings.push(geminiOcr.warning);
      }

      warnings.push("PDF sem texto extraivel (possivel documento escaneado sem OCR). ");
      return { text: "", warnings, extracted: true };
    }

    if (ext === ".docx") {
      const parsed = await mammoth.extractRawText({ path: filePath });
      if (parsed.messages.length > 0) {
        warnings.push(...parsed.messages.map((m) => `${m.type}: ${m.message}`));
      }
      return { text: parsed.value?.trim() ?? "", warnings, extracted: true };
    }

    warnings.push(`Formato nao suportado para extracao: ${ext}`);
    return { text: "", warnings, extracted: false };
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "Erro desconhecido de extracao");
    return { text: "", warnings, extracted: false };
  }
}

export interface IngestionPaths {
  sourceDir: string;
  processedDir: string;
  metadataDir: string;
}

interface CatalogEntry {
  id: string;
  title: string;
  type: string;
  category: string;
  source_path: string;
  processed_path: string;
  status: "processed" | "error";
  tags: string[];
  related_skills: string[];
  related_workflows: string[];
  created_at: string;
  updated_at: string;
  provenance: {
    ingestion_id: string;
    source_format: string;
    extracted: boolean;
    extraction_warnings: string[];
  };
  notes: string;
}

interface IndexEntry {
  id: string;
  title: string;
  type: string;
  category: string;
  source_path: string;
  status: string;
  tags: string[];
  updated_at: string;
}

interface RelationshipsDoc {
  nodes: Array<{ id: string; type: string; title: string }>;
  edges: Array<{ source: string; target: string; relation: string }>;
  updated_at: string;
}

interface IngestionCacheEntry {
  signature: string;
  item: IngestionResult;
}

type IngestionCacheMap = Record<string, IngestionCacheEntry>;

async function readJsonSafe<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function toWorkspaceRelative(targetPath: string): string {
  const rel = path.relative(process.cwd(), targetPath).replace(/\\/g, "/");
  return rel.length > 0 ? rel : targetPath.replace(/\\/g, "/");
}

function inferSkillLinks(fileName: string, category: string): string[] {
  const lcName = fileName.toLowerCase();
  if (lcName.includes("contestacao") || lcName.includes("saude") || category === "skill") {
    return ["skill.contestacao-saude"];
  }
  return [];
}

function inferWorkflowLinks(skillLinks: string[]): string[] {
  if (skillLinks.includes("skill.contestacao-saude")) {
    return ["workflow.contestacao-saude.v1"];
  }
  return [];
}

async function updateKnowledgeGovernance(items: IngestionResult[], paths: IngestionPaths): Promise<void> {
  const knowledgeDir = path.resolve(paths.sourceDir, "..", "..");
  const catalogPath = path.join(knowledgeDir, "catalog.json");
  const indexPath = path.join(knowledgeDir, "index.json");
  const relationshipsPath = path.join(knowledgeDir, "relationships.json");

  const existingCatalog = await readJsonSafe<CatalogEntry[]>(catalogPath, []);
  const catalogBySource = new Map<string, CatalogEntry>();

  for (const entry of existingCatalog) {
    const absoluteSourcePath = path.join(process.cwd(), entry.source_path);
    try {
      await fs.access(absoluteSourcePath);
      catalogBySource.set(entry.source_path, entry);
    } catch {
      // Remove registros orfaos quando a fonte original nao existe mais.
    }
  }

  for (const item of items) {
    const source_path = toWorkspaceRelative(item.originalPath);
    const processed_path = toWorkspaceRelative(item.processedPath);
    const now = new Date().toISOString();
    const existing = catalogBySource.get(source_path);
    const related_skills = inferSkillLinks(item.fileName, item.category);
    const related_workflows = inferWorkflowLinks(related_skills);

    const entry: CatalogEntry = {
      id: existing?.id ?? `ko-${randomUUID()}`,
      title: path.parse(item.fileName).name,
      type: "knowledge_source",
      category: item.category,
      source_path,
      processed_path,
      status: item.extracted ? "processed" : "error",
      tags: [item.category, item.extension.replace(".", "")],
      related_skills,
      related_workflows,
      created_at: existing?.created_at ?? now,
      updated_at: now,
      provenance: {
        ingestion_id: item.id,
        source_format: item.extension,
        extracted: item.extracted,
        extraction_warnings: item.extractionWarnings,
      },
      notes: item.extracted
        ? "Fonte processada e indexada pelo pipeline local."
        : "Extracao parcial ou falha; revisar arquivo original.",
    };

    catalogBySource.set(source_path, entry);
  }

  const catalog = [...catalogBySource.values()].sort((a, b) => a.title.localeCompare(b.title));
  const indexData: IndexEntry[] = catalog.map((entry) => ({
    id: entry.id,
    title: entry.title,
    type: entry.type,
    category: entry.category,
    source_path: entry.source_path,
    status: entry.status,
    tags: entry.tags,
    updated_at: entry.updated_at,
  }));

  const relationshipNodes = [
    ...catalog.map((entry) => ({ id: entry.id, type: "knowledge_source", title: entry.title })),
    { id: "skill.contestacao-saude", type: "skill", title: "Contestacao Saude" },
    { id: "workflow.contestacao-saude.v1", type: "workflow", title: "Workflow Contestacao Saude MVP" },
  ];

  const relationshipEdges: RelationshipsDoc["edges"] = [];
  for (const entry of catalog) {
    for (const skillId of entry.related_skills) {
      relationshipEdges.push({ source: entry.id, target: skillId, relation: "supports_skill" });
    }
    for (const workflowId of entry.related_workflows) {
      relationshipEdges.push({ source: entry.id, target: workflowId, relation: "supports_workflow" });
    }
  }

  const relationships: RelationshipsDoc = {
    nodes: relationshipNodes,
    edges: relationshipEdges,
    updated_at: new Date().toISOString(),
  };

  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), "utf8");
  await fs.writeFile(relationshipsPath, JSON.stringify(relationships, null, 2), "utf8");
}

export async function ingestKnowledgeSources(paths: IngestionPaths): Promise<IngestionSummary> {
  await fs.mkdir(paths.sourceDir, { recursive: true });
  await fs.mkdir(paths.processedDir, { recursive: true });
  await fs.mkdir(paths.metadataDir, { recursive: true });

  const cachePath = path.join(paths.metadataDir, "_ingestion_cache.json");
  const cache = await readJsonSafe<IngestionCacheMap>(cachePath, {});

  const files = await listFilesRecursively(paths.sourceDir);
  const candidates = files.filter((file) => SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()));

  const items: IngestionResult[] = [];

  for (const filePath of candidates) {
    const absolutePath = path.resolve(filePath);
    const stat = await fs.stat(absolutePath);
    const signature = `${stat.size}:${Math.trunc(stat.mtimeMs)}`;
    const cached = cache[absolutePath];

    if (cached && cached.signature === signature) {
      try {
        await fs.access(cached.item.processedPath);
        await fs.access(cached.item.metadataPath);
        items.push(cached.item);
        continue;
      } catch {
        // Cache inconsistente: reprocessa o arquivo.
      }
    }

    const id = randomUUID();
    const fileName = path.basename(absolutePath);
    const extension = path.extname(absolutePath).toLowerCase();

    const { text, warnings, extracted } = await extractText(absolutePath);
    const category = classifySource(fileName, text);

    const processedName = `${path.parse(fileName).name}.${id}.processed.txt`;
    const metadataName = `${path.parse(fileName).name}.${id}.metadata.json`;

    const processedPath = path.join(paths.processedDir, processedName);
    const metadataPath = path.join(paths.metadataDir, metadataName);

    await fs.writeFile(processedPath, text || "", "utf8");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          id,
          fileName,
          extension,
          category,
          extracted,
          extractionWarnings: warnings,
          sourcePath: absolutePath,
          processedPath,
          createdAt: new Date().toISOString(),
          textLength: text.length,
        },
        null,
        2,
      ),
      "utf8",
    );

    const item: IngestionResult = {
      id,
      originalPath: absolutePath,
      processedPath,
      metadataPath,
      fileName,
      extension,
      category,
      textLength: text.length,
      extracted,
      extractionWarnings: warnings,
    };

    items.push(item);
    cache[absolutePath] = {
      signature,
      item,
    };
  }

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");

  await updateKnowledgeGovernance(items, paths);

  return {
    sourceDir: paths.sourceDir,
    processedDir: paths.processedDir,
    metadataDir: paths.metadataDir,
    timestamp: new Date().toISOString(),
    total: candidates.length,
    processed: items.length,
    errors: items.filter((i) => !i.extracted).length,
    items,
  };
}
