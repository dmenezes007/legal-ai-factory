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
      title: "1. SÍNTESE DA DEMANDA",
      sectionType: "resumo",
      order: 1,
      content: `A presente contestacao responde aos pedidos formulados por ${caseData.plaintiff} em face de ${caseData.defendant}, no processo ${caseData.number}.`,
    },
    {
      id: "cap-2",
      title: "2. PRELIMINARES E QUESTOES PROCESSUAIS",
      sectionType: "preliminares",
      order: 2,
      content: "Analise das preliminares aplicaveis conforme os documentos e as regras processuais pertinentes.",
    },
    {
      id: "cap-3",
      title: "3. MERITO - FUNDAMENTACAO DA DEFESA",
      sectionType: "merito",
      order: 3,
      content: "Desenvolvimento dos argumentos de merito com base nas fontes validadas do caso.",
    },
    {
      id: "cap-4",
      title: "4. PEDIDOS FINAIS",
      sectionType: "requerimentos",
      order: 4,
      content: `Diante do exposto, requer-se a improcedencia dos pedidos autorais. Local e data: ${now}.`,
    },
  ];
}

function buildKnowledgeObjects(caseData: CasePayload): KnowledgeObject[] {
  return [
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
  const knowledgeObjects = buildKnowledgeObjects(caseData);
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
  const knowledgeObjects = buildKnowledgeObjects(caseData);
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
