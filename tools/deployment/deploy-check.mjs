import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const requiredFiles = [
  ".env.example",
  "apps/api/.env.example",
  "docs/deployment/publication-strategy.md",
  "docs/deployment/README-publication.md"
];

const requiredRootKeys = [
  "VITE_API_BASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY"
];

const requiredApiKeys = [
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertKeys(file, keys) {
  const content = read(file);
  for (const key of keys) {
    assert(content.includes(`${key}=`), `${file} nao contem a variavel obrigatoria: ${key}`);
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Arquivo obrigatorio ausente: ${file}`);
}

assertKeys(".env.example", requiredRootKeys);
assertKeys("apps/api/.env.example", requiredApiKeys);

const pkg = JSON.parse(read("package.json"));
assert(pkg.scripts?.build, "Script ausente: build");
assert(pkg.scripts?.["start:api"], "Script ausente: start:api");
assert(pkg.scripts?.["deploy:check"], "Script ausente: deploy:check");

console.log("Deployment check OK");
