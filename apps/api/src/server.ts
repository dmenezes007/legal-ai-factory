import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import express from "express";
import {
  draftChapter,
  generateArchitecture,
  generateLegalDocx,
  ingestKnowledgeSources,
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

app.post("/api/ingest", async (_req, res) => {
  try {
    const summary = await ingestKnowledgeSources({
      sourceDir: KNOWLEDGE_ORIGINAL,
      processedDir: KNOWLEDGE_PROCESSED,
      metadataDir: KNOWLEDGE_METADATA,
    });

    pushLog("ingestion_completed", { total: summary.total, processed: summary.processed, errors: summary.errors });
    res.json(summary);
  } catch (error) {
    pushLog("ingestion_failed", { error: error instanceof Error ? error.message : "unknown" });
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro de ingestao desconhecido",
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

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[legal-ai-factory] API listening on port ${port}`);
});
