export type KnowledgeSourceCategory =
  | "skill"
  | "mapa_de_teses"
  | "modelo_peca"
  | "jurisprudencia"
  | "doutrina"
  | "legislacao"
  | "template"
  | "checklist"
  | "prompt_chain"
  | "caso_exemplo"
  | "documento_processual"
  | "desconhecido";

export interface IngestionResult {
  id: string;
  originalPath: string;
  processedPath: string;
  metadataPath: string;
  fileName: string;
  extension: string;
  category: KnowledgeSourceCategory;
  textLength: number;
  extracted: boolean;
  extractionWarnings: string[];
}

export interface IngestionSummary {
  sourceDir: string;
  processedDir: string;
  metadataDir: string;
  timestamp: string;
  total: number;
  processed: number;
  errors: number;
  items: IngestionResult[];
}

export interface CasePayload {
  id: string;
  number: string;
  court: string;
  plaintiff: string;
  defendant: string;
  client: string;
}

export interface OutlineItemPayload {
  id: string;
  title: string;
  sectionType: string;
  content: string;
  order: number;
}

export interface SkillExecutionOptions {
  mode: "mock" | "real";
  simulatedData: boolean;
}
