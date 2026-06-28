import type { BenchmarkCaseReport, BenchmarkOptions, CasePayload, ReviewResult } from "./types";
import { draftChapter, generateArchitecture, reviewChapter } from "./skillRunner";

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function percentile95(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[index];
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2),
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function precisionScoreFromReview(result: ReviewResult): number {
  const stageWeights: Record<string, number> = {
    juridico: 0.4,
    linguistico: 0.2,
    estrutural: 0.2,
    estrategico: 0.2,
  };

  let score = 0;
  for (const stage of result.stages) {
    const weight = stageWeights[stage.stage] ?? 0;
    score += stage.passed ? weight : 0;
  }

  return clamp(score);
}

function buildRecommendations(report: BenchmarkCaseReport): string[] {
  const recommendations: string[] = [];

  if (report.speed.averageMs > 4000) {
    recommendations.push("Reduzir contexto de entrada por capitulo para melhorar latencia media.");
  }

  if (report.precision.score < 0.75) {
    recommendations.push("Reforcar objetos de conhecimento normativo no Prompt Compiler para elevar precisao juridica.");
  }

  if (report.consistency.score < 0.7) {
    recommendations.push("Fixar estrutura de saida por capitulo e ampliar constraints de estilo para aumentar consistencia.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Manter configuracao atual e monitorar regressao semanal com os mesmos casos de referencia.");
  }

  return recommendations;
}

export async function runBenchmarkCase(caseData: CasePayload, options: BenchmarkOptions): Promise<BenchmarkCaseReport> {
  const iterations = Math.max(1, Math.min(8, options.iterations));
  const architecture = await generateArchitecture(caseData, {
    mode: options.mode,
    simulatedData: options.simulatedData,
  });

  const chapterCount = architecture.length;
  const allDurations: number[] = [];
  const precisionScores: number[] = [];
  let approvedCount = 0;
  const finalDraftsPerChapter = new Map<string, string[]>();

  const benchmarkStart = Date.now();

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (const chapter of architecture) {
      const startedAt = Date.now();
      const draftedContent = await draftChapter(caseData, chapter, {
        mode: options.mode,
        simulatedData: options.simulatedData,
      });

      const review = await reviewChapter(caseData, chapter, draftedContent, {
        mode: options.mode,
        simulatedData: options.simulatedData,
      });

      const elapsed = Date.now() - startedAt;
      allDurations.push(elapsed);
      precisionScores.push(precisionScoreFromReview(review));
      if (review.approved) approvedCount += 1;

      const bucket = finalDraftsPerChapter.get(chapter.id) ?? [];
      bucket.push(review.reviewedContent);
      finalDraftsPerChapter.set(chapter.id, bucket);
    }
  }

  const totalMs = Date.now() - benchmarkStart;
  const averageMs = allDurations.length > 0 ? allDurations.reduce((sum, item) => sum + item, 0) / allDurations.length : 0;
  const p95Ms = percentile95(allDurations);
  const chaptersPerMinute = totalMs > 0 ? (allDurations.length / totalMs) * 60000 : 0;
  const precision = precisionScores.length > 0 ? precisionScores.reduce((sum, item) => sum + item, 0) / precisionScores.length : 0;
  const approvedRate = allDurations.length > 0 ? approvedCount / allDurations.length : 0;

  let consistencyAccumulator = 0;
  let consistencyPairs = 0;
  for (const drafts of finalDraftsPerChapter.values()) {
    for (let i = 0; i < drafts.length; i += 1) {
      for (let j = i + 1; j < drafts.length; j += 1) {
        consistencyAccumulator += jaccardSimilarity(drafts[i], drafts[j]);
        consistencyPairs += 1;
      }
    }
  }

  const consistency = consistencyPairs > 0 ? consistencyAccumulator / consistencyPairs : 1;

  const report: BenchmarkCaseReport = {
    caseId: caseData.id,
    generatedAt: new Date().toISOString(),
    provider: "gemini",
    iterations,
    chapterCount,
    speed: {
      averageMs,
      p95Ms,
      totalMs,
      chaptersPerMinute,
    },
    precision: {
      score: precision,
      approvedRate,
    },
    consistency: {
      score: consistency,
    },
    comparison: options.baseline
      ? {
          baselineName: options.baseline.name,
          speedDeltaMs:
            typeof options.baseline.speedMs === "number" ? options.baseline.speedMs - averageMs : undefined,
          precisionDelta:
            typeof options.baseline.precision === "number" ? precision - options.baseline.precision : undefined,
          consistencyDelta:
            typeof options.baseline.consistency === "number" ? consistency - options.baseline.consistency : undefined,
        }
      : undefined,
    recommendations: [],
  };

  report.recommendations = buildRecommendations(report);
  return report;
}
