import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Database,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { LegalCase, CaseDocument } from '../types';
import { geminiService } from '../services/geminiService';

interface CaseSourcesProps {
  activeCase: LegalCase;
  documents: CaseDocument[];
  onDocumentsProcessed: (processedDocs: CaseDocument[], newLogs: any[]) => void;
  onNextStep: () => void;
}

export default function CaseSources({
  activeCase,
  documents,
  onDocumentsProcessed,
  onNextStep
}: CaseSourcesProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progresses, setProgresses] = useState<Record<string, number>>({});

  const handleProcessSources = async () => {
    setIsProcessing(true);
    
    // Create initial 0% progresses for pending ones
    const initialProgresses: Record<string, number> = {};
    documents.forEach(doc => {
      if (doc.status !== 'processed') {
        initialProgresses[doc.id] = 0;
      }
    });
    setProgresses(initialProgresses);

    try {
      const result = await geminiService.processDocuments(
        activeCase.id,
        documents,
        (docId, progress) => {
          setProgresses(prev => ({
            ...prev,
            [docId]: progress
          }));
        }
      );

      // Save processed documents and logs to app state
      onDocumentsProcessed(result.processedDocs, result.logs);
    } catch (err) {
      console.error('Error processing documents:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'docx':
        return <FileText className="h-6 w-6 text-indigo-600" />;
      case 'drive':
        return <CloudLightning className="h-6 w-6 text-amber-600" />;
      default:
        return <FileText className="h-6 w-6 text-rose-600" />;
    }
  };

  const getStatusBadge = (doc: CaseDocument) => {
    if (isProcessing && progresses[doc.id] !== undefined && progresses[doc.id] < 100) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          {progresses[doc.id]}%
        </span>
      );
    }

    switch (doc.status) {
      case 'processed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Processado
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Erro
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            Pendente
          </span>
        );
    }
  };

  const allProcessed = documents.every(d => d.status === 'processed');
  const somePending = documents.some(d => d.status === 'pending');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Fontes do Caso e Ingestão Documental</h2>
          <p className="text-sm text-slate-500">
            Gerencie os documentos associados ao processo de <strong className="text-slate-800">{activeCase.client}</strong>. O motor de IA extrairá textos e indexará o caso.
          </p>
        </div>

        {allProcessed ? (
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/40 cursor-pointer"
          >
            Prosseguir para Processamento
            <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
          </button>
        ) : (
          <button
            onClick={handleProcessSources}
            disabled={isProcessing || !somePending}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border cursor-pointer ${
              isProcessing 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : !somePending 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-[#002B36] hover:bg-[#004050] text-white border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin text-[#D4AF37]" />
                Extraindo Textos (OCR)...
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5 text-[#D4AF37] fill-[#D4AF37]" />
                Processar Fontes de IA
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left list of docs */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-[#D4AF37]" />
                Acervo Documental ({documents.length} itens)
              </h3>
              <span className="text-xs text-slate-400 font-medium">Processo: {activeCase.number}</span>
            </div>

            <div className="divide-y divide-slate-150">
              {documents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  Nenhum documento anexado a este processo. Retorne ao formulário de cadastro ou insira novos itens.
                </div>
              ) : (
                documents.map((doc) => {
                  const docProgress = progresses[doc.id] || 0;
                  const isDocProcessing = isProcessing && docProgress > 0 && docProgress < 100;

                  return (
                    <div key={doc.id} className="p-5 hover:bg-slate-50/30 transition-colors space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                          <div className="p-2 bg-slate-100 rounded-lg shrink-0 border border-slate-200/50">
                            {getDocIcon(doc.type)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="font-mono">{doc.size}</span>
                              <span>•</span>
                              <span className="capitalize">Arquivo {doc.type}</span>
                            </div>
                          </div>
                        </div>

                        {getStatusBadge(doc)}
                      </div>

                      {/* Snippet box if processed */}
                      {doc.contentSnippet && (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500 font-mono leading-relaxed">
                          {doc.contentSnippet}
                        </div>
                      )}

                      {/* Progress bar during live simulated run */}
                      {isDocProcessing && (
                        <div className="w-full space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                            <div 
                              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${docProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                            <span>LENDO TEXTO E REMOVENDO ASSINATURAS...</span>
                            <span>{docProgress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right side help/analytics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Database className="h-4 w-4 text-[#D4AF37]" />
              ESTATÍSTICAS DA INGESTÃO
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Total de Documentos</span>
                <span className="font-bold text-slate-800">{documents.length}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Lidos com Sucesso</span>
                <span className="font-bold text-emerald-700">
                  {documents.filter(d => d.status === 'processed').length}
                </span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-medium">Pendentes de Leitura</span>
                <span className="font-bold text-amber-700">
                  {documents.filter(d => d.status === 'pending').length}
                </span>
              </div>
            </div>

            {somePending && !isProcessing && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex gap-1.5 items-start">
                <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Existem documentos aguardando processamento. Clique em "Processar Fontes de IA" para que o sistema execute a leitura OCR.
                </span>
              </div>
            )}

            {allProcessed && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 space-y-2">
                <div className="flex gap-1.5 items-start">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">Sincronização 100% Concluída!</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Todos os arquivos foram lidos, catalogados e estão prontos para que possamos emitir o Diagnóstico Jurídico Avançado do caso.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
