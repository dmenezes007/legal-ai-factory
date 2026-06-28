import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { chromium, firefox, type BrowserContext, type BrowserType, type Page } from "@playwright/test";
import { generateLegalDocx } from "../../../packages/core/src/docxGenerator";
import type { CasePayload, OutlineItemPayload } from "../../../packages/core/src/types";

interface CliArgs {
  caseId: string;
  notebookUrl?: string;
  notebookName?: string;
  skillFile: string;
  outputRoot: string;
  maxSteps?: number;
  browser: "chrome" | "edge" | "chromium" | "firefox";
  userDataDir: string;
}

interface SkillCommand {
  step: number;
  title: string;
  prompt: string;
}

interface NotebookResponseCapture {
  step: number;
  title: string;
  prompt: string;
  response: string;
  capturedAt: string;
}

interface NotebookRunOutput {
  caseId: string;
  notebookUrl: string;
  notebookName?: string;
  skillFile: string;
  startedAt: string;
  completedAt: string;
  responses: NotebookResponseCapture[];
  notes: string[];
  generatedDocx?: {
    filePath: string;
    fileName: string;
  };
}

const DEFAULT_SKILL_FILE = path.join(
  process.cwd(),
  "knowledge",
  "sources",
  "original",
  "notebooklm",
  "skills",
  "SKILL.txt",
);

const DEFAULT_USER_DATA_DIR = path.join(process.cwd(), ".notebooklm-assistant", "profile");

function parseArgs(rawArgs: string[]): CliArgs {
  const map = new Map<string, string>();
  for (let i = 0; i < rawArgs.length; i += 1) {
    const token = rawArgs[i];
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = rawArgs[i + 1] && !rawArgs[i + 1].startsWith("--") ? rawArgs[i + 1] : "true";
    map.set(key, value);

    if (value !== "true") {
      i += 1;
    }
  }

  const caseId = map.get("case-id")?.trim() || `case-${Date.now()}`;
  const notebookUrl = map.get("notebook-url")?.trim();
  const notebookName = map.get("notebook-name")?.trim();
  const skillFile = map.get("skill-file")?.trim() || DEFAULT_SKILL_FILE;
  const outputRoot = map.get("output-root")?.trim() || path.join(process.cwd(), "knowledge", "cases");
  const maxStepsRaw = map.get("max-steps")?.trim();
  const maxSteps = maxStepsRaw ? Number(maxStepsRaw) : undefined;
  const browserRaw = (map.get("browser")?.trim().toLowerCase() || "chrome") as CliArgs["browser"];
  const browser: CliArgs["browser"] = ["chrome", "edge", "chromium", "firefox"].includes(browserRaw)
    ? browserRaw
    : "chrome";
  const userDataDir = map.get("user-data-dir")?.trim() || DEFAULT_USER_DATA_DIR;

  return {
    caseId,
    notebookUrl,
    notebookName,
    skillFile,
    outputRoot,
    maxSteps: Number.isFinite(maxSteps) ? maxSteps : undefined,
    browser,
    userDataDir,
  };
}

async function createPersistentContext(args: CliArgs): Promise<BrowserContext> {
  await fs.mkdir(args.userDataDir, { recursive: true });

  if (args.browser === "firefox") {
    return firefox.launchPersistentContext(args.userDataDir, {
      headless: false,
      viewport: null,
    });
  }

  const browserType: BrowserType = chromium;
  const channel =
    args.browser === "edge"
      ? "msedge"
      : args.browser === "chrome"
      ? "chrome"
      : undefined;

  return browserType.launchPersistentContext(args.userDataDir, {
    headless: false,
    channel,
    viewport: null,
  });
}

function normalizePromptLine(line: string): string {
  return line
    .replace(/^\s*[-*]\s*/, "")
    .replace(/^\s*\d+[.)-]?\s*/, "")
    .trim();
}

async function loadSkillCommands(skillFile: string, maxSteps?: number): Promise<SkillCommand[]> {
  const raw = await fs.readFile(skillFile, "utf8");
  const lines = raw.split(/\r?\n/g).map((line) => line.trim()).filter(Boolean);

  const selected: string[] = [];
  for (const line of lines) {
    const normalized = normalizePromptLine(line);
    if (normalized.length < 30) {
      continue;
    }

    if (/^(VERS[AÃ]O|STATUS|ESCOPO|SKILL|OBJETIVO|REGRA)/i.test(normalized)) {
      continue;
    }

    if (/[.;:]$/.test(normalized) || normalized.includes("deve") || normalized.includes("contestar")) {
      selected.push(normalized);
    }
  }

  const deduped = [...new Set(selected)].slice(0, maxSteps ?? 8);
  if (deduped.length > 0) {
    return deduped.map((prompt, index) => ({
      step: index + 1,
      title: `Etapa ${index + 1}`,
      prompt,
    }));
  }

  const fallbackPrompts = [
    "Com base nas fontes carregadas, gere o diagnóstico do caso com vulnerabilidades da narrativa autoral e riscos da defesa.",
    "Monte a arquitetura completa da contestação com capítulos em ordem estratégica e objetivo processual de cada capítulo.",
    "Redija o capítulo de preliminares processuais, com linguagem técnica e impugnação específica.",
    "Redija o capítulo de mérito com tese principal e tese subsidiária, conectando provas, normas e pedidos.",
    "Redija os pedidos finais completos, incluindo improcedência, subsidiários, provas e sucumbência.",
  ];

  return fallbackPrompts.slice(0, maxSteps ?? 5).map((prompt, index) => ({
    step: index + 1,
    title: `Etapa ${index + 1}`,
    prompt,
  }));
}

function findComposer(page: Page) {
  const selectors = [
    'textarea[placeholder*="Pergunte"]',
    'textarea[placeholder*="Ask"]',
    'textarea[aria-label*="Pergunte"]',
    'textarea[aria-label*="Ask"]',
    'textarea',
  ];

  return {
    async fillPrompt(prompt: string): Promise<boolean> {
      for (const selector of selectors) {
        const locator = page.locator(selector).first();
        if ((await locator.count()) === 0) {
          continue;
        }

        try {
          await locator.click({ timeout: 1200 });
          await locator.fill(prompt);
          return true;
        } catch {
          // tenta o proximo seletor
        }
      }

      return false;
    },
  };
}

async function submitPrompt(page: Page): Promise<void> {
  const submitSelectors = [
    'button:has-text("Enviar")',
    'button:has-text("Send")',
    'button[aria-label*="Enviar"]',
    'button[aria-label*="Send"]',
  ];

  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if ((await button.count()) === 0) {
      continue;
    }

    try {
      await button.click({ timeout: 1200 });
      return;
    } catch {
      // fallback para Enter
    }
  }

  await page.keyboard.press("Enter");
}

async function readLatestResponseText(page: Page): Promise<string> {
  const responseSelectors = [
    'main article',
    '[data-testid*="response"]',
    '[class*="response"]',
    '[role="article"]',
  ];

  for (const selector of responseSelectors) {
    const nodes = page.locator(selector);
    const count = await nodes.count();
    if (count === 0) {
      continue;
    }

    for (let i = count - 1; i >= 0; i -= 1) {
      const text = (await nodes.nth(i).innerText().catch(() => "")).trim();
      if (text.length >= 80) {
        return text;
      }
    }
  }

  return "";
}

async function waitForResponseStable(page: Page): Promise<string> {
  let previous = "";
  let stableRounds = 0;

  for (let attempt = 0; attempt < 90; attempt += 1) {
    await page.waitForTimeout(2000);
    const current = await readLatestResponseText(page);

    if (!current) {
      continue;
    }

    if (current === previous) {
      stableRounds += 1;
      if (stableRounds >= 2) {
        return current;
      }
    } else {
      previous = current;
      stableRounds = 0;
    }
  }

  return previous;
}

async function trySelectNotebook(page: Page, notebookName?: string, notebookUrl?: string): Promise<void> {
  if (notebookUrl) {
    await page.goto(notebookUrl, { waitUntil: "domcontentloaded" });
    return;
  }

  await page.goto("https://notebooklm.google.com/", { waitUntil: "domcontentloaded" });
  if (!notebookName) {
    return;
  }

  const candidates = [
    page.getByRole("link", { name: notebookName }).first(),
    page.getByRole("button", { name: notebookName }).first(),
    page.getByText(notebookName, { exact: false }).first(),
  ];

  for (const locator of candidates) {
    if ((await locator.count()) === 0) {
      continue;
    }

    try {
      await locator.click({ timeout: 2000 });
      return;
    } catch {
      // segue fallback
    }
  }
}

function toOutline(responses: NotebookResponseCapture[]): OutlineItemPayload[] {
  return responses.map((item) => ({
    id: `nb-step-${item.step}`,
    title: `${item.step}. ${item.title}`,
    sectionType: "merito",
    order: item.step,
    content: item.response,
  }));
}

function toCasePayload(caseId: string): CasePayload {
  return {
    id: caseId,
    number: "N/A",
    court: "Juízo a definir",
    plaintiff: "Parte autora",
    defendant: "Parte ré",
    client: "Cliente",
  };
}

async function run(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const rl = createInterface({ input, output });
  const notes: string[] = [];

  try {
    const commands = await loadSkillCommands(args.skillFile, args.maxSteps);
    const startedAt = new Date().toISOString();

    const context = await createPersistentContext(args);
    const page = await context.newPage();

    await trySelectNotebook(page, args.notebookName, args.notebookUrl);
    await page.bringToFront();

    await rl.question(
      "Confirme no navegador se o notebook correto está aberto (ou crie um novo), depois pressione Enter para continuar. ",
    );
    await rl.question(
      "Confirme se as fontes do caso estão carregadas e selecionadas no NotebookLM, depois pressione Enter para iniciar a execução da skill. ",
    );

    const responses: NotebookResponseCapture[] = [];
    for (const command of commands) {
      const override = await rl.question(
        `Etapa ${command.step}: pressione Enter para usar prompt padrão, ou digite um prompt alternativo. `,
      );
      const effectivePrompt = override.trim().length > 0 ? override.trim() : command.prompt;

      const composer = findComposer(page);
      const filled = await composer.fillPrompt(effectivePrompt);
      if (!filled) {
        notes.push(`Etapa ${command.step}: campo de prompt não encontrado automaticamente; entrada manual necessária.`);
        await rl.question(
          `Não localizei o campo de prompt com segurança. Cole o prompt manualmente no NotebookLM e envie. Depois pressione Enter para capturar a resposta. `,
        );
      } else {
        await submitPrompt(page);
      }

      const response = await waitForResponseStable(page);
      if (!response) {
        notes.push(`Etapa ${command.step}: resposta não detectada automaticamente.`);
        const manual = await rl.question(
          `Resposta da etapa ${command.step} não capturada automaticamente. Cole aqui manualmente (ou deixe vazio): `,
        );
        responses.push({
          step: command.step,
          title: command.title,
          prompt: effectivePrompt,
          response: manual.trim(),
          capturedAt: new Date().toISOString(),
        });
        continue;
      }

      responses.push({
        step: command.step,
        title: command.title,
        prompt: effectivePrompt,
        response,
        capturedAt: new Date().toISOString(),
      });

      const continueAnswer = await rl.question(
        `Etapa ${command.step} capturada (${response.length} chars). Pressione Enter para continuar, ou digite "parar" para finalizar. `,
      );
      if (continueAnswer.trim().toLowerCase() === "parar") {
        notes.push(`Execução interrompida manualmente após etapa ${command.step}.`);
        break;
      }
    }

    const caseDir = path.join(args.outputRoot, args.caseId);
    await fs.mkdir(caseDir, { recursive: true });

    const outputJson: NotebookRunOutput = {
      caseId: args.caseId,
      notebookUrl: page.url(),
      notebookName: args.notebookName,
      skillFile: args.skillFile,
      startedAt,
      completedAt: new Date().toISOString(),
      responses,
      notes,
    };

    const responsesPath = path.join(caseDir, "notebooklm-responses.json");
    await fs.writeFile(responsesPath, JSON.stringify(outputJson, null, 2), "utf8");

    if (responses.length > 0) {
      const outputDir = path.join(caseDir, "output");
      const generated = await generateLegalDocx({
        caseData: toCasePayload(args.caseId),
        outline: toOutline(responses),
        outputDir,
        simulatedData: true,
      });
      outputJson.generatedDocx = generated;
      await fs.writeFile(responsesPath, JSON.stringify(outputJson, null, 2), "utf8");
    }

    await context.close();

    output.write("\nExecução concluída.\n");
    output.write(`Arquivo JSON: ${path.join(caseDir, "notebooklm-responses.json")}\n`);
    if (outputJson.generatedDocx) {
      output.write(`DOCX gerado: ${outputJson.generatedDocx.filePath}\n`);
    }
  } finally {
    rl.close();
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`[notebooklm-assistant] Falha: ${message}`);
  process.exit(1);
});
