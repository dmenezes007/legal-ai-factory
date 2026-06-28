import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import express from "express";
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
const KNOWLEDGE_PROCESSED = path.join(ROOT, "knowledge", "sources", "processed");
const KNOWLEDGE_METADATA = path.join(ROOT, "knowledge", "sources", "metadata");
const SUPPORTED_EXTENSIONS = new Set([".txt", ".md", ".pdf", ".docx"]);

function toPosixPath(rawPath: string): string {
  return rawPath.replace(/\\/g, "/");
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

app.get("/api/health", (_req, res) => {
  pushLog("healthcheck", {});
  res.json({
    status: "ok",
    service: "legal-ai-factory-local-api",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
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

    const summary = await ingestKnowledgeSources({
      sourceDir: scopedSourceDir,
      processedDir: KNOWLEDGE_PROCESSED,
      metadataDir: KNOWLEDGE_METADATA,
    });

    pushLog("ingestion_completed", {
      sourceDir: toPosixPath(path.relative(ROOT, scopedSourceDir)),
      total: summary.total,
      processed: summary.processed,
      errors: summary.errors,
    });
    res.json(summary);
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
      .filter(([, folderFiles]) => folderFiles.length > 0)
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
