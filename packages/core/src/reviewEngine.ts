import type { ReviewResult, ReviewStageResult } from "./types";

function normalizeContent(content: string): string {
  return content
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .trim();
}

function stage(name: ReviewStageResult["stage"], passed: boolean, findings: string[]): ReviewStageResult {
  return { stage: name, passed, findings };
}

export function runReviewPipeline(content: string): ReviewResult {
  const reviewedContent = normalizeContent(content);
  const lower = reviewedContent.toLowerCase();

  const juridicoFindings: string[] = [];
  if (!/art\.|c[oó]digo|jurisprud|s[úu]mula/i.test(reviewedContent)) {
    juridicoFindings.push("Texto sem referencia normativa explicita; considere incluir base legal aplicavel.");
  }

  const linguisticoFindings: string[] = [];
  if (/(\!\!|\?\?|\s{2,})/.test(reviewedContent)) {
    linguisticoFindings.push("Ajustar pontuacao e consistencia de espacos para maior formalidade.");
  }

  const estruturalFindings: string[] = [];
  if (reviewedContent.length < 240) {
    estruturalFindings.push("Capitulo curto para uso em peca real; ampliar fundamentacao e transicoes.");
  }

  const estrategicoFindings: string[] = [];
  if (!/improced|subsidi[áa]ri|requer/i.test(lower)) {
    estrategicoFindings.push("Conclusao estrategica fraca; explicitar pedido principal e subsidiario.");
  }

  const stages: ReviewStageResult[] = [
    stage("juridico", juridicoFindings.length === 0, juridicoFindings),
    stage("linguistico", linguisticoFindings.length === 0, linguisticoFindings),
    stage("estrutural", estruturalFindings.length === 0, estruturalFindings),
    stage("estrategico", estrategicoFindings.length === 0, estrategicoFindings),
  ];

  return {
    approved: stages.every((item) => item.passed),
    reviewedContent,
    stages,
  };
}
