import type { CasePayload, KnowledgeObject, PlannerResult } from "./types";

function findKnowledgeIds(knowledgeObjects: KnowledgeObject[], kind: KnowledgeObject["kind"]): string[] {
  return knowledgeObjects.filter((item) => item.kind === kind).map((item) => item.id);
}

export function planCase(caseData: CasePayload, knowledgeObjects: KnowledgeObject[]): PlannerResult {
  const evidenceIds = findKnowledgeIds(knowledgeObjects, "evidence");
  const thesisIds = findKnowledgeIds(knowledgeObjects, "thesis");
  const strategyIds = findKnowledgeIds(knowledgeObjects, "strategy");

  return {
    chapters: [
      {
        id: "cap-1",
        title: "1. SÍNTESE DA DEMANDA",
        sectionType: "resumo",
        order: 1,
        objective: `Resumir os pedidos e a narrativa central do processo ${caseData.number}.`,
        recommendedThesis: "Contextualizacao fatico-processual com recorte objetivo.",
        sourceKnowledgeIds: evidenceIds,
      },
      {
        id: "cap-2",
        title: "2. PRELIMINARES E QUESTOES PROCESSUAIS",
        sectionType: "preliminares",
        order: 2,
        objective: "Identificar materias processuais capazes de extinguir, limitar ou reorganizar o julgamento.",
        recommendedThesis: "Preliminares de admissibilidade e competencias.",
        sourceKnowledgeIds: [...strategyIds, ...thesisIds],
      },
      {
        id: "cap-3",
        title: "3. MERITO - FUNDAMENTACAO DA DEFESA",
        sectionType: "merito",
        order: 3,
        objective: "Consolidar a tese defensiva com base em documentos e normativos aplicaveis.",
        recommendedThesis: "Ausencia de nexo causal, improcedencia e proporcionalidade.",
        sourceKnowledgeIds: [...evidenceIds, ...thesisIds],
      },
      {
        id: "cap-4",
        title: "4. PEDIDOS FINAIS",
        sectionType: "requerimentos",
        order: 4,
        objective: "Fechar a peca com pedidos claros, graduados e alinhados ao risco processual.",
        recommendedThesis: "Improcedencia integral com pedidos subsidiarios calibrados.",
        sourceKnowledgeIds: [...strategyIds, ...thesisIds],
      },
    ],
  };
}
