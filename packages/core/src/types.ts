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

export type LLMProvider = "gemini" | "gpt" | "claude" | "deepseek";

export interface KnowledgeObject {
  id: string;
  kind: "facts" | "evidence" | "thesis" | "law" | "strategy";
  title: string;
  content: string;
}

export interface ChapterPlan {
  id: string;
  title: string;
  sectionType: string;
  order: number;
  objective: string;
  recommendedThesis: string;
  sourceKnowledgeIds: string[];
}

export interface PlannerResult {
  chapters: ChapterPlan[];
}

export interface CompiledPrompt {
  system: string;
  user: string;
  metadata: Record<string, unknown>;
}

export interface AIExecutionRequest {
  task: "architecture" | "draft" | "review";
  provider: LLMProvider;
  prompt: CompiledPrompt;
  outputFormat: "text" | "json";
}

export interface AIExecutionResponse {
  provider: LLMProvider;
  model: string;
  text: string;
}

export interface ReviewStageResult {
  stage: "juridico" | "linguistico" | "estrutural" | "estrategico";
  passed: boolean;
  findings: string[];
}

export interface ReviewResult {
  approved: boolean;
  reviewedContent: string;
  stages: ReviewStageResult[];
}

export interface BenchmarkBaseline {
  name: string;
  speedMs?: number;
  precision?: number;
  consistency?: number;
}

export interface BenchmarkOptions {
  iterations: number;
  mode: "mock" | "real";
  simulatedData: boolean;
  baseline?: BenchmarkBaseline;
}

export interface BenchmarkCaseReport {
  caseId: string;
  generatedAt: string;
  provider: LLMProvider;
  iterations: number;
  chapterCount: number;
  speed: {
    averageMs: number;
    p95Ms: number;
    totalMs: number;
    chaptersPerMinute: number;
  };
  precision: {
    score: number;
    approvedRate: number;
  };
  consistency: {
    score: number;
  };
  comparison?: {
    baselineName: string;
    speedDeltaMs?: number;
    precisionDelta?: number;
    consistencyDelta?: number;
  };
  recommendations: string[];
}
