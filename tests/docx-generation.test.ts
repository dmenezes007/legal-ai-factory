import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { promises as fs } from "node:fs";
import { generateLegalDocx } from "../packages/core/src";

test("gerador DOCX cria arquivo valido", async () => {
  const outputDir = path.join(process.cwd(), "knowledge", "cases", "test-case", "output");
  const generated = await generateLegalDocx({
    caseData: {
      id: "test-case",
      number: "0000000-00.2026.8.26.0000",
      court: "Vara de Teste",
      plaintiff: "Autor Teste",
      defendant: "Reu Teste",
      client: "Reu Teste",
    },
    outline: [
      { id: "1", title: "1. INTRODUCAO", sectionType: "resumo", content: "Texto do capitulo.", order: 1 },
    ],
    outputDir,
    simulatedData: true,
  });

  const buffer = await fs.readFile(generated.filePath);
  const signature = buffer.subarray(0, 2).toString();
  assert.equal(signature, "PK");

  await fs.unlink(generated.filePath);
});
