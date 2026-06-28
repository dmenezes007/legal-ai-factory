import React, { useState } from 'react';
import { 
  Scale, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  CheckCircle,
  FileText,
  RotateCw,
  Eye,
  Check
} from 'lucide-react';
import { LegalCase, LegalThesis, OutlineItem } from '../types';
import { geminiService } from '../services/geminiService';

interface ArchitectureProps {
  activeCase: LegalCase;
  selectedTheses: LegalThesis[];
  outline: OutlineItem[];
  onOutlineUpdated: (updatedOutline: OutlineItem[], newLogs?: any[]) => void;
  onNextStep: () => void;
}

export default function Architecture({
  activeCase,
  selectedTheses,
  outline,
  onOutlineUpdated,
  onNextStep
}: ArchitectureProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fields for adding a custom chapter
  const [newTitle, setNewTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState<OutlineItem['sectionType']>('merito');

  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    try {
      const result = await geminiService.generateArchitecture(activeCase, selectedTheses);
      onOutlineUpdated(result.outline, result.logs);
    } catch (err) {
      console.error('Error generating architecture:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...outline];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    // Re-index orders
    const finalItems = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    onOutlineUpdated(finalItems);
  };

  const handleStartEdit = (item: OutlineItem) => {
    setEditingItemId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingTitle.trim()) return;
    const updated = outline.map(item => {
      if (item.id === id) {
        return { ...item, title: editingTitle };
      }
      return item;
    });
    onOutlineUpdated(updated);
    setEditingItemId(null);
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newChapter: OutlineItem = {
      id: `out_custom_${Math.random().toString(36).substr(2, 9)}`,
      caseId: activeCase.id,
      title: `${outline.length + 1}. ${newTitle.toUpperCase()}`,
      sectionType: newSectionType,
      content: '',
      status: 'nao_iniciado',
      order: outline.length + 1
    };

    onOutlineUpdated([...outline, newChapter]);
    setNewTitle('');
  };

  const handleDeleteChapter = (id: string) => {
    const filtered = outline.filter(item => item.id !== id);
    // Re-index remaining
    const reordered = filtered.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    onOutlineUpdated(reordered);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Roteiro e Arquitetura da Contestação</h2>
          <p className="text-sm text-slate-500">
            Estruture o sumário da contestação. Reordene, edite os títulos ou adicione capítulos adicionais.
          </p>
        </div>

        {outline.length > 0 ? (
          <div className="flex gap-2">
            <button
              onClick={handleGenerateOutline}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Resetar Estrutura
            </button>
            <button
              onClick={onNextStep}
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/40 cursor-pointer"
            >
              Iniciar Redação
              <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateOutline}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-4 py-2.5 rounded-md text-sm font-bold transition-all border border-[#D4AF37]/30 cursor-pointer"
          >
            {isGenerating ? 'Calculando Roteiro...' : 'Gerar Roteiro Estruturado'}
          </button>
        )}
      </div>

      {outline.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
          <div className="h-14 w-14 bg-[#002B36]/5 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#002B36] shadow-inner">
            <Scale className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Gerar Arquitetura do Documento</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Com base nas teses selecionadas para a defesa de <strong className="text-slate-800">{activeCase.client}</strong>, criaremos uma sequência lógica de capítulos processuais, preliminares e mérito.
            </p>
          </div>
          <button
            onClick={handleGenerateOutline}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-5 py-3 rounded-md text-sm font-bold transition-all border border-[#D4AF37]/30 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-[#D4AF37]" />
                Montando Roteiro...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-[#D4AF37]" />
                Construir Capítulos Defensivos
              </>
            )}
          </button>
        </div>
      ) : (
        /* Active Chapter Editor Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-[#D4AF37]" />
                  Sequenciamento dos Capítulos ({outline.length} Tópicos)
                </h3>
              </div>

              <div className="divide-y divide-slate-150 p-4 space-y-3">
                {outline.map((item, index) => {
                  const isEditing = editingItemId === item.id;
                  const isFirst = index === 0;
                  const isLast = index === outline.length - 1;

                  return (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        {/* Number Index */}
                        <span className="flex h-6 w-6 rounded bg-slate-200 text-slate-700 font-mono text-xs font-bold items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={editingTitle}
                                onChange={e => setEditingTitle(e.target.value)}
                                className="bg-white text-slate-900 text-sm py-1 px-2 rounded border border-slate-300 focus:outline-none focus:border-[#002B36] w-full"
                              />
                              <button 
                                onClick={() => handleSaveEdit(item.id)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm shrink-0 flex items-center justify-center h-8 w-8"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <h4 className="font-bold text-slate-800 text-sm font-sans truncate">{item.title}</h4>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                            <span className="uppercase">{item.sectionType}</span>
                            <span>•</span>
                            <span className="capitalize">Status: {item.status === 'nao_iniciado' ? 'Não Iniciado' : 'Pronto'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Reordering */}
                        <button
                          disabled={isFirst}
                          onClick={() => moveItem(index, 'up')}
                          className={`p-1.5 rounded transition-colors ${
                            isFirst ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title="Mover para Cima"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => moveItem(index, 'down')}
                          className={`p-1.5 rounded transition-colors ${
                            isLast ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                          title="Mover para Baixo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        {/* Title Edit */}
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          title="Editar Título"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteChapter(item.id)}
                          className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-rose-600 transition-colors"
                          title="Excluir Capítulo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar Chapter Adding Tools */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Adicionar Capítulo</h4>

              <form onSubmit={handleAddChapter} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título do Tópico</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex: Da Inépcia da Inicial"
                    className="w-full bg-slate-50 text-slate-900 text-xs py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enquadramento</label>
                  <select 
                    value={newSectionType}
                    onChange={e => setNewSectionType(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 text-xs py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  >
                    <option value="preambulo">Preâmbulo</option>
                    <option value="resumo">Resumo / Síntese</option>
                    <option value="preliminares">Preliminar</option>
                    <option value="merito">Mérito</option>
                    <option value="requerimentos">Requerimentos / Pedidos</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-[#002B36] hover:bg-[#004050] text-white py-2 rounded text-xs font-bold transition-all shadow border border-[#D4AF37]/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-[#D4AF37]" />
                  Inserir Capítulo
                </button>
              </form>
            </div>

            <div className="bg-[#002B36] text-white p-5 rounded-xl border border-[#D4AF37]/30 space-y-3 shadow">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                CONFORMIDADE PROCESSUAL
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                A D. Menezes Legal AI garante que a contestação seja estruturada de acordo com o Art. 336 e seguintes do CPC, ordenando de forma perfeita as preliminares antes do mérito de defesa.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
