export interface LegalCase {
  id: string;
  number: string;
  court: string; // Juízo
  rite: string; // Rito
  plaintiff: string; // Parte Autora
  defendant: string; // Parte Ré
  client: string; // Cliente
  legalArea: string; // Área Jurídica
  selectedSkillId?: string;
  simulatedData?: boolean;
  observations: string;
  createdAt: string;
  status: 'draft' | 'processed' | 'diagnosed' | 'theses_mapped' | 'architecture_defined' | 'drafting' | 'completed';
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt' | 'drive';
  status: 'pending' | 'processing' | 'processed' | 'error';
  contentSnippet?: string;
}

export interface CaseDiagnostic {
  caseId: string;
  plaintiff: string;
  defendant: string;
  rite: string;
  court: string;
  claims: string[]; // Pedidos da inicial
  foundations: string[]; // Fundamentos da inicial
  keyDocuments: string[]; // Documentos relevantes analisados
  gaps: {
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }[];
}

export interface LegalThesis {
  id: string;
  caseId: string;
  title: string;
  hypothesis: string;
  adherence: 'Alta' | 'Média' | 'Baixa';
  normativeBasis: string;
  relatedEvidence: string;
  correlatedRequest: string;
  selected: boolean;
  type: 'preliminar' | 'merito' | 'processual';
}

export interface OutlineItem {
  id: string;
  caseId: string;
  title: string;
  sectionType: 'preambulo' | 'resumo' | 'controversia' | 'preliminares' | 'merito' | 'prequestionamento' | 'requerimentos';
  content: string;
  status: 'nao_iniciado' | 'gerando' | 'gerado' | 'revisado' | 'aprovado';
  order: number;
}

export interface AuditLog {
  id: string;
  caseId: string;
  timestamp: string;
  stage: string;
  modelUsed: string;
  status: 'sucesso' | 'alerta' | 'erro' | 'info';
  observations: string;
}
