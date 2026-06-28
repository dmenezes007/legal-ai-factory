import React from 'react';
import { 
  FileText, 
  FolderLock, 
  Clock, 
  CheckCircle, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight,
  Scale
} from 'lucide-react';
import { LegalCase, OutlineItem } from '../types';

interface DashboardProps {
  cases: LegalCase[];
  outlineItems: Record<string, OutlineItem[]>;
  setSelectedCaseId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({
  cases,
  outlineItems,
  setSelectedCaseId,
  setActiveTab
}: DashboardProps) {
  // Compute analytics
  const totalCases = cases.length;
  
  // Counts based on actual statuses
  const pendingReview = cases.filter(c => c.status === 'drafting').length;
  const completed = cases.filter(c => c.status === 'completed').length;
  const inProgress = cases.filter(c => c.status !== 'completed' && c.status !== 'draft').length;

  const handleOpenCase = (caseId: string, status: string) => {
    setSelectedCaseId(caseId);
    if (status === 'draft') {
      setActiveTab('sources');
    } else if (status === 'processed') {
      setActiveTab('diagnostic');
    } else if (status === 'diagnosed') {
      setActiveTab('theses');
    } else if (status === 'theses_mapped') {
      setActiveTab('architecture');
    } else if (status === 'architecture_defined') {
      setActiveTab('drafting');
    } else if (status === 'drafting') {
      setActiveTab('drafting');
    } else {
      setActiveTab('revision');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Painel de Controle Jurídico</h2>
          <p className="text-sm text-slate-500">Acompanhamento e automação de peças processuais com inteligência artificial.</p>
        </div>
        <button
          onClick={() => setActiveTab('newcase')}
          className="flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-4 py-2.5 rounded-md text-sm font-medium transition-all shadow border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 cursor-pointer"
        >
          <PlusCircle className="h-4.5 w-4.5 text-[#D4AF37]" />
          Novo Processo
        </button>
      </div>

      {/* Grid of counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#002B36]"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total de Casos</p>
              <h3 className="text-3xl font-bold text-slate-950 mt-1 font-mono">{totalCases}</h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg group-hover:bg-[#002B36]/5 transition-colors">
              <FolderLock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +12%
            </span>
            <span>este mês</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Em Produção</p>
              <h3 className="text-3xl font-bold text-slate-950 mt-1 font-mono">{inProgress}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-100 transition-colors">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Fases ativas de IA</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pendentes de Revisão</p>
              <h3 className="text-3xl font-bold text-slate-950 mt-1 font-mono">{pendingReview}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Aguardando parecer final</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Peças Concluídas</p>
              <h3 className="text-3xl font-bold text-slate-950 mt-1 font-mono">{completed}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">100% aprovado</span>
          </div>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#D4AF37]" />
              Fila de Processos Recentes
            </h3>
            <p className="text-xs text-slate-500">Clique em qualquer processo para gerenciar as fontes, o diagnóstico ou redigir capítulos.</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
            Total cadastrado: {cases.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Processo / Juízo</th>
                <th className="py-3 px-6">Cliente vs Parte Contraria</th>
                <th className="py-3 px-6">Área Jurídica</th>
                <th className="py-3 px-6">Etapa Atual</th>
                <th className="py-3 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nenhum caso cadastrado na plataforma. Comece clicando em "Novo Processo".
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'draft': return 'Aguardando Fontes';
                      case 'processed': return 'Fontes Ingeridas';
                      case 'diagnosed': return 'Diagnóstico Feito';
                      case 'theses_mapped': return 'Teses Mapeadas';
                      case 'architecture_defined': return 'Roteiro Definido';
                      case 'drafting': return 'Em Redação';
                      case 'completed': return 'Finalizado / DOCX';
                      default: return status;
                    }
                  };

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      case 'drafting': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      case 'draft': return 'bg-rose-50 text-rose-700 border-rose-200';
                      default: return 'bg-amber-50 text-amber-700 border-amber-200';
                    }
                  };

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-slate-950 text-xs tracking-tight">{c.number}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{c.court}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800">
                          {c.client} <span className="text-slate-400 font-normal">({c.client === c.defendant ? 'Réu' : 'Autor'})</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Parte adversa: {c.client === c.defendant ? c.plaintiff : c.defendant}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 border border-slate-200 font-medium text-slate-600">
                          {c.legalArea}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(c.status)}`}>
                          {getStatusText(c.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenCase(c.id, c.status)}
                          className="inline-flex items-center gap-1 text-xs text-[#002B36] hover:text-[#D4AF37] font-bold transition-colors border border-slate-200 hover:border-[#D4AF37] px-3 py-1.5 rounded bg-white shadow-sm cursor-pointer"
                        >
                          Abrir Caso
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual walkthrough banner */}
      <div className="bg-[#002B36] text-white p-6 rounded-xl border border-[#D4AF37]/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
        
        <div className="space-y-2 z-10">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-white/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
            GUIA DE OPERAÇÃO
          </span>
          <h3 className="text-lg font-sans font-bold">Fluxo Produtivo Inteligente</h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Siga as etapas enumeradas no painel lateral para construir uma defesa excelente. Insira dados, processe as fontes com OCR, valide o diagnóstico gerado, selecione as teses do mapa inteligente, valide a arquitetura e acione a geração dos capítulos.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('newcase')}
          className="bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 font-extrabold px-5 py-3 rounded-md text-sm transition-all shadow-md shrink-0 border border-white/20 self-start md:self-auto cursor-pointer"
        >
          Cadastrar Novo Processo
        </button>
      </div>
    </div>
  );
}
