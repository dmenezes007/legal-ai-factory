import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import {
  draftChapter,
  generateArchitecture,
  generateLegalDocx,
  ingestKnowledgeSources,
  runBenchmarkCase,
  reviewChapter,
} from "../../../packages/core/src/index";

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (configuredOrigins.includes(origin)) {
    return true;
  }

  // Allows preview and production frontend deployments hosted on Vercel.
  return /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (typeof origin === "string" && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "10mb" }));

const apiLogs: Array<Record<string, unknown>> = [];

function pushLog(event: string, payload: Record<string, unknown>): void {
  apiLogs.unshift({
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  if (apiLogs.length > 500) {
    apiLogs.pop();
  }
}

const ROOT = process.cwd();
const KNOWLEDGE_ORIGINAL = path.join(ROOT, "knowledge", "sources", "original");
const KNOWLEDGE_NOTEBOOKLM = path.join(KNOWLEDGE_ORIGINAL, "notebooklm");
const KNOWLEDGE_PROCESSED = path.join(ROOT, "knowledge", "sources", "processed");
const KNOWLEDGE_METADATA = path.join(ROOT, "knowledge", "sources", "metadata");
const KNOWLEDGE_REFERENCE_STATE = path.join(KNOWLEDGE_METADATA, "_reference_base_state.json");
const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".docx"]);

interface ExtractedCaseMetadata {
  number?: string;
  court?: string;
  plaintiff?: string;
  defendant?: string;
  client?: string;
  rite?: string;
  legalArea?: string;
}

interface CaseMetadataDiagnostics {
  totalCaseFiles: number;
  extractedTextFiles: number;
  emptyTextFiles: number;
  likelyScannedPdf: boolean;
  emptyTextFileNames: string[];
}

interface DirectorySignature {
  fileCount: number;
  totalBytes: number;
  maxMtimeMs: number;
}

function hasCriticalMetadata(meta: ExtractedCaseMetadata): boolean {
  return Boolean(meta.number && meta.court && meta.plaintiff && meta.defendant);
}

function toPosixPath(rawPath: string): string {
  return rawPath.replace(/\\/g, "/");
}

function isNotebooklmReferencePath(relativePath: string): boolean {
  const normalized = toPosixPath(relativePath || "")
    .toLowerCase()
    .replace(/^\.?\//, "")
    .trim();

  return normalized === "notebooklm" || normalized.startsWith("notebooklm/");
}

function resolveInOriginalDir(sourceSubdir?: string): string | null {
  if (!sourceSubdir || sourceSubdir.trim().length === 0) {
    return KNOWLEDGE_ORIGINAL;
  }

  const cleaned = sourceSubdir.trim().replace(/^\/+/, "");
  const resolved = path.resolve(KNOWLEDGE_ORIGINAL, cleaned);
  const originalRoot = path.resolve(KNOWLEDGE_ORIGINAL);

  if (resolved === originalRoot || resolved.startsWith(`${originalRoot}${path.sep}`)) {
    return resolved;
  }

  return null;
}

async function buildDirectorySignature(dir: string): Promise<DirectorySignature> {
  const files = await listFilesRecursively(dir);
  const stats = await Promise.all(files.map((filePath) => fs.stat(filePath)));

  let totalBytes = 0;
  let maxMtimeMs = 0;
  for (const stat of stats) {
    totalBytes += stat.size;
    maxMtimeMs = Math.max(maxMtimeMs, stat.mtimeMs);
  }

  return {
    fileCount: files.length,
    totalBytes,
    maxMtimeMs: Math.trunc(maxMtimeMs),
  };
}

async function shouldRefreshReferenceBase(): Promise<{ refresh: boolean; signature: DirectorySignature }> {
  await fs.mkdir(KNOWLEDGE_METADATA, { recursive: true });
  const signature = await buildDirectorySignature(KNOWLEDGE_NOTEBOOKLM);

  try {
    const raw = await fs.readFile(KNOWLEDGE_REFERENCE_STATE, "utf8");
    const parsed = JSON.parse(raw) as { signature?: DirectorySignature };
    const prev = parsed.signature;

    if (!prev) {
      return { refresh: true, signature };
    }

    const unchanged =
      prev.fileCount === signature.fileCount &&
      prev.totalBytes === signature.totalBytes &&
      prev.maxMtimeMs === signature.maxMtimeMs;

    return { refresh: !unchanged, signature };
  } catch {
    return { refresh: true, signature };
  }
}

async function markReferenceBaseIngested(signature: DirectorySignature): Promise<void> {
  await fs.mkdir(KNOWLEDGE_METADATA, { recursive: true });
  await fs.writeFile(
    KNOWLEDGE_REFERENCE_STATE,
    JSON.stringify(
      {
        signature,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
}

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursively(fullPath);
      }

      if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        return [fullPath];
      }

      return [];
    }),
  );

  return nested.flat();
}

function mergeIngestionSummaries(
  summaries: Array<Awaited<ReturnType<typeof ingestKnowledgeSources>>>,
) {
  const seen = new Set<string>();
  const items: Array<(typeof summaries)[number]["items"][number]> = [];

  for (const summary of summaries) {
    for (const item of summary.items) {
      const key = toPosixPath(item.originalPath);
      if (!seen.has(key)) {
        seen.add(key);
        items.push(item);
      }
    }
  }

  return {
    sourceDir: summaries[0]?.sourceDir ?? KNOWLEDGE_ORIGINAL,
    processedDir: summaries[0]?.processedDir ?? KNOWLEDGE_PROCESSED,
    metadataDir: summaries[0]?.metadataDir ?? KNOWLEDGE_METADATA,
    timestamp: new Date().toISOString(),
    total: items.length,
    processed: items.length,
    errors: items.filter((item) => !item.extracted).length,
    items,
  };
}

function firstRegexValue(patterns: RegExp[], texts: string[]): string | undefined {
  for (const text of texts) {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const cleaned = match[1].replace(/\s+/g, " ").trim();
        if (cleaned.length >= 3) {
          return cleaned;
        }
      }
    }
  }
  return undefined;
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (!fenced || !fenced[1]) {
      return null;
    }
    try {
      return JSON.parse(fenced[1]) as T;
    } catch {
      return null;
    }
  }
}

async function extractCaseMetadataWithGemini(texts: string[]): Promise<ExtractedCaseMetadata> {
  if (!process.env.GEMINI_API_KEY || texts.length === 0) {
    return {};
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const corpus = texts.slice(0, 3).map((text, idx) => `---DOCUMENTO ${idx + 1}---\n${text.slice(0, 12000)}`).join("\n\n");

    const prompt = [
      "Extraia metadados processuais em portugues juridico a partir dos textos abaixo.",
      "Retorne APENAS JSON valido no formato:",
      '{"number":"","court":"","plaintiff":"","defendant":"","client":"","rite":"","legalArea":""}',
      "Regras:",
      "1) Se nao identificar um campo com confianca, retorne string vazia.",
      "2) Nao invente dados.",
      "3) number deve preferir o padrao CNJ completo quando existir.",
      "4) court deve incluir vara/juizo/comarca quando disponivel.",
      "5) plaintiff e defendant devem conter os nomes das partes processuais.",
      "Textos:",
      corpus,
    ].join("\n");

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const parsed = safeJsonParse<ExtractedCaseMetadata>(response.text ?? "");
    if (!parsed) {
      return {};
    }

    return {
      number: parsed.number?.trim() || undefined,
      court: parsed.court?.trim() || undefined,
      plaintiff: parsed.plaintiff?.trim() || undefined,
      defendant: parsed.defendant?.trim() || undefined,
      client: parsed.client?.trim() || undefined,
      rite: parsed.rite?.trim() || undefined,
      legalArea: parsed.legalArea?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

function inferLegalAreaFromTexts(texts: string[]): string | undefined {
  const bag = texts.join("\n").toLowerCase();
  if (/trabalh|clt|reclama[çc][aã]o trabalhista/.test(bag)) {
    return "Direito do Trabalho";
  }
  if (/consumidor|cdc|rela[çc][aã]o de consumo/.test(bag)) {
    return "Cível / Consumidor";
  }
  if (/imobili[áa]ri|compra e venda|lote/.test(bag)) {
    return "Direito Imobiliário";
  }
  if (/tribut[áa]ri|icms|ipi|iss|execu[çc][aã]o fiscal/.test(bag)) {
    return "Direito Tributário";
  }
  if (/plano de sa[úu]de|ans|operadora|hospital|procedimento/.test(bag)) {
    return "Direito Médico / de Saúde";
  }
  return undefined;
}

function inferRiteFromTexts(texts: string[]): string | undefined {
  const bag = texts.join("\n").toLowerCase();
  if (/juizado especial|jec|lei\s*9\.099/.test(bag)) {
    return "Juizado Especial Cível";
  }
  if (/procedimento comum/.test(bag)) {
    return "Procedimento Comum Cível";
  }
  if (/rito sumar[íi]ssimo/.test(bag)) {
    return "Rito Sumaríssimo";
  }
  return undefined;
}

async function extractCaseMetadataFromSummary(
  summary: Awaited<ReturnType<typeof ingestKnowledgeSources>> | undefined,
): Promise<ExtractedCaseMetadata> {
  if (!summary || summary.items.length === 0) {
    return {};
  }

  const texts: string[] = [];
  for (const item of summary.items) {
    try {
      const raw = await fs.readFile(item.processedPath, "utf8");
      if (raw.trim().length > 0) {
        texts.push(raw.slice(0, 16000));
      }
    } catch {
      // Ignora arquivos sem leitura util para metadados.
    }
  }

  const number = firstRegexValue(
    [
      /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/,
      /(\d{20})/,
      /processo\s*(?:n[ºo°.]?|numero)?\s*[:\-]?\s*(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/i,
    ],
    texts,
  );
  const court = firstRegexValue(
    [
      /(?:ju[ií]zo|vara|tribunal)\s*[:\-]?\s*([^\n.;]{8,180})/i,
      /((?:\d{1,2}ª?\s+vara[^\n.;]{4,180}))/i,
      /(?:comarca|foro)\s+de\s+([^\n.;]{4,160})/i,
    ],
    texts,
  );
  const plaintiff = firstRegexValue(
    [
      /(?:autor(?:a)?|requerente|impugnante)\s*[:\-]\s*([^\n.;]{3,140})/i,
      /proposta\s+por\s+([^\n,.;]{3,140})/i,
      /(?:exequente|embargante|reclamante|impetrante)\s*[:\-]\s*([^\n.;]{3,140})/i,
    ],
    texts,
  );
  const defendant = firstRegexValue(
    [
      /(?:r[ée]u|requerid[oa]|demandad[oa])\s*[:\-]\s*([^\n.;]{3,140})/i,
      /em\s+face\s+de\s+([^\n,.;]{3,140})/i,
      /(?:executad[oa]|embargad[oa]|reclamad[oa]|autoridad[ea]\s+coatora)\s*[:\-]\s*([^\n.;]{3,140})/i,
    ],
    texts,
  );

  const rite = inferRiteFromTexts(texts);
  const legalArea = inferLegalAreaFromTexts(texts);

  const regexMetadata: ExtractedCaseMetadata = {
    number,
    court,
    plaintiff,
    defendant,
    client: defendant,
    rite,
    legalArea,
  };

  if (hasCriticalMetadata(regexMetadata)) {
    return regexMetadata;
  }

  const aiMetadata = await extractCaseMetadataWithGemini(texts);
  return {
    number: regexMetadata.number || aiMetadata.number,
    court: regexMetadata.court || aiMetadata.court,
    plaintiff: regexMetadata.plaintiff || aiMetadata.plaintiff,
    defendant: regexMetadata.defendant || aiMetadata.defendant,
    client: regexMetadata.client || aiMetadata.client || aiMetadata.defendant,
    rite: regexMetadata.rite || aiMetadata.rite,
    legalArea: regexMetadata.legalArea || aiMetadata.legalArea,
  };
}

function buildCaseMetadataDiagnostics(
  summary: Awaited<ReturnType<typeof ingestKnowledgeSources>> | undefined,
): CaseMetadataDiagnostics {
  const items = summary?.items ?? [];
  const totalCaseFiles = items.length;
  const emptyTextFileNames = items
    .filter((item) => item.textLength === 0)
    .map((item) => item.fileName);
  const emptyTextFiles = emptyTextFileNames.length;
  const extractedTextFiles = Math.max(0, totalCaseFiles - emptyTextFiles);
  const likelyScannedPdf =
    totalCaseFiles > 0 &&
    items.every((item) => item.extension.toLowerCase() === ".pdf") &&
    emptyTextFiles === totalCaseFiles;

  return {
    totalCaseFiles,
    extractedTextFiles,
    emptyTextFiles,
    likelyScannedPdf,
    emptyTextFileNames,
  };
}

function getGeminiRuntimeStatus(): {
  configured: boolean;
  runtime: "online" | "not_configured" | "quota_exceeded";
  lastIssue?: string;
} {
  const configured = Boolean(process.env.GEMINI_API_KEY);
  if (!configured) {
    return { configured, runtime: "not_configured" };
  }

  const recentFailure = apiLogs.find((entry) => {
    const event = String(entry.event ?? "");
    if (!event.endsWith("_failed")) {
      return false;
    }

    const errorText = String(entry.error ?? "").toLowerCase();
    return /429|resource_exhausted|quota exceeded/.test(errorText);
  });

  if (recentFailure) {
    return {
      configured,
      runtime: "quota_exceeded",
      lastIssue: String(recentFailure.error ?? ""),
    };
  }

  return { configured, runtime: "online" };
}

app.get("/api/health", (_req, res) => {
  pushLog("healthcheck", {});
  const gemini = getGeminiRuntimeStatus();
  res.json({
    status: "ok",
    service: "legal-ai-factory-local-api",
    geminiConfigured: gemini.configured,
    geminiRuntime: gemini.runtime,
    geminiLastIssue: gemini.lastIssue,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/logs", (_req, res) => {
  res.json({ total: apiLogs.length, items: apiLogs });
});

app.post("/api/ingest", async (req, res) => {
  try {
    const scopedSourceDir = resolveInOriginalDir(req.body?.sourceSubdir);
    if (!scopedSourceDir) {
      res.status(400).json({ error: "sourceSubdir invalido" });
      return;
    }

    const summaries: Array<Awaited<ReturnType<typeof ingestKnowledgeSources>>> = [];
    const scopedSummary = await ingestKnowledgeSources({
      sourceDir: scopedSourceDir,
      processedDir: KNOWLEDGE_PROCESSED,
      metadataDir: KNOWLEDGE_METADATA,
    });
    summaries.push(scopedSummary);

    let referenceBaseRefreshed = false;
    let referenceBaseSkippedAsCached = false;

    if (path.resolve(scopedSourceDir) !== path.resolve(KNOWLEDGE_NOTEBOOKLM)) {
      const decision = await shouldRefreshReferenceBase();
      if (decision.refresh) {
        const notebookSummary = await ingestKnowledgeSources({
          sourceDir: KNOWLEDGE_NOTEBOOKLM,
          processedDir: KNOWLEDGE_PROCESSED,
          metadataDir: KNOWLEDGE_METADATA,
        });
        summaries.push(notebookSummary);
        await markReferenceBaseIngested(decision.signature);
        referenceBaseRefreshed = true;
      } else {
        referenceBaseSkippedAsCached = true;
      }
    }

    const summary = mergeIngestionSummaries(summaries);
    const caseMetadata = await extractCaseMetadataFromSummary(scopedSummary);
    const caseMetadataDiagnostics = buildCaseMetadataDiagnostics(scopedSummary);

    pushLog("ingestion_completed", {
      sourceDir: toPosixPath(path.relative(ROOT, scopedSourceDir)),
      includedReferenceBase: toPosixPath(path.relative(ROOT, KNOWLEDGE_NOTEBOOKLM)),
      referenceBaseRefreshed,
      referenceBaseSkippedAsCached,
      total: summary.total,
      processed: summary.processed,
      errors: summary.errors,
    });
    res.json({
      ...summary,
      caseMetadata,
      caseMetadataDiagnostics,
      referenceBaseRefreshed,
      referenceBaseSkippedAsCached,
    });
  } catch (error) {
    pushLog("ingestion_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro de ingestao desconhecido",
    });
  }
});

app.get("/api/sources/folder-cases", async (_req, res) => {
  try {
    await fs.mkdir(KNOWLEDGE_ORIGINAL, { recursive: true });
    const files = await listFilesRecursively(KNOWLEDGE_ORIGINAL);
    const folders = new Map<string, Array<{ name: string; size: string; type: string; relativePath: string }>>();

    for (const filePath of files) {
      const folderPath = path.dirname(filePath);
      const relativeFolder = toPosixPath(path.relative(KNOWLEDGE_ORIGINAL, folderPath));
      const relativeFile = toPosixPath(path.relative(KNOWLEDGE_ORIGINAL, filePath));
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase().replace(".", "");
      const entry = {
        name: path.basename(filePath),
        size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
        type: extension || "txt",
        relativePath: relativeFile,
      };

      const bucket = folders.get(relativeFolder) ?? [];
      bucket.push(entry);
      folders.set(relativeFolder, bucket);
    }

    const items = [...folders.entries()]
      .filter(([relativePath, folderFiles]) => {
        if (folderFiles.length === 0) {
          return false;
        }

        return !isNotebooklmReferencePath(relativePath);
      })
      .map(([relativePath, folderFiles]) => ({
        id: relativePath || "root",
        displayName: relativePath ? path.basename(relativePath) : "Raiz",
        relativePath,
        fileCount: folderFiles.length,
        files: folderFiles,
      }))
      .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    res.json({ total: items.length, items });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao listar casos por pasta",
    });
  }
});

app.post("/api/skill/architecture", async (req, res) => {
  try {
    const { caseData, options } = req.body;
    const outline = await generateArchitecture(caseData, {
      mode: options?.mode === "real" ? "real" : "mock",
      simulatedData: options?.simulatedData !== false,
    });

    pushLog("architecture_generated", { caseId: caseData?.id, chapters: outline.length, mode: options?.mode ?? "mock" });
    res.json({ outline });
  } catch (error) {
    pushLog("architecture_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao gerar arquitetura",
    });
  }
});

app.post("/api/skill/draft", async (req, res) => {
  try {
    const { caseData, chapter, options } = req.body;
    const draftedContent = await draftChapter(caseData, chapter, {
      mode: options?.mode === "real" ? "real" : "mock",
      simulatedData: options?.simulatedData !== false,
    });

    pushLog("chapter_drafted", { caseId: caseData?.id, chapterId: chapter?.id, mode: options?.mode ?? "mock" });
    res.json({ draftedContent });
  } catch (error) {
    pushLog("chapter_draft_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao redigir capitulo",
    });
  }
});

app.post("/api/skill/review", async (req, res) => {
  try {
    const { caseData, chapter, content, options } = req.body;
    const fallbackCase = {
      id: "review-case",
      number: "N/A",
      court: "N/A",
      plaintiff: "N/A",
      defendant: "N/A",
      client: "N/A",
    };
    const fallbackChapter = {
      id: "review-chapter",
      title: "Capitulo em revisao",
      sectionType: "merito",
      order: 1,
      content: "",
    };

    const result = await reviewChapter(
      caseData ?? fallbackCase,
      chapter ?? fallbackChapter,
      String(content ?? ""),
      {
        mode: options?.mode === "real" ? "real" : "mock",
        simulatedData: options?.simulatedData !== false,
      },
    );

    pushLog("chapter_reviewed", {
      caseId: (caseData ?? fallbackCase)?.id,
      chapterId: (chapter ?? fallbackChapter)?.id,
      approved: result.approved,
      mode: options?.mode ?? "mock",
    });

    res.json(result);
  } catch (error) {
    pushLog("chapter_review_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao revisar capitulo",
    });
  }
});

app.post("/api/export/docx", async (req, res) => {
  try {
    const { caseData, outline, simulatedData } = req.body;
    const caseId = String(caseData?.id ?? "case-sem-id");
    const outputDir = path.join(ROOT, "knowledge", "cases", caseId, "output");

    const generated = await generateLegalDocx({
      caseData,
      outline,
      outputDir,
      simulatedData: Boolean(simulatedData),
    });

    const buffer = await fs.readFile(generated.filePath);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename=\"${generated.fileName}\"`);
    res.setHeader("X-Output-Path", generated.filePath);
    pushLog("docx_generated", { caseId, outputPath: generated.filePath, simulatedData: Boolean(simulatedData) });
    res.send(buffer);
  } catch (error) {
    pushLog("docx_generation_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao gerar DOCX",
    });
  }
});

app.post("/api/benchmark/run", async (req, res) => {
  try {
    const { caseData, options } = req.body;
    const fallbackCase = {
      id: "benchmark-case",
      number: "0000000-00.0000.0.00.0000",
      court: "Juizo de Benchmark",
      plaintiff: "Autor Benchmark",
      defendant: "Reu Benchmark",
      client: "Cliente Benchmark",
    };

    const report = await runBenchmarkCase(caseData ?? fallbackCase, {
      iterations: Number(options?.iterations ?? 2),
      mode: options?.mode === "real" ? "real" : "mock",
      simulatedData: options?.simulatedData !== false,
      baseline: options?.baseline,
    });

    pushLog("benchmark_completed", {
      caseId: (caseData ?? fallbackCase).id,
      iterations: report.iterations,
      averageMs: report.speed.averageMs,
      precision: report.precision.score,
      consistency: report.consistency.score,
    });

    res.json(report);
  } catch (error) {
    pushLog("benchmark_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao executar benchmark",
    });
  }
});

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[legal-ai-factory] API listening on port ${port}`);
});
