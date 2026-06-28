import path from "node:path";
import { promises as fs } from "node:fs";
import { generateArchitecture, generateLegalDocx } from "../../../packages/core/src";

async function run(): Promise<void> {
  const caseData = {
    id: "contestacao-saude-demo",
    number: "0000000-00.2026.8.26.0000",
    court: "Vara Civel de Demonstracao",
    plaintiff: "Paciente Exemplo",
    defendant: "Operadora Exemplo S/A",
    client: "Operadora Exemplo S/A",
  };

  const outline = await generateArchitecture(caseData, { mode: "mock", simulatedData: true });
  const outputDir = path.join(process.cwd(), "knowledge", "cases", caseData.id, "output");

  const generated = await generateLegalDocx({
    caseData,
    outline,
    outputDir,
    simulatedData: true,
  });

  await fs.writeFile(
    path.join(process.cwd(), "examples", "cases", "contestacao-saude-demo", "expected-output", "manifest.json"),
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      outputFile: generated.fileName,
      outputPath: generated.filePath,
      simulatedData: true,
    }, null, 2),
    "utf8",
  );

  // eslint-disable-next-line no-console
  console.log(`DOCX gerado: ${generated.filePath}`);
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
