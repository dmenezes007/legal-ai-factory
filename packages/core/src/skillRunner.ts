import path from "node:path";
import { promises as fs } from "node:fs";
import { AIGateway } from "./aiGateway";
import { planCase } from "./planner";
import { compileArchitecturePrompt, compileDraftPrompt, compileReviewPrompt } from "./promptCompiler";
import { runReviewPipeline } from "./reviewEngine";
import type {
  CasePayload,
  KnowledgeObject,
  OutlineItemPayload,
  ReviewResult,
  SkillExecutionOptions,
} from "./types";

function buildDefaultArchitecture(caseData: CasePayload): OutlineItemPayload[] {
  const now = new Date().toLocaleDateString("pt-BR");
  return [
    {
      id: "cap-1",
      title: "1. PREÂMBULO E QUALIFICAÇÃO",
      sectionType: "preambulo",
      order: 1,
      content: `Contestacao apresentada por ${caseData.defendant} em face de ${caseData.plaintiff}, no processo ${caseData.number}, perante ${caseData.court}.`,
    },
    {
      id: "cap-2",
      title: "2. SÍNTESE DA INICIAL E DELIMITAÇÃO DA CONTROVÉRSIA",
      sectionType: "resumo",
      order: 2,
      content: "Resumo objetivo da inicial com delimitacao dos pontos efetivamente controvertidos.",
    },
    {
      id: "cap-3",
      title: "3. QUESTÕES PRELIMINARES E PROCESSUAIS",
      sectionType: "preliminares",
      order: 3,
      content: "Analise das preliminares processuais aplicaveis para extinguir, limitar ou reorganizar o julgamento.",
    },
    {
      id: "cap-4",
      title: "4. MÉRITO - FUNDAMENTAÇÃO DA DEFESA",
      sectionType: "merito",
      order: 4,
      content: "Desenvolvimento dos argumentos de merito com base nas fontes validadas do caso.",
    },
    {
      id: "cap-5",
      title: "5. PREQUESTIONAMENTO QUALIFICADO",
      sectionType: "prequestionamento",
      order: 5,
      content: "Registro dos fundamentos infraconstitucionais e constitucionais relevantes para eventual fase recursal.",
    },
    {
      id: "cap-6",
      title: "6. PEDIDOS FINAIS E REQUERIMENTOS",
      sectionType: "requerimentos",
      order: 6,
      content: `Diante do exposto, requer-se a improcedencia dos pedidos autorais. Local e data: ${now}.`,
    },
  ];
}

const NOTEBOOKLM_SKILL_PATH = path.join(
  process.cwd(),
  "knowledge",
  "sources",
  "original",
  "notebooklm",
  "skills",
  "SKILL.txt",
);

async function loadNotebooklmSkillContent(): Promise<string> {
  try {
    const raw = await fs.readFile(NOTEBOOKLM_SKILL_PATH, "utf8");
    const normalized = raw.trim();
    if (normalized.length > 0) {
      return normalized;
    }
  } catch {
    // fallback below
  }

  return "Diretriz padrão: utilizar as instruções jurídicas da base notebooklm/skills/SKILL.txt como referência mandatória para estrutura, tom e estratégia da defesa.";
}

async function buildKnowledgeObjects(caseData: CasePayload): Promise<KnowledgeObject[]> {
  const notebooklmSkill = await loadNotebooklmSkillContent();

  return [
    {
      id: "k-skill-base-1",
      kind: "strategy",
      title: "Skill padrão obrigatório (notebooklm/skills/SKILL.txt)",
      content: notebooklmSkill,
    },
    {
      id: "k-facts-1",
      kind: "facts",
      title: "Fatos centrais do processo",
      content: `Processo ${caseData.number} envolvendo ${caseData.plaintiff} versus ${caseData.defendant}.`,
    },
    {
      id: "k-strategy-1",
      kind: "strategy",
      title: "Diretriz de estrategia",
      content: "Priorizar improcedencia com pedidos subsidiarios proporcionais.",
    },
    {
      id: "k-thesis-1",
      kind: "thesis",
      title: "Tese base",
      content: "Ausencia de nexo causal e necessidade de prova robusta.",
    },
  ];
}

function normalizeOutlineItem(item: any, index: number): OutlineItemPayload {
  return {
    id: String(item.id ?? `cap-${index + 1}`),
    title: String(item.title ?? `Capitulo ${index + 1}`),
    sectionType: String(item.sectionType ?? "merito"),
    order: Number(item.order ?? index + 1),
    content: String(item.content ?? ""),
  };
}

export async function generateArchitecture(caseData: CasePayload, options: SkillExecutionOptions): Promise<OutlineItemPayload[]> {
  const knowledgeObjects = await buildKnowledgeObjects(caseData);
  const planner = planCase(caseData, knowledgeObjects);
  const fallbackOutline = planner.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    sectionType: chapter.sectionType,
    order: chapter.order,
    content: `${chapter.objective} Tese sugerida: ${chapter.recommendedThesis}`,
  }));

  const gateway = new AIGateway();
  const prompt = compileArchitecturePrompt({ caseData, plan: planner, knowledgeObjects });
  const response = await gateway.execute(
    {
      task: "architecture",
      provider: "gemini",
      prompt,
      outputFormat: "json",
    },
    options,
  );

  try {
    const parsed = JSON.parse(response.text ?? "[]");
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeOutlineItem);
    }
  } catch {
    // fallback below
  }

  return fallbackOutline.length > 0 ? fallbackOutline : buildDefaultArchitecture(caseData);
}

export async function draftChapter(
  caseData: CasePayload,
  chapter: OutlineItemPayload,
  options: SkillExecutionOptions,
): Promise<string> {
  const knowledgeObjects = await buildKnowledgeObjects(caseData);
  const planner = planCase(caseData, knowledgeObjects);
  const planChapter = planner.chapters.find((item) => item.id === chapter.id || item.order === chapter.order);
  const gateway = new AIGateway();
  const prompt = compileDraftPrompt({ caseData, chapter, planChapter, knowledgeObjects });

  const response = await gateway.execute(
    {
      task: "draft",
      provider: "gemini",
      prompt,
      outputFormat: "text",
    },
    options,
  );

  const rawText =
    response.text && response.text.trim().length > 20
      ? response.text.trim()
      : `${chapter.title}\n\nConsiderando os elementos do caso ${caseData.number}, apresenta-se fundamentacao defensiva estruturada para o capitulo "${chapter.title}".`;

  return runReviewPipeline(rawText).reviewedContent;
}

export async function reviewChapter(
  caseData: CasePayload,
  chapter: OutlineItemPayload,
  content: string,
  options: SkillExecutionOptions,
): Promise<ReviewResult> {
  const gateway = new AIGateway();
  const prompt = compileReviewPrompt({ caseData, chapter, content });

  const response = await gateway.execute(
    {
      task: "review",
      provider: "gemini",
      prompt,
      outputFormat: "text",
    },
    options,
  );

  const baseReview = runReviewPipeline(content);
  if (response.text && response.text.trim().length > 20) {
    return runReviewPipeline(response.text);
  }

  return baseReview;
}
