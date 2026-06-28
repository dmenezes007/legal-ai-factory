import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { promises as fs } from "node:fs";
import { ingestKnowledgeSources } from "../packages/core/src";

test("ingestao atualiza catalogo e indice", async () => {
  const root = process.cwd();
  const sourceDir = path.join(root, "knowledge", "sources", "original");
  const processedDir = path.join(root, "knowledge", "sources", "processed");
  const metadataDir = path.join(root, "knowledge", "sources", "metadata");

  const fixtureName = `governance-fixture-${Date.now()}.md`;
  const fixturePath = path.join(sourceDir, fixtureName);

  await fs.writeFile(
    fixturePath,
    "Checklist de validacao e modelo de peca para contestacao de saude.",
    "utf8",
  );

  const result = await ingestKnowledgeSources({ sourceDir, processedDir, metadataDir });

  const catalogRaw = await fs.readFile(path.join(root, "knowledge", "catalog.json"), "utf8");
  const indexRaw = await fs.readFile(path.join(root, "knowledge", "index.json"), "utf8");

  const catalog = JSON.parse(catalogRaw);
  const index = JSON.parse(indexRaw);

  const catalogItem = catalog.find((entry: any) => String(entry.source_path).endsWith(fixtureName));
  const indexItem = index.find((entry: any) => String(entry.source_path).endsWith(fixtureName));

  assert.ok(catalogItem, "catalog nao recebeu item ingerido");
  assert.ok(indexItem, "index nao recebeu item ingerido");

  await fs.unlink(fixturePath);

  const generated = result.items.filter((item) => item.fileName === fixtureName);
  for (const item of generated) {
    await fs.rm(item.processedPath, { force: true });
    await fs.rm(item.metadataPath, { force: true });
  }

  const processedFiles = await fs.readdir(processedDir);
  for (const fileName of processedFiles) {
    if (fileName.includes("fixture-ingestao") || fileName.includes("governance-fixture")) {
      await fs.rm(path.join(processedDir, fileName), { force: true });
    }
  }

  const metadataFiles = await fs.readdir(metadataDir);
  for (const fileName of metadataFiles) {
    if (fileName.includes("fixture-ingestao") || fileName.includes("governance-fixture")) {
      await fs.rm(path.join(metadataDir, fileName), { force: true });
    }
  }
});
