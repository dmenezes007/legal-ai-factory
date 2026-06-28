import test from "node:test";
import assert from "node:assert/strict";
import { runBenchmarkCase } from "../packages/core/src";

test("benchmark gera relatorio automatico por caso", async () => {
  const caseData = {
    id: "benchmark-case-1",
    number: "5555555-55.2026.8.26.0001",
    court: "2a Vara Civel",
    plaintiff: "Autor de Teste",
    defendant: "Reu de Teste S/A",
    client: "Reu de Teste S/A",
  };

  const report = await runBenchmarkCase(caseData, {
    iterations: 2,
    mode: "mock",
    simulatedData: true,
    baseline: {
      name: "NotebookLM",
      speedMs: 5000,
      precision: 0.7,
      consistency: 0.65,
    },
  });

  assert.equal(report.caseId, caseData.id);
  assert.ok(report.chapterCount > 0);
  assert.ok(report.speed.averageMs >= 0);
  assert.ok(report.speed.p95Ms >= 0);
  assert.ok(report.precision.score >= 0 && report.precision.score <= 1);
  assert.ok(report.consistency.score >= 0 && report.consistency.score <= 1);
  assert.ok(Array.isArray(report.recommendations));
  assert.ok(report.recommendations.length > 0);
  assert.equal(report.comparison?.baselineName, "NotebookLM");
});
