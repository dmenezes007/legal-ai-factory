import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2,
  BookmarkCheck,
  Scale,
  Database,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { LegalCase, LegalThesis } from '../types';
import { geminiService } from '../services/geminiService';

interface ThesesMapProps {
  activeCase: LegalCase;
  theses: LegalThesis[];
  onThesesUpdated: (updatedTheses: LegalThesis[], newLogs?: any[]) => void;
  onNextStep: () => void;
}

export default function ThesesMap({
  activeCase,
  theses,
  onThesesUpdated,
  onNextStep
}: ThesesMapProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New thesis form fields
  const [newTitle, setNewTitle] = useState('');
  const [newHypothesis, setNewHypothesis] = useState('');
  const [newNormBasis, setNewNormBasis] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [newType, setNewType] = useState<'preliminar' | 'merito' | 'processual'>('merito');

  const handleGenerateTheses = async () => {
    setIsGenerating(true);
    try {
      const result = await geminiService.generateTheses(activeCase, null as any);
      onThesesUpdated(result.theses, result.logs);
    } catch (err) {
      console.error('Error generating theses:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleThesis = (id: string) => {
    const updated = theses.map(t => {
      if (t.id === id) {
        return { ...t, selected: !t.selected };
      }
      return t;
    });
    onThesesUpdated(updated);
  };

  const handleAddThesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHypothesis || !newNormBasis) {
      alert('Por favor, preencha Título, Hipótese de Incidência e Fundamento Normativo.');
      return;
    }

    const newT: LegalThesis = {
      id: `thesis_custom_${Math.random().toString(36).substr(2, 9)}`,
      caseId: activeCase.id,
      title: newTitle,
      hypothesis: newHypothesis,
      adherence: 'Alta',
      normativeBasis: newNormBasis,
      relatedEvidence: newEvidence || 'Análise de manifestações ou ausência de provas do autor.',
      correlatedRequest: newRequest || 'Improcedência do pedido.',
      selected: true,
      type: newType
    };

    onThesesUpdated([...theses, newT]);
    
    // Clear fields
    setNewTitle('');
    setNewHypothesis('');
    setNewNormBasis('');
    setNewEvidence('');
    setNewRequest('');
    setShowAddModal(false);
  };

  const handleDeleteThesis = (id: string) => {
    const filtered = theses.filter(t => t.id !== id);
    onThesesUpdated(filtered);
  };

  const getAdherenceBadge = (adherence: 'Alta' | 'Média' | 'Baixa') => {
    switch (adherence) {
      case 'Alta':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Alta</span>;
      case 'Média':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">Baixa</span>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preliminar': return 'Preliminar';
      case 'processual': return 'Processual';
      default: return 'Mérito';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preliminar': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'processual': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const selectedCount = theses.filter(t => t.selected).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Mapa de Teses Defensivas</h2>
          <p className="text-sm text-slate-500">
            Selecione as teses jurídicas ideais para combater os pedidos da inicial. Você pode complementar com teses customizadas.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#D4AF37]" />
            Nova Tese Manual
          </button>

          {theses.length > 0 ? (
            <button
              onClick={onNextStep}
              disabled={selectedCount === 0}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border cursor-pointer ${
                selectedCount === 0 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 border-[#D4AF37]/40'
              }`}
            >
              Definir Roteiro ({selectedCount} selecionadas)
              <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
            </button>
          ) : (
            <button
              onClick={handleGenerateTheses}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-4 py-2.5 rounded-md text-sm font-bold transition-all border border-[#D4AF37]/30 cursor-pointer"
            >
              Mapear Teses com IA
            </button>
          )}
        </div>
      </div>

      {theses.length === 0 ? (
        /* Empty state */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
          <div className="h-14 w-14 bg-[#002B36]/5 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#002B36] shadow-inner">
            <Layers className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Mapeamento Dinâmico de Teses</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Nenhuma tese jurídica foi mapeada para o caso ainda. O motor inteligente cruzará as lacunas com repositórios de jurisprudência e Súmulas.
            </p>
          </div>
          <button
            onClick={handleGenerateTheses}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-5 py-3 rounded-md text-sm font-bold transition-all border border-[#D4AF37]/30 cursor-pointer"
          >
            {isGenerating ? 'Analisando Jurisprudência...' : 'Gerar Mapa de Teses Inteligente'}
          </button>
        </div>
      ) : (
        /* Theses Map Grid */
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-[#D4AF37]" />
                Matriz de Defesa Estratégica
              </h3>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                Selecionadas: {selectedCount} de {theses.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center w-12">Ativo</th>
                    <th className="py-3 px-4 w-52">Tese / Tipo</th>
                    <th className="py-3 px-4 w-72">Hipótese de Incidência</th>
                    <th className="py-3 px-4 text-center w-20">Aderência</th>
                    <th className="py-3 px-4 w-48">Fundamento Normativo</th>
                    <th className="py-3 px-4 w-48">Provas Relacionadas</th>
                    <th className="py-3 px-4 w-48">Pedido Correlato</th>
                    <th className="py-3 px-4 text-center w-12">Excluir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {theses.map((thesis) => (
                    <tr 
                      key={thesis.id} 
                      className={`hover:bg-slate-50/30 transition-all ${
                        thesis.selected ? 'bg-[#D4AF37]/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={thesis.selected}
                          onChange={() => handleToggleThesis(thesis.id)}
                          className="h-4.5 w-4.5 text-[#002B36] focus:ring-[#002B36] border-slate-300 rounded cursor-pointer"
                        />
                      </td>

                      {/* Title & Type */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 leading-snug">{thesis.title}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mt-1.5 border ${getTypeColor(thesis.type)}`}>
                          {getTypeLabel(thesis.type)}
                        </span>
                      </td>

                      {/* Hypothesis */}
                      <td className="py-4 px-4 text-slate-600 leading-relaxed font-sans">
                        {thesis.hypothesis}
                      </td>

                      {/* Adherence */}
                      <td className="py-4 px-4 text-center">
                        {getAdherenceBadge(thesis.adherence)}
                      </td>

                      {/* Normative Basis */}
                      <td className="py-4 px-4 text-slate-600 leading-relaxed font-mono text-[11px]">
                        {thesis.normativeBasis}
                      </td>

                      {/* Related Evidence */}
                      <td className="py-4 px-4 text-slate-600 leading-relaxed font-sans">
                        {thesis.relatedEvidence}
                      </td>

                      {/* Correlated Request */}
                      <td className="py-4 px-4 text-slate-600 leading-relaxed font-sans">
                        {thesis.correlatedRequest}
                      </td>

                      {/* Delete Action (Manual Add-ons) */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDeleteThesis(thesis.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Thesis Modal / Panel */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4.5 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#D4AF37]" />
                Cadastrar Tese Defensiva Manual
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddThesis} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título da Tese *</label>
                  <input 
                    type="text" 
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex: Teoria do Adimplemento Substancial"
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classificação *</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  >
                    <option value="preliminar">Preliminar de Mérito / Processual</option>
                    <option value="merito">Prejudicial / Mérito Principal</option>
                    <option value="processual">Pedido de Efeitos / Processual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hipótese de Incidência (Fato) *</label>
                <textarea 
                  rows={2}
                  required
                  value={newHypothesis}
                  onChange={e => setNewHypothesis(e.target.value)}
                  placeholder="Explique como a tese se enquadra na narrativa factual do caso"
                  className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fundamento Normativo (Artigos/Precedentes) *</label>
                <input 
                  type="text" 
                  required
                  value={newNormBasis}
                  onChange={e => setNewNormBasis(e.target.value)}
                  placeholder="Ex: Artigo 475 do CC; Súmula 381 do TST"
                  className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Provas Relacionadas</label>
                  <input 
                    type="text" 
                    value={newEvidence}
                    onChange={e => setNewEvidence(e.target.value)}
                    placeholder="Ex: Relatório de vistoria técnica"
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pedido Correlato</label>
                  <input 
                    type="text" 
                    value={newRequest}
                    onChange={e => setNewRequest(e.target.value)}
                    placeholder="Ex: Improcedência total da resolução contratual"
                    className="w-full bg-slate-50 text-slate-900 text-sm py-2 px-3 rounded border border-slate-200 focus:outline-none focus:border-[#002B36] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-sm hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#002B36] text-white font-bold rounded text-sm hover:bg-[#004050] cursor-pointer"
                >
                  Adicionar Tese ao Mapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
