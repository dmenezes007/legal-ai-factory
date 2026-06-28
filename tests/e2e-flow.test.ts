import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { promises as fs } from "node:fs";
import { draftChapter, generateArchitecture, generateLegalDocx } from "../packages/core/src";

test("fluxo MVP ponta a ponta gera docx", async () => {
  const caseData = {
    id: "e2e-case",
    number: "1111111-11.2026.8.26.1111",
    court: "Vara E2E",
    plaintiff: "Paciente Exemplo",
    defendant: "Operadora Exemplo S/A",
    client: "Operadora Exemplo S/A",
  };

  const architecture = await generateArchitecture(caseData, { mode: "mock", simulatedData: true });
  assert.ok(architecture.length > 0);

  const firstDraft = await draftChapter(caseData, architecture[0], { mode: "mock", simulatedData: true });
  architecture[0].content = firstDraft;

  const generated = await generateLegalDocx({
    caseData,
    outline: architecture,
    outputDir: path.join(process.cwd(), "knowledge", "cases", caseData.id, "output"),
    simulatedData: true,
  });

  assert.ok(generated.filePath.endsWith(".docx"));
  await fs.unlink(generated.filePath);
});
