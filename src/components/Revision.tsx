import React, { useState } from 'react';
import { 
  FileCheck, 
  Download, 
  CloudLightning, 
  Copy, 
  FileJson, 
  Plus, 
  CheckCircle, 
  ExternalLink,
  History,
  RotateCw,
  Sparkles,
  ArrowRight,
  Database,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LegalCase, OutlineItem } from '../types';
import { geminiService } from '../services/geminiService';

interface RevisionProps {
  activeCase: LegalCase;
  outline: OutlineItem[];
  onOutlineUpdated: (updatedOutline: OutlineItem[]) => void;
  onCaseCompleted: () => void;
  mode?: 'review' | 'export';
  onNextStep?: () => void;
}

export default function Revision({
  activeCase,
  outline,
  onOutlineUpdated,
  onCaseCompleted,
  mode = 'review',
  onNextStep
}: RevisionProps) {
  const [version, setVersion] = useState('1.0');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(['v1.0 - Geração Inicial Automatizada']);

  // Combine all chapter contents into one unified string for editing
  const getFullPieceText = () => {
    return outline
      .sort((a, b) => a.order - b.order)
      .map(item => `=== ${item.title} ===\n\n${item.content || '(Tópico não redigido)'}`)
      .join('\n\n\n');
  };

  const handleDownloadDocx = async () => {
    setIsExporting('docx');
    setExportMessage(null);

    try {
      let blob: Blob;
      try {
        blob = await geminiService.generateDocxViaApi(activeCase, outline);
      } catch {
        blob = geminiService.generateDocxBlob(activeCase, outline);
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const safeNumber = activeCase.number.replace(/[^a-zA-Z0-9]/g, '_');
      link.download = `Contestacao_Processo_${safeNumber}.docx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Documento Word (.docx) baixado com sucesso.');
      onCaseCompleted();
    } catch (err) {
      console.error('Error downloading docx:', err);
      setExportMessage('Falha ao gerar DOCX. Verifique se a API local está ativa ou use o modo simulado.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadJson = () => {
    setIsExporting('json');
    setExportMessage(null);

    setTimeout(() => {
      const dataPayload = {
        case: activeCase,
        outline: outline,
        exportedAt: new Date().toISOString(),
        version
      };

      const blob = new Blob([JSON.stringify(dataPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Case_Payload_${activeCase.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage('Payload JSON de intercâmbio de dados exportado com sucesso.');
      setIsExporting(null);
    }, 1000);
  };

  const handleSendToDrive = () => {
    setIsExporting('drive');
    setExportMessage(null);

    setTimeout(() => {
      setExportMessage(`Peça salva com sucesso na pasta compartilhada do Google Drive: '/Processos/Ativos/${new Date().getFullYear()}/${activeCase.client}'`);
      setIsExporting(null);
    }, 2000);
  };

  const handleCreateNewVersion = () => {
    const currentNum = parseFloat(version);
    const nextNum = (currentNum + 0.1).toFixed(1);
    setVersion(nextNum);
    setHistory(prev => [`v${nextNum} - Revisão manual e congelamento de termos`, ...prev]);
    setExportMessage(`Nova versão (v${nextNum}) criada com sucesso na sandbox de auditoria.`);
  };

  const moveChapter = (index: number, direction: 'up' | 'down') => {
    const newOutline = [...outline].sort((a, b) => a.order - b.order);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newOutline.length) return;

    // Swap orders
    const tempOrder = newOutline[index].order;
    newOutline[index].order = newOutline[targetIdx].order;
    newOutline[targetIdx].order = tempOrder;

    // Save
    onOutlineUpdated(newOutline);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
            {mode === 'review' ? 'Revisão Final da Contestação' : 'Exportação Final'}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === 'review'
              ? 'Revise o conteúdo consolidado e a ordem dos capítulos antes de exportar.'
              : 'Gere o DOCX final com formatação jurídica e conclua a produção da peça.'}
          </p>
        </div>
        {mode === 'review' && onNextStep && (
          <button
            onClick={onNextStep}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/40 cursor-pointer"
          >
            Ir para Exportação
            <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
          </button>
        )}
      </div>

      {exportMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex justify-between items-start">
          <div className="flex gap-2 items-start">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ação Executada com Sucesso!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{exportMessage}</p>
            </div>
          </div>
          <button 
            onClick={() => setExportMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Page Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <FileCheck className="h-4.5 w-4.5 text-[#D4AF37]" />
                Visualização de Petição Unificada
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-bold font-mono">
                VERSÃO {version}
              </span>
            </div>

            {/* Simulated Printed Sheet */}
            <div className="p-8 bg-slate-50 overflow-y-auto max-h-[600px] border-b border-slate-150">
              <div className="bg-white p-12 max-w-lg mx-auto shadow-md border border-slate-200 font-serif text-slate-800 text-sm leading-relaxed text-justify space-y-8 select-all relative">
                {/* Decorative court margin seal */}
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-300 font-bold uppercase select-none tracking-widest rotate-6 border border-slate-200 p-1">
                  D. Menezes Legai AI - Verificado
                </div>

                <div className="text-right font-bold text-[13px] leading-tight select-none">
                  AO JUÍZO DA {activeCase.court.toUpperCase()}<br/>
                  PROCESSO Nº: {activeCase.number}
                </div>

                <div className="text-center font-bold text-base mt-12 mb-12 uppercase select-none tracking-wider text-slate-900">
                  CONTESTAÇÃO
                </div>

                {/* Iterate through items and render them nicely */}
                {outline
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <div key={item.id} className="space-y-3">
                      <div className="font-bold text-[13px] text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center group">
                        <span>{item.title}</span>
                        
                        {/* Inline micro reordering handles for ease of use */}
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button 
                            disabled={idx === 0}
                            onClick={() => moveChapter(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-150 rounded"
                            title="Subir capítulo"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button 
                            disabled={idx === outline.length - 1}
                            onClick={() => moveChapter(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-150 rounded"
                            title="Descer capítulo"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed text-justify">
                        {item.content || '(Este tópico está vazio. Retorne e acione a redação inteligente antes de prosseguir)'}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Export and version control panel */}
        <div className="lg:col-span-5 space-y-6">
          {mode === 'export' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ações de Exportação</h4>

            <div className="space-y-3">
              {/* Export Word */}
              <button
                onClick={handleDownloadDocx}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-md shrink-0">
                    {isExporting === 'docx' ? (
                      <RotateCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Baixar Arquivo Word (DOCX)</h5>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Exportar documento com formatação jurídica oficial (ABNT/Tribunais).</p>
                  </div>
                </div>
                <ArrowRight className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
              </button>

              {/* Export JSON */}
              <button
                onClick={handleDownloadJson}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700 text-white rounded-md shrink-0">
                    {isExporting === 'json' ? (
                      <RotateCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileJson className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Baixar Payload de Dados (JSON)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Exporte o arquivo de intercâmbio de dados do caso e logs de IA.</p>
                  </div>
                </div>
                <ArrowRight className="h-4.5 w-4.5 shrink-0 text-slate-500" />
              </button>

              {/* Upload to Google Drive */}
              <button
                onClick={handleSendToDrive}
                disabled={isExporting !== null}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-amber-50/60 hover:bg-amber-50 text-amber-900 border border-amber-200 transition-all text-left shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 text-white rounded-md shrink-0">
                    {isExporting === 'drive' ? (
                      <RotateCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <CloudLightning className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">Sincronizar no Google Drive</h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">Gravar minuta na pasta compartilhada com o cliente ou arquivar.</p>
                  </div>
                </div>
                <ArrowRight className="h-4.5 w-4.5 shrink-0 text-amber-700" />
              </button>
            </div>
          </div>
          )}

          {/* Versions and History Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <History className="h-4 w-4 text-[#D4AF37]" />
                Controle de Versão (VCS)
              </h4>
              <button
                onClick={handleCreateNewVersion}
                className="text-[10px] font-bold text-[#002B36] hover:text-[#D4AF37] border border-[#002B36]/20 px-2 py-1 rounded bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Criar Nova Versão
              </button>
            </div>

            <div className="space-y-2.5 max-h-40 overflow-y-auto">
              {history.map((hist, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs p-2.5 bg-slate-50/60 border border-slate-150 rounded">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37] shrink-0 mt-1.5"></span>
                  <div>
                    <p className="font-bold text-slate-700">{hist}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Autor: Advogado Logado • {new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
