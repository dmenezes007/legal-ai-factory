import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

const requiredGovernanceFiles = [
  "knowledge/README.md",
  "knowledge/catalog.json",
  "knowledge/index.json",
  "knowledge/registry.json",
  "knowledge/relationships.json",
  "knowledge/ontology.yaml",
  "knowledge/taxonomy.yaml",
  "knowledge/glossary.yaml",
  "knowledge/knowledge-map.yaml",
];

test("arquivos de governanca obrigatorios existem", async () => {
  for (const filePath of requiredGovernanceFiles) {
    await access(filePath);
  }
});

test("catalog.json possui estrutura basica valida", async () => {
  const raw = await readFile("knowledge/catalog.json", "utf8");
  const catalog = JSON.parse(raw);

  assert.ok(Array.isArray(catalog));

  for (const item of catalog) {
    const keys = [
      "id",
      "title",
      "type",
      "category",
      "source_path",
      "processed_path",
      "status",
      "tags",
      "related_skills",
      "related_workflows",
      "created_at",
      "updated_at",
      "provenance",
      "notes",
    ];

    for (const key of keys) {
      assert.ok(Object.prototype.hasOwnProperty.call(item, key), `catalog item sem campo ${key}`);
    }
  }
});

test("registry.json possui estrutura basica valida", async () => {
  const raw = await readFile("knowledge/registry.json", "utf8");
  const registry = JSON.parse(raw);

  assert.equal(typeof registry.version, "string");
  assert.ok(Array.isArray(registry.skills));
  assert.ok(Array.isArray(registry.workflows));
  assert.ok(Array.isArray(registry.maps));
  assert.ok(Array.isArray(registry.templates));
  assert.ok(Array.isArray(registry.sources));
});

test("ontology.yaml existe", async () => {
  await access("knowledge/ontology.yaml");
});
