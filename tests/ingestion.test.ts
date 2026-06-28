import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { promises as fs } from "node:fs";
import { ingestKnowledgeSources } from "../packages/core/src";

test("pipeline de ingestao processa fonte markdown", async () => {
  const root = process.cwd();
  const sourceDir = path.join(root, "knowledge", "sources", "original");
  const processedDir = path.join(root, "knowledge", "sources", "processed");
  const metadataDir = path.join(root, "knowledge", "sources", "metadata");

  await fs.mkdir(sourceDir, { recursive: true });
  const fixture = path.join(sourceDir, "fixture-ingestao.md");
  await fs.writeFile(fixture, "Modelo de peca de contestacao com fundamentos.", "utf8");

  const result = await ingestKnowledgeSources({ sourceDir, processedDir, metadataDir });
  const found = result.items.find((item) => item.fileName === "fixture-ingestao.md");

  assert.ok(found);
  assert.equal(found?.extracted, true);
  assert.ok(found?.textLength && found.textLength > 10);

  await fs.unlink(fixture);
  if (found) {
    await fs.rm(found.processedPath, { force: true });
    await fs.rm(found.metadataPath, { force: true });
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
