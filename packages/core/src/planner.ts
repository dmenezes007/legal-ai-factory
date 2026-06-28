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
        title: "1. PREÂMBULO E QUALIFICAÇÃO",
        sectionType: "preambulo",
        order: 1,
        objective: `Formalizar abertura da contestacao no processo ${caseData.number} com qualificacao e enquadramento processual.`,
        recommendedThesis: "Regularidade processual e contextualizacao inicial da defesa.",
        sourceKnowledgeIds: evidenceIds,
      },
      {
        id: "cap-2",
        title: "2. SÍNTESE DA INICIAL E DELIMITAÇÃO DA CONTROVÉRSIA",
        sectionType: "resumo",
        order: 2,
        objective: "Consolidar narrativa autoral, pedidos e pontos efetivos de impugnacao da defesa.",
        recommendedThesis: "Delimitacao objetiva dos pedidos e fatos controvertidos.",
        sourceKnowledgeIds: evidenceIds,
      },
      {
        id: "cap-3",
        title: "3. QUESTÕES PRELIMINARES E PROCESSUAIS",
        sectionType: "preliminares",
        order: 3,
        objective: "Identificar materias processuais capazes de extinguir, limitar ou reorganizar o julgamento.",
        recommendedThesis: "Preliminares de admissibilidade, competencia e limites da demanda.",
        sourceKnowledgeIds: [...strategyIds, ...thesisIds],
      },
      {
        id: "cap-4",
        title: "4. MÉRITO - FUNDAMENTAÇÃO DA DEFESA",
        sectionType: "merito",
        order: 4,
        objective: "Consolidar a tese defensiva com base em documentos e normativos aplicaveis.",
        recommendedThesis: "Ausencia de nexo causal, improcedencia e proporcionalidade.",
        sourceKnowledgeIds: [...evidenceIds, ...thesisIds],
      },
      {
        id: "cap-5",
        title: "5. PREQUESTIONAMENTO QUALIFICADO",
        sectionType: "prequestionamento",
        order: 5,
        objective: "Registrar fundamentos infraconstitucionais e constitucionais relevantes para eventual fase recursal.",
        recommendedThesis: "Preservacao tecnica de materia para recursos.",
        sourceKnowledgeIds: [...strategyIds, ...thesisIds],
      },
      {
        id: "cap-6",
        title: "6. PEDIDOS FINAIS E REQUERIMENTOS",
        sectionType: "requerimentos",
        order: 6,
        objective: "Fechar a peca com pedidos claros, graduados e alinhados ao risco processual.",
        recommendedThesis: "Improcedencia integral com pedidos subsidiarios calibrados.",
        sourceKnowledgeIds: [...strategyIds, ...thesisIds],
      },
    ],
  };
}
