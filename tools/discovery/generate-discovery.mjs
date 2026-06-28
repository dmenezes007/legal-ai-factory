import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import yaml from "js-yaml";

const repoRoot = process.cwd();
const sourceRoot = path.join(repoRoot, "knowledge", "sources", "original", "notebooklm");
const taxonomyPath = path.join(repoRoot, "knowledge", "taxonomy.yaml");
const outJsonPath = path.join(repoRoot, "knowledge", "discovery.json");
const outReportPath = path.join(repoRoot, "knowledge", "discovery-report.md");

const stopwords = new Set([
  "de","da","do","das","dos","a","o","as","os","e","em","um","uma","para","por",
  "com","sem","na","no","nas","nos","ao","aos","se","que","como","ou","mais","menos",
  "não","nao","ser","sua","seu","suas","seus","foi","são","sao","sobre","entre","já","ja",
  "até","ate","também","tambem","pela","pelo","pelas","pelos","este","esta","esses","essas",
  "processo","tjsp","stj","sp","nº","n","anexo","fonte","notebooklm"
]);

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (entry.isFile() && full.toLowerCase().endsWith(".txt")) {
      out.push(full);
    }
  }
  return out;
}

function tokenize(text) {
  const norm = normalize(text);
  return norm
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !stopwords.has(t) && !/^\d+$/.test(t));
}

function topKeywords(tokens, topN = 12) {
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);
}

function scoreContains(text, patterns) {
  let score = 0;
  for (const p of patterns) {
    if (text.includes(p)) score += 1;
  }
  return score;
}

function detectArea(normText, relPath) {
  const source = `${relPath} ${normText}`;
  const areas = [
    {
      name: "Saude Suplementar Empresarial",
      score: scoreContains(source, [
        "sul america", "sulamerica", "ans", "sinistralidade", "premio", "reajuste",
        "vcmh", "falso coletivo", "produto 557", "plano de saude", "coletivo empresarial"
      ])
    },
    {
      name: "Contencioso Civel e Consumidor",
      score: scoreContains(source, [
        "contestacao", "cerceamento", "recurso", "apelacao", "agravo", "sentenca", "acordao",
        "juiz", "vara civel", "comarca"
      ])
    },
    {
      name: "Processual Civil Probatorio",
      score: scoreContains(source, ["pericia", "laudo", "atuarial", "prova", "honorarios periciais"])
    }
  ];
  areas.sort((a, b) => b.score - a.score);
  if (areas[0].score <= 0) return "Nao identificado";
  return areas[0].name;
}

function detectTaxonomy(relPath, normText) {
  const p = normalize(relPath);
  if (p.includes("/skills/") || p.includes("\\skills\\")) return "skill";
  if (p.includes("/mapas/") || p.includes("\\mapas\\") || normText.includes("mapa de aderencia")) return "mapa_de_teses";
  if (p.includes("/modelos/") || p.includes("\\modelos\\") || normText.includes("contestacao")) return "modelo_peca";
  if (p.includes("/jurisprudencia/") || p.includes("\\jurisprudencia\\")) return "jurisprudencia";
  if (p.includes("/doutrina/") || p.includes("\\doutrina\\")) return "doutrina";
  if (p.includes("/laudos/") || p.includes("\\laudos\\") || p.includes("/extratos/") || p.includes("\\extratos\\")) return "documento_processual";
  return "desconhecido";
}

function detectDocumentType(relPath, normText) {
  const p = normalize(relPath);
  if (p.includes("sentenca")) return "sentenca";
  if (p.includes("acordao") || p.includes("acordao") || p.includes("recurso especial") || p.includes("agravo") || p.includes("apelacao")) return "acordao_ou_recurso";
  if (p.includes("laudo") || normText.includes("laudo pericial")) return "laudo_pericial";
  if (p.includes("extratos") || normText.includes("memoria de calculo") || normText.includes("vcmh")) return "extrato_atuarial";
  if (p.includes("mapa")) return "mapa_de_teses";
  if (p.includes("skill")) return "guia_de_redacao_ou_skill_primitiva";
  if (p.includes("contestacao") || p.includes("modelos")) return "modelo_contestacao";
  if (p.includes("doutrina")) return "doutrina_juridica";
  return "outro";
}

function detectMainTheme(normText, relPath) {
  const source = `${normalize(relPath)} ${normText}`;
  const themes = [
    {
      id: "reajuste_anual_falso_coletivo_produto_557",
      score: scoreContains(source, ["reajuste", "falso coletivo", "produto 557", "coletivo empresarial"])
    },
    {
      id: "cerceamento_de_defesa_e_necessidade_pericia_atuarial",
      score: scoreContains(source, ["cerceamento", "necessidade de pericia", "pericia atuarial", "anulada"])
    },
    {
      id: "metodologia_redacao_contestacao",
      score: scoreContains(source, ["skill", "redacao juridica", "contestacao", "estrutura"])
    },
    {
      id: "memoria_atuarial_e_calculo_de_reajuste",
      score: scoreContains(source, ["vcmh", "irs", "sinistralidade", "memoria de calculo", "premio complementar"])
    }
  ];
  themes.sort((a, b) => b.score - a.score);
  return themes[0].score > 0 ? themes[0].id : "tema_nao_identificado";
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function pickCandidates(doc) {
  const out = [];
  if (doc.taxonomyCategory === "skill") out.push("Skill");
  if (doc.taxonomyCategory === "modelo_peca") out.push("Template");
  if (doc.taxonomyCategory === "mapa_de_teses") out.push("Mapa de Teses");
  if (doc.taxonomyCategory === "documento_processual" || doc.taxonomyCategory === "jurisprudencia" || doc.taxonomyCategory === "doutrina") {
    out.push("Knowledge Object");
  }
  if (doc.taxonomyCategory === "skill" || doc.taxonomyCategory === "modelo_peca" || doc.documentType.includes("laudo") || doc.documentType.includes("extrato")) {
    out.push("Workflow");
  }
  return [...new Set(out)];
}

const taxonomyData = yaml.load(fs.readFileSync(taxonomyPath, "utf8"));
const taxonomySet = new Set((taxonomyData.categories || []).map((c) => c.id));

const files = walk(sourceRoot);
const docs = files.map((filePath, idx) => {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const norm = normalize(content);
  const tokens = tokenize(content);
  const keywords = topKeywords(tokens, 12);
  const taxonomyCategory = detectTaxonomy(relPath, norm);
  const safeTax = taxonomySet.has(taxonomyCategory) ? taxonomyCategory : "desconhecido";
  const doc = {
    id: `doc_${String(idx + 1).padStart(3, "0")}`,
    filePath: relPath,
    fileName: path.basename(filePath),
    sizeBytes: Buffer.byteLength(content, "utf8"),
    sha256: crypto.createHash("sha256").update(content).digest("hex"),
    areaJuridica: detectArea(norm, relPath),
    taxonomyCategory: safeTax,
    documentType: detectDocumentType(relPath, norm),
    mainTheme: detectMainTheme(norm, relPath),
    keywords,
    qualityFlags: [],
    candidateTypes: []
  };

  if (content.length < 500) doc.qualityFlags.push("conteudo_curto");
  if (/corpo renderizado como imagens|sem texto ocr legivel/i.test(content)) doc.qualityFlags.push("conteudo_principal_em_imagem");

  doc.candidateTypes = pickCandidates(doc);
  doc._tokenSet = new Set(tokens.slice(0, 3000));
  return doc;
});

const byHash = new Map();
for (const d of docs) {
  if (!byHash.has(d.sha256)) byHash.set(d.sha256, []);
  byHash.get(d.sha256).push(d.id);
}

const exactDuplicateGroups = [...byHash.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([hash, ids]) => ({ hash, documents: ids }));

const similarPairs = [];
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const a = docs[i];
    const b = docs[j];
    const sim = jaccard(a._tokenSet, b._tokenSet);
    if (sim >= 0.42) {
      similarPairs.push({ docA: a.id, docB: b.id, score: Number(sim.toFixed(3)) });
    }
  }
}

const docById = new Map(docs.map((d) => [d.id, d]));
const similarsByDoc = new Map(docs.map((d) => [d.id, []]));
for (const p of similarPairs) {
  similarsByDoc.get(p.docA).push({ id: p.docB, score: p.score });
  similarsByDoc.get(p.docB).push({ id: p.docA, score: p.score });
}

const complementaryPairs = [];
for (let i = 0; i < docs.length; i++) {
  for (let j = i + 1; j < docs.length; j++) {
    const a = docs[i];
    const b = docs[j];
    const sim = jaccard(a._tokenSet, b._tokenSet);
    if (
      a.mainTheme === b.mainTheme &&
      a.taxonomyCategory !== b.taxonomyCategory &&
      sim >= 0.08
    ) {
      complementaryPairs.push({
        docA: a.id,
        docB: b.id,
        reason: `Tema compartilhado (${a.mainTheme}) com categorias distintas`,
        score: Number(sim.toFixed(3))
      });
    }
  }
}

const complementByDoc = new Map(docs.map((d) => [d.id, []]));
for (const p of complementaryPairs) {
  complementByDoc.get(p.docA).push({ id: p.docB, score: p.score });
  complementByDoc.get(p.docB).push({ id: p.docA, score: p.score });
}

for (const d of docs) {
  d.duplicates = exactDuplicateGroups.find((g) => g.documents.includes(d.id))?.documents.filter((id) => id !== d.id) || [];
  d.similarDocuments = (similarsByDoc.get(d.id) || []).sort((x, y) => y.score - x.score).slice(0, 5);
  d.complementaryDocuments = (complementByDoc.get(d.id) || []).sort((x, y) => y.score - x.score).slice(0, 5);
  delete d._tokenSet;
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key] || "Nao identificado";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

const byArea = countBy(docs, "areaJuridica");
const byTaxonomy = countBy(docs, "taxonomyCategory");

const candidateCounts = {
  skills: docs.filter((d) => d.candidateTypes.includes("Skill")).length,
  workflows: docs.filter((d) => d.candidateTypes.includes("Workflow")).length,
  mapasDeTeses: docs.filter((d) => d.candidateTypes.includes("Mapa de Teses")).length,
  templates: docs.filter((d) => d.candidateTypes.includes("Template")).length,
  knowledgeObjects: docs.filter((d) => d.candidateTypes.includes("Knowledge Object")).length
};

const domains = Object.keys(byArea).map((area) => {
  const domainDocs = docs.filter((d) => d.areaJuridica === area);
  const categories = new Set(domainDocs.map((d) => d.taxonomyCategory));
  const hasModel = categories.has("modelo_peca");
  const hasMap = categories.has("mapa_de_teses");
  const hasJuris = categories.has("jurisprudencia");

  const raw = (categories.size * 0.8)
    + Math.min(domainDocs.length / 6, 1.5)
    + (hasModel ? 0.7 : 0)
    + (hasMap ? 0.5 : 0)
    + (hasJuris ? 0.7 : 0);

  const score = Math.max(1, Math.min(5, Number(raw.toFixed(1))));
  const level = score >= 4 ? "Avancado" : score >= 3 ? "Intermediario" : "Inicial";

  return {
    areaJuridica: area,
    documentCount: domainDocs.length,
    categories: [...categories].sort(),
    maturityScore: score,
    maturityLevel: level
  };
});

const migrationCandidates = [
  {
    id: "cand_01",
    name: "Skill de Contestacao de Reajuste Anual (Falso Coletivo Produto 557)",
    candidateType: "Skill",
    evidence: docs
      .filter((d) =>
        d.mainTheme === "reajuste_anual_falso_coletivo_produto_557" ||
        d.mainTheme === "metodologia_redacao_contestacao"
      )
      .map((d) => d.id)
      .slice(0, 14),
    completeness: 5,
    reusability: 5,
    operationalValue: 5,
    externalDependency: 2
  },
  {
    id: "cand_02",
    name: "Workflow de Montagem Defensiva (doutrina + jurisprudencia + mapa + modelo)",
    candidateType: "Workflow",
    evidence: docs
      .filter((d) => ["doutrina", "jurisprudencia", "mapa_de_teses", "modelo_peca"].includes(d.taxonomyCategory))
      .map((d) => d.id)
      .slice(0, 16),
    completeness: 4,
    reusability: 5,
    operationalValue: 4,
    externalDependency: 3
  },
  {
    id: "cand_03",
    name: "Mapa de Aderencia de Teses para reajuste anual",
    candidateType: "Mapa de Teses",
    evidence: docs.filter((d) => d.taxonomyCategory === "mapa_de_teses").map((d) => d.id),
    completeness: 4,
    reusability: 4,
    operationalValue: 4,
    externalDependency: 1
  },
  {
    id: "cand_04",
    name: "Template de Contestacao de Reajuste SulAmerica",
    candidateType: "Template",
    evidence: docs.filter((d) => d.taxonomyCategory === "modelo_peca").map((d) => d.id),
    completeness: 4,
    reusability: 5,
    operationalValue: 5,
    externalDependency: 1
  },
  {
    id: "cand_05",
    name: "Knowledge Objects de Jurisprudencia por tese",
    candidateType: "Knowledge Object",
    evidence: docs.filter((d) => d.taxonomyCategory === "jurisprudencia").map((d) => d.id).slice(0, 14),
    completeness: 4,
    reusability: 4,
    operationalValue: 4,
    externalDependency: 1
  }
].map((c) => {
  const score = (c.completeness * 0.3)
    + (c.reusability * 0.25)
    + (c.operationalValue * 0.3)
    + ((6 - c.externalDependency) * 0.15);

  let priority = "Baixa prioridade";
  if (score >= 4.3) priority = "Alta prioridade";
  else if (score >= 3.5) priority = "Media prioridade";

  return {
    ...c,
    weightedScore: Number(score.toFixed(2)),
    migrationPriority: priority
  };
});

const selectedMvpSkill = {
  id: "cand_01",
  name: "Skill de Contestacao de Reajuste Anual (Falso Coletivo Produto 557)",
  rationale: {
    completeness: "Combina modelos de contestacao, mapa de teses, doutrina, extratos atuariais, laudos e jurisprudencia correlata.",
    reusability: "Reaplicavel em litigios repetitivos de reajuste anual com mesma estrutura argumentativa.",
    operationalValue: "Impacta diretamente o fluxo fim-a-fim de geracao de peca e defesa de maior recorrencia no acervo.",
    lowExternalDependency: "Depende majoritariamente de acervo interno consolidado, com baixa necessidade de fontes externas adicionais."
  }
};

const discovery = {
  generatedAt: new Date().toISOString(),
  sourceRoot: "knowledge/sources/original/notebooklm",
  totals: {
    documents: docs.length,
    exactDuplicateGroups: exactDuplicateGroups.length,
    similarPairs: similarPairs.length,
    complementaryPairs: complementaryPairs.length
  },
  taxonomyCoverage: byTaxonomy,
  areaCoverage: byArea,
  executiveSummary: {
    documentosPorAreaJuridica: byArea,
    quantidadeModelosDePecas: byTaxonomy.modelo_peca || 0,
    quantidadeMapasDeTeses: byTaxonomy.mapa_de_teses || 0,
    quantidadeFluxosIdentificados: migrationCandidates.filter((c) => c.candidateType === "Workflow").length,
    quantidadePossiveisSkills: migrationCandidates.filter((c) => c.candidateType === "Skill").length,
    maturidadePorDominio: domains
  },
  documents: docs,
  duplicateGroups: exactDuplicateGroups,
  similarDocuments: similarPairs,
  complementaryDocuments: complementaryPairs,
  migrationCandidates,
  selectedMvpSkill
};

fs.writeFileSync(outJsonPath, JSON.stringify(discovery, null, 2), "utf8");

function tableFromObject(obj, col1, col2) {
  const rows = Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `| ${k} | ${v} |`)
    .join("\n");
  return `| ${col1} | ${col2} |\n|---|---:|\n${rows}`;
}

const highPriority = migrationCandidates.filter((c) => c.migrationPriority === "Alta prioridade");
const mediumPriority = migrationCandidates.filter((c) => c.migrationPriority === "Media prioridade");
const lowPriority = migrationCandidates.filter((c) => c.migrationPriority === "Baixa prioridade");

const report = `# EPIC 1 - Knowledge Discovery Report

## Escopo auditado
- Fonte primaria: \`knowledge/sources/original/notebooklm\`
- Total de documentos analisados: **${docs.length}**
- Taxonomia aplicada: \`knowledge/taxonomy.yaml\`

## Inventario Executivo
${tableFromObject(byArea, "Area juridica", "Quantidade")}

${tableFromObject(byTaxonomy, "Categoria taxonomica", "Quantidade")}

## Detecoes automaticas
- Grupos de documentos duplicados (hash exato): **${exactDuplicateGroups.length}**
- Pares de documentos semelhantes: **${similarPairs.length}**
- Pares de documentos complementares: **${complementaryPairs.length}**

## Candidatos naturais identificados
- Skills: **${candidateCounts.skills}**
- Workflows: **${candidateCounts.workflows}**
- Mapas de Teses: **${candidateCounts.mapasDeTeses}**
- Templates: **${candidateCounts.templates}**
- Knowledge Objects: **${candidateCounts.knowledgeObjects}**

## Maturidade por dominio
| Dominio | Documentos | Categorias cobertas | Maturidade |
|---|---:|---|---|
${domains.map((d) => `| ${d.areaJuridica} | ${d.documentCount} | ${d.categories.join(", ")} | ${d.maturityScore} (${d.maturityLevel}) |`).join("\n")}

## Matriz de prioridade para migracao
| Candidato | Tipo | Completude | Reutilizacao | Valor operacional | Dependencia externa | Score | Prioridade |
|---|---|---:|---:|---:|---:|---:|---|
${migrationCandidates.map((c) => `| ${c.name} | ${c.candidateType} | ${c.completeness} | ${c.reusability} | ${c.operationalValue} | ${c.externalDependency} | ${c.weightedScore} | ${c.migrationPriority} |`).join("\n")}

### Alta prioridade
${highPriority.length ? highPriority.map((c) => `- ${c.name} (${c.candidateType})`).join("\n") : "- Nenhum"}

### Media prioridade
${mediumPriority.length ? mediumPriority.map((c) => `- ${c.name} (${c.candidateType})`).join("\n") : "- Nenhum"}

### Baixa prioridade
${lowPriority.length ? lowPriority.map((c) => `- ${c.name} (${c.candidateType})`).join("\n") : "- Nenhum"}

## Primeira Skill oficial indicada para o MVP
**${selectedMvpSkill.name}**

Justificativa pelos criterios do EPIC:
- Maior completude: ${selectedMvpSkill.rationale.completeness}
- Maior reutilizacao: ${selectedMvpSkill.rationale.reusability}
- Maior valor operacional: ${selectedMvpSkill.rationale.operationalValue}
- Menor dependencia externa: ${selectedMvpSkill.rationale.lowExternalDependency}

## Observacoes
- Nenhuma conversao para SDL foi realizada neste epico.
- Nenhuma nova funcionalidade ou tela foi implementada.
- Este relatorio e exclusivamente de descoberta, mapeamento e priorizacao.
`;

fs.writeFileSync(outReportPath, report, "utf8");

console.log(`Discovery generated: ${outJsonPath}`);
console.log(`Report generated: ${outReportPath}`);
