import type { KnowledgeSourceCategory } from "./types";

const RULES: Array<{ category: KnowledgeSourceCategory; terms: string[] }> = [
  { category: "skill", terms: ["skill", "sdl", "metodologia", "cognitive_pipeline"] },
  { category: "mapa_de_teses", terms: ["tese", "mapa de teses", "jurisprudencia aplicada"] },
  { category: "modelo_peca", terms: ["contestacao", "peticao", "modelo de peca", "requerimentos finais"] },
  { category: "jurisprudencia", terms: ["acordao", "stj", "stf", "tribunal", "recurso especial"] },
  { category: "doutrina", terms: ["doutrina", "autor", "obra", "capitulo", "edicao"] },
  { category: "legislacao", terms: ["art.", "lei", "codigo civil", "codigo de processo civil", "clt"] },
  { category: "template", terms: ["template", "placeholder", "{{", "modelo base"] },
  { category: "caso_exemplo", terms: ["exemplo", "caso demo", "simulado", "ficticio"] },
];

export function classifySource(fileName: string, content: string): KnowledgeSourceCategory {
  const haystack = `${fileName} ${content}`.toLowerCase();

  for (const rule of RULES) {
    if (rule.terms.some((term) => haystack.includes(term))) {
      return rule.category;
    }
  }

  return "desconhecido";
}
