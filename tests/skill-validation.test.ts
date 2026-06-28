import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020";

test("SDL skill YAML valida no schema inicial", async () => {
  const schemaRaw = await readFile("schemas/sdl/skill.schema.json", "utf8");
  const skillRaw = await readFile("knowledge/skills/contestacao-saude/skill.yaml", "utf8");

  const schema = JSON.parse(schemaRaw);
  const skill = yaml.load(skillRaw);

  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(skill);

  assert.equal(valid, true, JSON.stringify(validate.errors, null, 2));
});
