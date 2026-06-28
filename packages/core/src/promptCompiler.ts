import type { CasePayload, ChapterPlan, CompiledPrompt, KnowledgeObject, OutlineItemPayload, PlannerResult } from "./types";

interface CompileArchitectureInput {
  caseData: CasePayload;
  plan: PlannerResult;
  knowledgeObjects: KnowledgeObject[];
}

interface CompileDraftInput {
  caseData: CasePayload;
  chapter: OutlineItemPayload;
  planChapter: ChapterPlan | undefined;
  knowledgeObjects: KnowledgeObject[];
}

interface CompileReviewInput {
  caseData: CasePayload;
  chapter: OutlineItemPayload;
  content: string;
}

export function compileArchitecturePrompt(input: CompileArchitectureInput): CompiledPrompt {
  return {
    system:
      "Voce e um arquiteto juridico. Gere somente JSON valido com capitulos de contestacao no padrao brasileiro formal.",
    user: JSON.stringify(
      {
        objective: "Gerar outline completo da contestacao em ordem estrategica, alinhado ao SKILL central (preambulo, sintese, delimitacao, preliminares, merito, prequestionamento e pedidos finais).",
        caseData: input.caseData,
        plannerChapters: input.plan.chapters,
        knowledgeObjects: input.knowledgeObjects,
        schema: {
          id: "string",
          title: "string",
          sectionType: "string",
          order: "number",
          content: "string",
        },
      },
      null,
      2,
    ),
    metadata: { task: "architecture" },
  };
}

export function compileDraftPrompt(input: CompileDraftInput): CompiledPrompt {
  return {
    system:
      "Voce redige pecas defensivas em portugues juridico formal do Brasil, com coesao argumentativa e foco em improcedencia tecnica.",
    user: JSON.stringify(
      {
        objective: "Redigir capitulo completo da contestacao.",
        caseData: input.caseData,
        chapter: input.chapter,
        planHints: input.planChapter,
        knowledgeObjects: input.knowledgeObjects,
        constraints: [
          "Evite invencao factual.",
          "Use linguagem tecnica, direta e sem repeticao excessiva.",
          "Conecte fundamentos normativos ao pedido final.",
        ],
      },
      null,
      2,
    ),
    metadata: { task: "draft" },
  };
}

export function compileReviewPrompt(input: CompileReviewInput): CompiledPrompt {
  return {
    system:
      "Voce revisa textos juridicos por quatro lentes: juridica, linguistica, estrutural e estrategica. Responda em texto objetivo.",
    user: JSON.stringify(
      {
        objective: "Revisar capitulo e devolver versao aprimorada.",
        caseData: input.caseData,
        chapter: input.chapter,
        content: input.content,
      },
      null,
      2,
    ),
    metadata: { task: "review" },
  };
}
