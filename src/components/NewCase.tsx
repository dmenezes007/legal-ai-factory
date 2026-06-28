import React, { useEffect, useState, useRef } from 'react';
import { 
  Scale, 
  Upload, 
  Link, 
  Folder, 
  HelpCircle, 
  Plus, 
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

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8787';

export default function NewCase({ onCaseCreated }: NewCaseProps) {
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
  const [driveLink, setDriveLink] = useState('');
  const [localFolder, setLocalFolder] = useState('');
  const [storageType, setStorageType] = useState<'upload' | 'drive' | 'local'>('upload');
  const [folderCases, setFolderCases] = useState<FolderCaseSource[]>([]);
  const [selectedFolderCaseId, setSelectedFolderCaseId] = useState('');
  const [isLoadingFolderCases, setIsLoadingFolderCases] = useState(false);
  const selectedFolderCase = folderCases.find(item => item.id === selectedFolderCaseId) || null;

  // Documents state
  const [selectedFiles, setSelectedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (storageType !== 'local') {
      return;
    }

    let isCancelled = false;
    const loadFolderCases = async () => {
      setIsLoadingFolderCases(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/sources/folder-cases`);
        const payload = await response.json();
        if (!isCancelled) {
          setFolderCases(Array.isArray(payload.items) ? payload.items : []);
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
    if (!selectedFolderCase) {
      return;
    }

    setLocalFolder(selectedFolderCase.relativePath);
    setSelectedFiles(
      selectedFolderCase.files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    );

    if (!number) {
      setNumber(selectedFolderCase.displayName);
    }
    if (!observations) {
      setObservations(`Caso carregado a partir da subpasta commitada: ${selectedFolderCase.relativePath}`);
    }
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
      sourceMode: storageType === 'local' ? 'repository_folder' : storageType === 'upload' ? 'interface_upload' : 'drive',
      sourceFolder: storageType === 'local' ? localFolder : undefined,
      simulatedData: true,
      observations,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Create case documents based on uploads/drive
    const documents: CaseDocument[] = [];

    // Local uploads
    selectedFiles.forEach((file, index) => {
      documents.push({
        id: `doc_${caseId}_${index}`,
        caseId,
        name: file.name,
        size: file.size,
        type: (['pdf', 'docx', 'txt'].includes(file.type.toLowerCase()) ? file.type.toLowerCase() : 'pdf') as any,
        status: 'pending'
      });
    });

    // Google Drive / Local Folder simulation
    if (storageType === 'drive' && driveLink) {
      documents.push({
        id: `doc_${caseId}_drive`,
        caseId,
        name: `Pasta Google Drive: ${driveLink.substring(0, 30)}...`,
        size: 'N/A (Nuvem)',
        type: 'drive',
        status: 'pending'
      });
    } else if (storageType === 'local' && localFolder && selectedFiles.length === 0) {
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
                onClick={() => setStorageType('drive')}
                className={`py-1.5 text-center rounded text-xs font-bold transition-all cursor-pointer ${
                  storageType === 'drive' ? 'bg-[#002B36] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Google Drive
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

            {storageType === 'drive' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-xs text-slate-600 flex gap-2">
                  <HelpCircle className="h-4.5 w-4.5 shrink-0 text-[#D4AF37]" />
                  <span>A D. Menezes Legal AI irá sincronizar todos os documentos contidos no diretório compartilhado do Google Drive.</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Link className="h-3.5 w-3.5 text-[#D4AF37]" />
                    Link da Pasta do Google Drive
                  </label>
                  <input 
                    id="newcase-drive-url"
                    type="url" 
                    value={driveLink}
                    onChange={e => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>
              </div>
            )}

            {storageType === 'local' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded text-xs text-slate-600 flex gap-2">
                  <HelpCircle className="h-4.5 w-4.5 shrink-0 text-[#D4AF37]" />
                  <span>Selecione uma subpasta commitada em knowledge/sources/original para montar o caso pelas fontes já versionadas.</span>
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
                    onChange={e => setLocalFolder(e.target.value)}
                    placeholder="Ex: notebooklm/casos/caso-aerobrasil"
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>
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
              className="w-full flex items-center justify-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white py-3 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 mt-4 cursor-pointer"
            >
              Criar Caso & Sincronizar Fontes
              <ArrowRight className="h-4.5 w-4.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
