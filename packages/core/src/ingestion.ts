import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import { classifySource } from "./classifier";
import type { IngestionResult, IngestionSummary } from "./types";

const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".docx"]);

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
      return { text: parsed.text?.trim() ?? "", warnings, extracted: true };
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

export async function ingestKnowledgeSources(paths: IngestionPaths): Promise<IngestionSummary> {
  await fs.mkdir(paths.sourceDir, { recursive: true });
  await fs.mkdir(paths.processedDir, { recursive: true });
  await fs.mkdir(paths.metadataDir, { recursive: true });

  const files = await listFilesRecursively(paths.sourceDir);
  const candidates = files.filter((file) => SUPPORTED_EXTENSIONS.has(path.extname(file).toLowerCase()));

  const items: IngestionResult[] = [];

  for (const filePath of candidates) {
    const id = randomUUID();
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();

    const { text, warnings, extracted } = await extractText(filePath);
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
          sourcePath: filePath,
          processedPath,
          createdAt: new Date().toISOString(),
          textLength: text.length,
        },
        null,
        2,
      ),
      "utf8",
    );

    items.push({
      id,
      originalPath: filePath,
      processedPath,
      metadataPath,
      fileName,
      extension,
      category,
      textLength: text.length,
      extracted,
      extractionWarnings: warnings,
    });
  }

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
