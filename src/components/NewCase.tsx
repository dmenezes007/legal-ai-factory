import React, { useEffect, useState, useRef } from 'react';
import { 
  Scale, 
  Upload, 
  Folder, 
  HelpCircle, 
  FileText, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LegalCase, CaseDocument } from '../types';

interface NewCaseProps {
  onCaseCreated: (newCase: LegalCase, documents: CaseDocument[]) => void;
}

interface FolderCaseSource {
  id: string;
  displayName: string;
  relativePath: string;
  fileCount: number;
  files: Array<{
    name: string;
    size: string;
    type: string;
    relativePath: string;
  }>;
}

interface ExtractedCaseMetadata {
  number?: string;
  court?: string;
  plaintiff?: string;
  defendant?: string;
  client?: string;
  rite?: string;
  legalArea?: string;
}

interface CaseMetadataDiagnostics {
  totalCaseFiles?: number;
  extractedTextFiles?: number;
  emptyTextFiles?: number;
  likelyScannedPdf?: boolean;
  emptyTextFileNames?: string[];
}

interface ReferenceBaseStatus {
  sourceDir: string;
  signature: {
    fileCount: number;
    totalBytes: number;
    maxMtimeMs: number;
  };
  packageReady: boolean;
  packageGeneratedAt?: string;
  stats?: {
    emptyTextFiles: number;
    nonEmptyTextFiles: number;
    extensions: Record<string, number>;
    categories: Record<string, number>;
  };
}

interface ReferenceBaseSyncInfo {
  refreshed: boolean;
  skippedAsCached: boolean;
  packageGeneratedAt?: string;
}

function hasCriticalMetadata(meta: ExtractedCaseMetadata): boolean {
  return Boolean(meta.number && meta.court && meta.plaintiff && meta.defendant);
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8787';

function isNotebooklmPath(rawPath: string): boolean {
  const normalized = (rawPath || '')
    .replace(/\\/g, '/')
    .toLowerCase()
    .replace(/^\.?\//, '')
    .trim();

  return normalized === 'notebooklm' || normalized.startsWith('notebooklm/');
}

export default function NewCase({ onCaseCreated }: NewCaseProps) {
  const autoCreatedFolderRef = useRef<Set<string>>(new Set());
  const [autoCreatedFolderIds, setAutoCreatedFolderIds] = useState<string[]>([]);

  // Form fields state
  const [number, setNumber] = useState('');
  const [court, setCourt] = useState('');
  const [rite, setRite] = useState('Procedimento Comum Cível');
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [client, setClient] = useState('');
  const [legalArea, setLegalArea] = useState('Cível');
  const [selectedSkillId, setSelectedSkillId] = useState('skill.contestacao-saude');
  const [observations, setObservations] = useState('');
  
  // Storage source option
  const [localFolder, setLocalFolder] = useState('');
  const [storageType, setStorageType] = useState<'upload' | 'local'>('upload');
  const [folderCases, setFolderCases] = useState<FolderCaseSource[]>([]);
  const [selectedFolderCaseId, setSelectedFolderCaseId] = useState('');
  const [isLoadingFolderCases, setIsLoadingFolderCases] = useState(false);
  const [isPreprocessingFolder, setIsPreprocessingFolder] = useState(false);
  const [folderPreprocessError, setFolderPreprocessError] = useState<string | null>(null);
  const [preprocessedFolderDocs, setPreprocessedFolderDocs] = useState<Array<{
    name: string;
    size: string;
    type: string;
    status: 'pending' | 'processing' | 'processed' | 'error';
    contentSnippet?: string;
  }>>([]);
  const [referenceBaseStatus, setReferenceBaseStatus] = useState<ReferenceBaseStatus | null>(null);
  const [isLoadingReferenceBaseStatus, setIsLoadingReferenceBaseStatus] = useState(false);
  const [isSyncingReferenceBase, setIsSyncingReferenceBase] = useState(false);
  const [referenceBaseStatusError, setReferenceBaseStatusError] = useState<string | null>(null);
  const [referenceBaseSyncInfo, setReferenceBaseSyncInfo] = useState<ReferenceBaseSyncInfo | null>(null);
  const selectedFolderCase = folderCases.find(item => item.id === selectedFolderCaseId) || null;
  const isAutoCreatedForSelectedFolder = selectedFolderCase ? autoCreatedFolderIds.includes(selectedFolderCase.id) : false;

  // Documents state
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReferenceBaseStatus = async (silent = false) => {
    if (!silent) {
      setIsLoadingReferenceBaseStatus(true);
    }
    setReferenceBaseStatusError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/reference-base/status`);
      if (!response.ok) {
        throw new Error(`Falha ao consultar status da base (${response.status})`);
      }
      const payload = await response.json();
      setReferenceBaseStatus(payload as ReferenceBaseStatus);
    } catch (error) {
      setReferenceBaseStatus(null);
      setReferenceBaseStatusError(error instanceof Error ? error.message : 'Erro ao consultar status da base de referência.');
    } finally {
      if (!silent) {
        setIsLoadingReferenceBaseStatus(false);
      }
    }
  };

  const syncReferenceBaseNow = async () => {
    setIsSyncingReferenceBase(true);
    setReferenceBaseStatusError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/reference-base/sync`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Falha ao sincronizar base (${response.status})`);
      }
      const payload = await response.json();
      setReferenceBaseSyncInfo({
        refreshed: Boolean(payload.refreshed),
        skippedAsCached: Boolean(payload.skippedAsCached),
        packageGeneratedAt: payload.packageGeneratedAt,
      });
      await loadReferenceBaseStatus(true);
    } catch (error) {
      setReferenceBaseStatusError(error instanceof Error ? error.message : 'Erro ao sincronizar base de referência.');
    } finally {
      setIsSyncingReferenceBase(false);
    }
  };

  const formatTimestamp = (raw?: string) => {
    if (!raw) {
      return 'N/A';
    }

    const value = new Date(raw);
    if (Number.isNaN(value.getTime())) {
      return 'N/A';
    }

    return value.toLocaleString('pt-BR');
  };

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) {
      return '0 B';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  useEffect(() => {
    if (storageType !== 'local') {
      setReferenceBaseStatus(null);
      setReferenceBaseSyncInfo(null);
      setReferenceBaseStatusError(null);
      return;
    }

    let isCancelled = false;
    const loadFolderCases = async () => {
      setIsLoadingFolderCases(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/sources/folder-cases`);
        const payload = await response.json();
        if (!isCancelled) {
          const items = Array.isArray(payload.items) ? payload.items : [];
          setFolderCases(items.filter((item: FolderCaseSource) => !isNotebooklmPath(item.relativePath)));
        }
      } catch {
        if (!isCancelled) {
          setFolderCases([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingFolderCases(false);
        }
      }
    };

    loadFolderCases();
    return () => {
      isCancelled = true;
    };
  }, [storageType]);

  useEffect(() => {
    if (storageType !== 'local') {
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsLoadingReferenceBaseStatus(true);
      setReferenceBaseStatusError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/reference-base/status`);
        if (!response.ok) {
          throw new Error(`Falha ao consultar status da base (${response.status})`);
        }
        const payload = await response.json();
        if (!cancelled) {
          setReferenceBaseStatus(payload as ReferenceBaseStatus);
        }
      } catch (error) {
        if (!cancelled) {
          setReferenceBaseStatus(null);
          setReferenceBaseStatusError(error instanceof Error ? error.message : 'Erro ao consultar status da base de referência.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingReferenceBaseStatus(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [storageType]);

  useEffect(() => {
    if (storageType !== 'local') {
      setSelectedFolderCaseId('');
      setLocalFolder('');
      setPreprocessedFolderDocs([]);
      setFolderPreprocessError(null);
    }
  }, [storageType]);

  useEffect(() => {
    if (!selectedFolderCase) {
      setPreprocessedFolderDocs([]);
      setFolderPreprocessError(null);
      return;
    }

    let isCancelled = false;

    const preprocessSelectedFolder = async () => {
      setIsPreprocessingFolder(true);
      setFolderPreprocessError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/ingest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceSubdir: selectedFolderCase.relativePath })
        });

        if (!response.ok) {
          throw new Error(`Falha de ingestão antecipada (${response.status})`);
        }

        const payload = await response.json();
        if (isCancelled) {
          return;
        }

        if (typeof payload.referenceBaseRefreshed === 'boolean' || typeof payload.referenceBaseSkippedAsCached === 'boolean') {
          setReferenceBaseSyncInfo({
            refreshed: Boolean(payload.referenceBaseRefreshed),
            skippedAsCached: Boolean(payload.referenceBaseSkippedAsCached),
            packageGeneratedAt: payload.referenceBasePackageGeneratedAt,
          });
        }

        const extractedMetadata: ExtractedCaseMetadata = payload.caseMetadata || {};
        const diagnostics: CaseMetadataDiagnostics = payload.caseMetadataDiagnostics || {};
        if (extractedMetadata.number) {
          setNumber(extractedMetadata.number);
        }
        if (extractedMetadata.court) {
          setCourt(extractedMetadata.court);
        }
        if (extractedMetadata.plaintiff) {
          setPlaintiff(extractedMetadata.plaintiff);
        }
        if (extractedMetadata.defendant) {
          setDefendant(extractedMetadata.defendant);
          if (!extractedMetadata.client) {
            setClient(extractedMetadata.defendant);
          }
        }
        if (extractedMetadata.client) {
          setClient(extractedMetadata.client);
        }
        if (extractedMetadata.rite) {
          setRite(extractedMetadata.rite);
        }
        if (extractedMetadata.legalArea) {
          setLegalArea(extractedMetadata.legalArea);
        }

        const metadataByName = new Map<string, any>();
        (payload.items || []).forEach((item: any) => {
          metadataByName.set(String(item.fileName || '').toLowerCase(), item);
        });

        const docs = selectedFolderCase.files.map((file) => {
          const meta = metadataByName.get(file.name.toLowerCase());
          const normalizedType = file.type.toLowerCase();

          if (!meta) {
            return {
              name: file.name,
              size: file.size,
              type: normalizedType,
              status: 'error' as const,
              contentSnippet: 'Arquivo não retornou metadados na ingestão antecipada.'
            };
          }

          return {
            name: file.name,
            size: file.size,
            type: normalizedType,
            status: (meta.extracted ? 'processed' : 'error') as 'processed' | 'error',
            contentSnippet: meta.extracted
              ? `[Pré-processado] ${meta.category} | ${meta.textLength} caracteres extraídos.`
              : 'Falha de extração na ingestão antecipada.'
          };
        });

        setPreprocessedFolderDocs(docs);
        setObservations(`Caso carregado da subpasta commitada: ${selectedFolderCase.relativePath}. Base notebooklm/skills aplicada (SKILL.txt). Pré-processamento: ${payload.processed}/${payload.total} arquivo(s) com sucesso.`);

        if (!autoCreatedFolderRef.current.has(selectedFolderCase.id)) {
          if (hasCriticalMetadata(extractedMetadata)) {
            autoCreatedFolderRef.current.add(selectedFolderCase.id);
            setAutoCreatedFolderIds((prev) => (prev.includes(selectedFolderCase.id) ? prev : [...prev, selectedFolderCase.id]));
            createCaseFromPreprocessedFolder(selectedFolderCase, docs, {
              processed: Number(payload.processed ?? 0),
              total: Number(payload.total ?? docs.length),
            }, extractedMetadata);
          } else {
            if (diagnostics.likelyScannedPdf) {
              setFolderPreprocessError('Pré-processamento concluído, mas os PDFs da pasta parecem imagem sem OCR (texto extraído = 0). Por isso a IA não identificou número, juízo, autor e réu automaticamente. Execute OCR nos PDFs ou preencha os campos manualmente.');
            } else {
              setFolderPreprocessError('Pré-processamento concluído, mas não foi possível extrair metadados críticos (número, juízo, autor e réu). Revise os campos antes de criar o caso.');
            }
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setPreprocessedFolderDocs([]);
          setFolderPreprocessError(error instanceof Error ? error.message : 'Erro na ingestão antecipada da subpasta.');
        }
      } finally {
        if (!isCancelled) {
          setIsPreprocessingFolder(false);
        }
      }
    };

    setLocalFolder(selectedFolderCase.relativePath);
    setSelectedFiles(
      selectedFolderCase.files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    );

    const processNumberMatch = selectedFolderCase.displayName.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/);
    if (processNumberMatch) {
      setNumber(processNumberMatch[0]);
    } else if (!number) {
      setNumber(selectedFolderCase.displayName);
    }

    preprocessSelectedFolder();

    return () => {
      isCancelled = true;
    };
  }, [selectedFolderCase]);

  // Pre-load default values for quick testing button! (Extremely satisfying for the user)
  const loadExampleData = () => {
    setNumber('1018940-52.2026.8.26.0100');
    setCourt('12ª Vara Cível da Capital - Foro Central João Mendes Júnior - SP');
    setRite('Procedimento Comum Cível');
    setPlaintiff('José Augusto Silveira de Oliveira');
    setDefendant('Imobiliária Bela Vista Ltda.');
    setClient('Imobiliária Bela Vista Ltda.');
    setLegalArea('Direito Imobiliário / Cível');
    setSelectedSkillId('skill.contestacao-saude');
    setObservations('Pedido de rescisão de compromisso de compra e venda de lote c/c restituição de 90% das parcelas pagas. Réu aduz rescisão por culpa do comprador.');
    setSelectedFiles([
      { name: 'Contrato_Compra_E_Venda_JoséAugusto.pdf', size: '1.4 MB', type: 'pdf' },
      { name: 'Petição_Inicial_Análise_Rescisao.docx', size: '120 KB', type: 'docx' },
      { name: 'Comprovantes_De_Pagamento_Loteamento.pdf', size: '4.8 MB', type: 'pdf' }
    ]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const filesArr = Array.from(e.dataTransfer.files).map((f: File) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.name.split('.').pop() || 'pdf'
      }));
      setSelectedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files).map((f: File) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.name.split('.').pop() || 'pdf'
      }));
      setSelectedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const createCaseFromPreprocessedFolder = (
    folderCase: FolderCaseSource,
    docs: Array<{
      name: string;
      size: string;
      type: string;
      status: 'pending' | 'processing' | 'processed' | 'error';
      contentSnippet?: string;
    }>,
    summary: { processed: number; total: number },
    metadata?: ExtractedCaseMetadata,
  ) => {
    const caseId = 'case_' + Math.random().toString(36).substr(2, 9);
    const processNumberMatch = folderCase.displayName.match(/\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/);
    const processNumber = processNumberMatch ? processNumberMatch[0] : folderCase.displayName;

    const derivedPlaintiff = metadata?.plaintiff?.trim() || plaintiff.trim() || 'Parte autora a definir';
    const derivedDefendant = metadata?.defendant?.trim() || defendant.trim() || 'Parte ré a definir';
    const derivedClient = metadata?.client?.trim() || client.trim() || derivedDefendant;
    const derivedCourt = metadata?.court?.trim() || court.trim() || 'Juízo a definir';

    const autoCase: LegalCase = {
      id: caseId,
      number: metadata?.number?.trim() || processNumber,
      court: derivedCourt,
      rite: metadata?.rite?.trim() || rite,
      plaintiff: derivedPlaintiff,
      defendant: derivedDefendant,
      client: derivedClient,
      legalArea: metadata?.legalArea?.trim() || legalArea,
      selectedSkillId,
      sourceMode: 'repository_folder',
      sourceFolder: folderCase.relativePath,
      simulatedData: false,
      observations: `Caso criado automaticamente após pré-processamento da subpasta ${folderCase.relativePath}. Base notebooklm/skills aplicada (SKILL.txt). Pré-processamento: ${summary.processed}/${summary.total}.`,
      createdAt: new Date().toISOString(),
      status: docs.length > 0 && docs.every((entry) => entry.status === 'processed') ? 'processed' : 'draft'
    };

    const caseDocuments: CaseDocument[] = docs.map((entry, index) => ({
      id: `doc_${caseId}_${index}`,
      caseId,
      name: entry.name,
      size: entry.size,
      type: (['pdf', 'docx', 'txt'].includes(entry.type.toLowerCase()) ? entry.type.toLowerCase() : 'pdf') as any,
      status: entry.status,
      contentSnippet: entry.contentSnippet
    }));

    onCaseCreated(autoCase, caseDocuments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number || !court || !plaintiff || !defendant || !client) {
      alert('Por favor, preencha todos os campos obrigatórios (Número, Juízo, Autor, Ré e Cliente).');
      return;
    }

    const caseId = 'case_' + Math.random().toString(36).substr(2, 9);
    
    const newCase: LegalCase = {
      id: caseId,
      number,
      court,
      rite,
      plaintiff,
      defendant,
      client,
      legalArea,
      selectedSkillId,
      sourceMode: storageType === 'local' ? 'repository_folder' : 'interface_upload',
      sourceFolder: storageType === 'local' ? localFolder : undefined,
      simulatedData: false,
      observations,
      createdAt: new Date().toISOString(),
      status: storageType === 'local' && preprocessedFolderDocs.length > 0 && preprocessedFolderDocs.every((entry) => entry.status === 'processed')
        ? 'processed'
        : 'draft'
    };

    // Create case documents based on uploads/drive
    const documents: CaseDocument[] = [];

    // Local uploads
    if (storageType === 'local') {
      if (!localFolder || !selectedFolderCase) {
        alert('Selecione uma subpasta commitada para criar o caso.');
        return;
      }

      if (isPreprocessingFolder) {
        alert('Aguarde o término do pré-processamento da subpasta selecionada.');
        return;
      }

      if (preprocessedFolderDocs.length === 0 || folderPreprocessError) {
        alert('Não foi possível validar a ingestão antecipada da subpasta. Selecione novamente e aguarde o pré-processamento.');
        return;
      }
    }

    selectedFiles.forEach((file, index) => {
      const preprocessed = storageType === 'local'
        ? preprocessedFolderDocs.find((entry) => entry.name.toLowerCase() === file.name.toLowerCase())
        : undefined;

      documents.push({
        id: `doc_${caseId}_${index}`,
        caseId,
        name: file.name,
        size: file.size,
        type: (['pdf', 'docx', 'txt'].includes(file.type.toLowerCase()) ? file.type.toLowerCase() : 'pdf') as any,
        status: preprocessed ? preprocessed.status : 'pending',
        contentSnippet: preprocessed?.contentSnippet
      });
    });

    if (storageType === 'local' && localFolder && selectedFiles.length === 0) {
      documents.push({
        id: `doc_${caseId}_local`,
        caseId,
        name: `Pasta Commitada: ${localFolder}`,
        size: 'N/A',
        type: 'docx',
        status: 'pending'
      });
    }

    onCaseCreated(newCase, documents);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Iniciar Nova Defesa Técnica</h2>
          <p className="text-sm text-slate-500">Cadastre os parâmetros processuais e faça upload das fontes jurídicas para análise.</p>
        </div>
        <button
          type="button"
          onClick={loadExampleData}
          className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold px-3 py-2 rounded-md transition-colors shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-amber-600" />
          Preencher Dados de Exemplo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="h-4.5 w-4.5 text-[#D4AF37]" />
            Metadados e Cadastro do Processo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Número do Processo *</label>
              <input 
                id="newcase-number"
                type="text" 
                required
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder="Ex: 1023456-78.2026.8.26.0100"
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Área Jurídica</label>
              <select 
                id="newcase-area"
                value={legalArea}
                onChange={e => setLegalArea(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
              >
                <option value="Cível">Cível / Consumidor</option>
                <option value="Direito do Trabalho">Direito do Trabalho</option>
                <option value="Direito Imobiliário">Direito Imobiliário</option>
                <option value="Direito Administrativo">Direito Administrativo / Público</option>
                <option value="Direito Tributário">Direito Tributário</option>
                <option value="Direito Médico">Direito Médico / de Saúde</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Juízo / Vara Competente *</label>
            <input 
              id="newcase-court"
              type="text" 
              required
              value={court}
              onChange={e => setCourt(e.target.value)}
              placeholder="Ex: 3ª Vara Cível do Foro Central de São Paulo - SP"
              className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte Autora (Requerente) *</label>
              <input 
                id="newcase-plaintiff"
                type="text" 
                required
                value={plaintiff}
                onChange={e => setPlaintiff(e.target.value)}
                placeholder="Nome completo do Autor"
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parte Ré (Requerido) *</label>
              <input 
                id="newcase-defendant"
                type="text" 
                required
                value={defendant}
                onChange={e => setDefendant(e.target.value)}
                placeholder="Nome completo do Réu"
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente de Defesa *</label>
              <select 
                id="newcase-client"
                value={client}
                onChange={e => setClient(e.target.value)}
                required
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors font-semibold text-emerald-800"
              >
                <option value="">-- Selecionar Cliente --</option>
                {plaintiff && <option value={plaintiff}>Autor ({plaintiff})</option>}
                {defendant && <option value={defendant}>Réu ({defendant})</option>}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rito Processual</label>
              <input 
                id="newcase-rite"
                type="text" 
                value={rite}
                onChange={e => setRite(e.target.value)}
                placeholder="Ex: Procedimento Comum, Sumaríssimo, JEC"
                className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Selecionada</label>
            <select
              id="newcase-skill"
              value={selectedSkillId}
              onChange={e => setSelectedSkillId(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
            >
              <option value="skill.contestacao-saude">Contestação Saúde (MVP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações do Caso</label>
            <textarea 
              id="newcase-observations"
              rows={4}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Instruções particulares do cliente, fatos incontroversos, datas de prescrição identificadas, etc."
              className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right Column: Upload sources */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Upload className="h-4.5 w-4.5 text-[#D4AF37]" />
              Fontes de Informação e Peça Inicial
            </h3>

            {/* Selection of Document source type */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setStorageType('upload')}
                className={`py-1.5 text-center rounded text-xs font-bold transition-all cursor-pointer ${
                  storageType === 'upload' ? 'bg-[#002B36] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload Arquivos
              </button>
              <button
                type="button"
                onClick={() => setStorageType('local')}
                className={`py-1.5 text-center rounded text-xs font-bold transition-all cursor-pointer ${
                  storageType === 'local' ? 'bg-[#002B36] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pastas Commitadas
              </button>
              <button
                type="button"
                disabled
                className="py-1.5 text-center rounded text-xs font-bold text-slate-400 bg-slate-200 cursor-not-allowed"
              >
                Integrações Externas
              </button>
            </div>

            {/* Dynamic Content Body based on source selection */}
            {storageType === 'upload' && (
              <div className="space-y-4">
                <div 
                  id="drag-and-drop-container"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOver 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/5' 
                      : 'border-slate-300 hover:border-[#002B36] bg-slate-50/50'
                  }`}
                >
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.docx,.txt"
                  />
                  <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-slate-700">Arraste ou clique para enviar os arquivos</p>
                  <p className="text-xs text-slate-400 mt-1">Formatos suportados: PDF, DOCX, TXT</p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-100 p-2 rounded">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Arquivos selecionados ({selectedFiles.length})</p>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-150">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileText className="h-3.5 w-3.5 text-[#002B36] shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                          {file.size}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {storageType === 'local' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-xs text-slate-600 flex gap-2">
                  <HelpCircle className="h-4.5 w-4.5 shrink-0 text-[#D4AF37]" />
                  <span>Selecione uma subpasta commitada em knowledge/sources/original. O sistema executa pré-processamento automático para popular os módulos do caso.</span>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Base NotebookLM (Automação)</p>
                    <button
                      type="button"
                      onClick={syncReferenceBaseNow}
                      disabled={isSyncingReferenceBase}
                      className={`text-[11px] px-2 py-1 rounded border font-semibold transition-colors ${
                        isSyncingReferenceBase
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-[#002B36] text-white border-[#002B36] hover:bg-[#004050]'
                      }`}
                    >
                      {isSyncingReferenceBase ? 'Sincronizando...' : 'Sincronizar agora'}
                    </button>
                  </div>

                  {isLoadingReferenceBaseStatus && (
                    <p className="text-[11px] text-slate-500">Carregando status da base de referência...</p>
                  )}

                  {!isLoadingReferenceBaseStatus && referenceBaseStatus && (
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <p>
                        Pacote estruturado: <span className={`font-semibold ${referenceBaseStatus.packageReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {referenceBaseStatus.packageReady ? 'Pronto' : 'Pendente'}
                        </span>
                      </p>
                      <p>Última geração: <span className="font-semibold text-slate-700">{formatTimestamp(referenceBaseStatus.packageGeneratedAt)}</span></p>
                      <p>
                        Assinatura: <span className="font-semibold text-slate-700">
                          {referenceBaseStatus.signature.fileCount} arquivo(s), {formatBytes(referenceBaseStatus.signature.totalBytes)}
                        </span>
                      </p>
                      {referenceBaseStatus.stats && (
                        <p>
                          OCR/base útil: <span className="font-semibold text-slate-700">{referenceBaseStatus.stats.nonEmptyTextFiles}</span> com texto,
                          <span className="font-semibold text-slate-700"> {referenceBaseStatus.stats.emptyTextFiles}</span> vazios
                        </p>
                      )}
                    </div>
                  )}

                  {referenceBaseSyncInfo && (
                    <p className="text-[11px] text-emerald-700">
                      Último sync: {referenceBaseSyncInfo.refreshed ? 'base atualizada' : 'cache reaproveitado'}
                      {referenceBaseSyncInfo.packageGeneratedAt ? ` (${formatTimestamp(referenceBaseSyncInfo.packageGeneratedAt)})` : ''}.
                    </p>
                  )}

                  {referenceBaseStatusError && (
                    <p className="text-[11px] text-rose-700">{referenceBaseStatusError}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Caso por Subpasta Commitada</label>
                  <select
                    value={selectedFolderCaseId}
                    onChange={e => setSelectedFolderCaseId(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  >
                    <option value="">-- Selecionar Subpasta --</option>
                    {folderCases.map(folderCase => (
                      <option key={folderCase.id} value={folderCase.id}>
                        {folderCase.displayName} ({folderCase.fileCount} arquivo(s))
                      </option>
                    ))}
                  </select>
                  {isLoadingFolderCases && (
                    <p className="text-[11px] text-slate-500">Lendo subpastas versionadas...</p>
                  )}
                  {!isLoadingFolderCases && folderCases.length === 0 && (
                    <p className="text-[11px] text-slate-500">Nenhuma subpasta com arquivos compatíveis foi encontrada.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Folder className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Subpasta Selecionada
                  </label>
                  <input 
                    id="newcase-local-path"
                    type="text" 
                    value={localFolder}
                    readOnly
                    placeholder="Selecione a subpasta no campo acima"
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>
                {isPreprocessingFolder && (
                  <p className="text-[11px] text-amber-700">Pré-processando subpasta selecionada...</p>
                )}
                {!isPreprocessingFolder && folderPreprocessError && (
                  <p className="text-[11px] text-rose-700">Erro no pré-processamento: {folderPreprocessError}</p>
                )}
                {!isPreprocessingFolder && !folderPreprocessError && preprocessedFolderDocs.length > 0 && (
                  <p className="text-[11px] text-emerald-700">
                    Pré-processamento concluído: {preprocessedFolderDocs.filter((entry) => entry.status === 'processed').length}/{preprocessedFolderDocs.length} arquivos prontos.
                  </p>
                )}
                {selectedFolderCase && (
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-100 p-2 rounded">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fontes detectadas ({selectedFolderCase.fileCount})</p>
                    {selectedFolderCase.files.map((file, idx) => (
                      <div key={`${file.relativePath}-${idx}`} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-150">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileText className="h-3.5 w-3.5 text-[#002B36] shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                          {file.size}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Garantias do Protótipo</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Os dados cadastrados serão persistidos dinamicamente na sandbox.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Criação de novos fluxos de teses inteligentes baseadas no tribunal.</span>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Roteirizador integrado editável para conformidade processual rápida.</span>
              </div>
            </div>

            <button
              id="newcase-submit-btn"
              type="submit"
              disabled={storageType === 'local' && isAutoCreatedForSelectedFolder}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-bold transition-all shadow border mt-4 ${
                storageType === 'local' && isAutoCreatedForSelectedFolder
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-[#002B36] hover:bg-[#004050] text-white border-[#D4AF37]/30 hover:border-[#D4AF37]/60 cursor-pointer'
              }`}
            >
              {storageType === 'local' && isAutoCreatedForSelectedFolder
                ? 'Caso criado automaticamente no pré-processamento'
                : 'Criar Caso & Sincronizar Fontes'}
              <ArrowRight className={`h-4.5 w-4.5 ${storageType === 'local' && isAutoCreatedForSelectedFolder ? 'text-slate-400' : 'text-[#D4AF37]'}`} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
