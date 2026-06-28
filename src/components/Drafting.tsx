import React, { useState } from 'react';
import { 
  FileEdit, 
  Sparkles, 
  CheckCircle, 
  RotateCw, 
  Save, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Edit2,
  FileText
} from 'lucide-react';
import { LegalCase, LegalThesis, OutlineItem } from '../types';
import { geminiService } from '../services/geminiService';

interface DraftingProps {
  activeCase: LegalCase;
  selectedTheses: LegalThesis[];
  outline: OutlineItem[];
  onOutlineUpdated: (updatedOutline: OutlineItem[]) => void;
  onNextStep: () => void;
}

export default function Drafting({
  activeCase,
  selectedTheses,
  outline,
  onOutlineUpdated,
  onNextStep
}: DraftingProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    outline.length > 0 ? outline[0].id : null
  );
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const activeItem = outline.find(item => item.id === selectedItemId);

  const handleGenerateChapter = async (item: OutlineItem) => {
    setIsGenerating(prev => ({ ...prev, [item.id]: true }));
    try {
      const result = await geminiService.draftChapter(activeCase, item, selectedTheses);
      const reviewedContent = await geminiService.autoReviewChapter(result.draftedContent);
      
      const updated = outline.map(o => {
        if (o.id === item.id) {
          return {
            ...o,
            content: reviewedContent,
            status: 'revisado' as const
          };
        }
        return o;
      });

      onOutlineUpdated(updated);
    } catch (err) {
      console.error('Error drafting chapter:', err);
      alert('Falha na geração do capítulo em modo real. Verifique status da Gemini API (quota/chave) no painel lateral.');
    } finally {
      setIsGenerating(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleGenerateAllChapters = async () => {
    // Generate one by one
    for (const item of outline) {
      if (!item.content) {
        await handleGenerateChapter(item);
      }
    }
  };

  const handleContentChange = (content: string) => {
    if (!selectedItemId) return;
    const updated = outline.map(o => {
      if (o.id === selectedItemId) {
        return { ...o, content };
      }
      return o;
    });
    onOutlineUpdated(updated);
  };

  const handleStatusChange = (status: OutlineItem['status']) => {
    if (!selectedItemId) return;
    const updated = outline.map(o => {
      if (o.id === selectedItemId) {
        return { ...o, status };
      }
      return o;
    });
    onOutlineUpdated(updated);
  };

  const getStatusBadge = (status: OutlineItem['status']) => {
    switch (status) {
      case 'aprovado':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Aprovado</span>;
      case 'revisado':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Revisado</span>;
      case 'gerado':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Gerado</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">Não Iniciado</span>;
    }
  };

  // Progress metrics
  const totalChapters = outline.length;
  const approvedChapters = outline.filter(o => o.status === 'aprovado').length;
  const draftedChapters = outline.filter(o => o.content).length;
  
  const progressPercent = totalChapters > 0 ? Math.round((draftedChapters / totalChapters) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Redação de Capítulos por IA</h2>
          <p className="text-sm text-slate-500">
            Gere textos jurídicos robustos para cada capítulo individualmente. Revise e edite a prosa antes do fechamento.
          </p>
        </div>

        <div className="flex gap-2">
          {draftedChapters < totalChapters && (
            <button
              onClick={handleGenerateAllChapters}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#D4AF37]/40 bg-[#002B36]/5 hover:bg-[#002B36]/10 text-[#002B36] text-xs font-bold rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              Redigir Capítulos Faltantes
            </button>
          )}

          <button
            onClick={onNextStep}
            disabled={draftedChapters === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border cursor-pointer ${
              draftedChapters === 0 
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 border-[#D4AF37]/40'
            }`}
          >
            Prosseguir para Revisão
            <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Draft Progress Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <FileEdit className="h-4 w-4 text-[#D4AF37]" />
            PROGRESO DA REDAÇÃO
          </span>
          <span className="font-mono text-slate-500 font-bold">
            {draftedChapters} de {totalChapters} capítulos gerados ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
          <div 
            className="bg-[#002B36] h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {outline.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          Nenhum capítulo cadastrado no roteiro do caso. Retorne à etapa de "Roteiro / Arquitetura" para gerar os tópicos.
        </div>
      ) : (
        /* Workspace layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Selector of chapters */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Capítulos da Contestação</h3>
              </div>
              <div className="divide-y divide-slate-150 max-h-[500px] overflow-y-auto">
                {outline.map((item, idx) => {
                  const isSelected = selectedItemId === item.id;
                  const isGen = isGenerating[item.id];

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`w-full p-4 text-left transition-all flex justify-between items-start gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-[#D4AF37]/10 border-l-4 border-[#D4AF37] pl-3' 
                          : 'hover:bg-slate-50/65'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h4 className="font-bold text-slate-800 text-xs leading-snug font-sans truncate">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                            Tópico {idx + 1}
                          </span>
                          <span>•</span>
                          <span className="text-[10px] uppercase text-[#D4AF37] font-bold">
                            {item.sectionType}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isGen ? (
                          <span className="p-1 rounded bg-amber-50 border border-amber-200">
                            <RotateCw className="h-3 w-3 animate-spin text-amber-600" />
                          </span>
                        ) : (
                          getStatusBadge(item.status)
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Drafting pane and live text area */}
          <div className="lg:col-span-8">
            {activeItem ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                {/* Active Chapter Header */}
                <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                        TÓPICO {outline.indexOf(activeItem) + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-medium capitalize">Seção: {activeItem.sectionType}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1.5 font-sans truncate">{activeItem.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status selection */}
                    <select 
                      value={activeItem.status}
                      onChange={e => handleStatusChange(e.target.value as any)}
                      className="bg-white text-slate-800 text-xs py-1.5 px-2.5 rounded border border-slate-300 focus:outline-none focus:border-[#002B36] font-semibold"
                    >
                      <option value="nao_iniciado">Não Iniciado</option>
                      <option value="gerado">Gerado</option>
                      <option value="revisado">Revisado</option>
                      <option value="aprovado">Aprovado ✓</option>
                    </select>

                    <button
                      onClick={() => handleGenerateChapter(activeItem)}
                      disabled={isGenerating[activeItem.id]}
                      className="flex items-center gap-1.5 bg-[#002B36] hover:bg-[#004050] text-white px-3.5 py-1.5 rounded text-xs font-bold transition-all border border-[#D4AF37]/20 cursor-pointer"
                    >
                      {isGenerating[activeItem.id] ? (
                        <>
                          <RotateCw className="h-3 w-3 animate-spin text-[#D4AF37]" />
                          Redigindo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                          {activeItem.content ? 'Regerar com IA' : 'Redigir Capítulo'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Drafting Textarea Workspace */}
                <div className="flex-1 p-6 flex flex-col space-y-4">
                  {activeItem.content ? (
                    <div className="flex-1 flex flex-col space-y-3">
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <span className="font-semibold flex items-center gap-1">
                          <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                          EDITOR DE TEXTO JURÍDICO
                        </span>
                        <span>Caracteres: {activeItem.content.length}</span>
                      </div>
                      <textarea
                        rows={18}
                        value={activeItem.content}
                        onChange={e => handleContentChange(e.target.value)}
                        className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#002B36] font-serif leading-relaxed text-justify resize-none"
                      />
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <FileText className="h-10 w-10 text-slate-300" />
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm">Este capítulo está vazio</h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Utilize o motor inteligente clicando no botão "Redigir Capítulo" acima para gerar uma redação jurídica formal baseada no caso de {activeCase.client}.
                        </p>
                      </div>
                      <button
                        onClick={() => handleGenerateChapter(activeItem)}
                        disabled={isGenerating[activeItem.id]}
                        className="flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-4 py-2 rounded text-xs font-bold transition-all border border-[#D4AF37]/20 cursor-pointer"
                      >
                        {isGenerating[activeItem.id] ? (
                          <>
                            <RotateCw className="h-3.5 w-3.5 animate-spin" />
                            Redigindo Prosa...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                            Acionar Redator de IA
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Workspace footer */}
                {activeItem.content && (
                  <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">
                      Modificações manuais são salvas localmente no navegador.
                    </span>
                    <button
                      onClick={() => handleStatusChange('aprovado')}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded text-xs font-bold transition-all border border-emerald-500 shadow-sm cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprovar Capítulo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center text-slate-400">
                Selecione um capítulo no menu lateral para visualizar seu editor.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
