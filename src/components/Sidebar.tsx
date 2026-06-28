import React from 'react';
import { 
  Scale, 
  LayoutDashboard, 
  PlusCircle, 
  FolderOpen, 
  Brain, 
  Layers, 
  FileEdit, 
  FileCheck, 
  Activity,
  Database,
  ShieldAlert
} from 'lucide-react';
import { LegalCase } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cases: LegalCase[];
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  integrationMode: 'simulado' | 'real';
  setIntegrationMode: (mode: 'simulado' | 'real') => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  cases,
  selectedCaseId,
  setSelectedCaseId,
  integrationMode,
  setIntegrationMode
}: SidebarProps) {
  const activeCase = cases.find(c => c.id === selectedCaseId);

  // Helper to determine step status badge for navigation
  const getStepStatus = (step: string): { label: string; bg: string; text: string } | null => {
    if (!activeCase) return null;
    
    const statusOrder = ['draft', 'processed', 'diagnosed', 'theses_mapped', 'architecture_defined', 'drafting', 'completed'];
    const currentIdx = statusOrder.indexOf(activeCase.status);

    switch(step) {
      case 'newcase':
        return { label: 'Caso', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
      case 'sources':
        if (currentIdx >= 1) return { label: 'Processado', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
        return { label: 'Pendente', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
      case 'processing':
        if (currentIdx >= 3) return { label: 'Concluido', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
        if (currentIdx >= 2) return { label: 'Em curso', bg: 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30', bgDot: 'bg-indigo-500' } as any;
        if (currentIdx === 1) return { label: 'Gerar', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
        return { label: 'Aguardando', bg: 'bg-[#001D24] text-[#668288] border-[#003D4D]', bgDot: 'bg-slate-600' } as any;
      case 'architecture':
        if (currentIdx >= 4) return { label: 'Roteiro', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
        if (currentIdx === 3) return { label: 'Criar', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
        return { label: 'Aguardando', bg: 'bg-[#001D24] text-[#668288] border-[#003D4D]', bgDot: 'bg-slate-600' } as any;
      case 'drafting':
        if (currentIdx >= 5) return { label: 'Em Redação', bg: 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30', bgDot: 'bg-indigo-500' } as any;
        if (currentIdx === 4) return { label: 'Redigir', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
        return { label: 'Aguardando', bg: 'bg-[#001D24] text-[#668288] border-[#003D4D]', bgDot: 'bg-slate-600' } as any;
      case 'revision':
        if (currentIdx === 6) return { label: 'Revisado', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
        if (currentIdx === 5) return { label: 'Revisar', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
        return { label: 'Aguardando', bg: 'bg-[#001D24] text-[#668288] border-[#003D4D]', bgDot: 'bg-slate-600' } as any;
      case 'export':
        if (currentIdx === 6) return { label: 'Exportar', bg: 'bg-amber-950/40 text-amber-400 border-amber-900/30', bgDot: 'bg-amber-500' } as any;
        if (currentIdx > 6) return { label: 'Concluido', bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30', bgDot: 'bg-emerald-500' } as any;
        return { label: 'Aguardando', bg: 'bg-[#001D24] text-[#668288] border-[#003D4D]', bgDot: 'bg-slate-600' } as any;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'newcase', label: '1. Novo Caso', icon: PlusCircle, isStep: true },
    { id: 'sources', label: '2. Fontes', icon: FolderOpen, isStep: true },
    { id: 'processing', label: '3. Processamento', icon: Brain, isStep: true },
    { id: 'architecture', label: '4. Arquitetura da Defesa', icon: Scale, isStep: true },
    { id: 'drafting', label: '5. Produção', icon: FileEdit, isStep: true },
    { id: 'revision', label: '6. Revisão', icon: Layers, isStep: true },
    { id: 'export', label: '7. Exportação', icon: FileCheck, isStep: true },
    { id: 'logs', label: 'Logs e Auditoria', icon: Activity },
  ];

  return (
    <aside id="legal-ai-sidebar" className="fixed top-0 left-0 h-screen w-80 bg-[#002B36] text-[#A0B1B5] border-r border-[#001D24] flex flex-col z-20 shadow-xl">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-[#003D4D]">
        <div className="w-9 h-9 bg-[#D4AF37] rounded flex items-center justify-center font-bold text-[#002B36] shadow-md">
          <Scale className="h-5 w-5 text-[#002B36]" />
        </div>
        <div className="leading-tight">
          <h1 className="font-sans font-bold text-sm tracking-tight text-white italic">D. Menezes</h1>
          <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">Legai AI</span>
        </div>
      </div>

      {/* Case Context Selector */}
      <div className="p-4 bg-[#001D24] border-b border-[#003D4D] flex flex-col gap-2">
        <label className="text-[10px] uppercase font-bold text-[#668288] tracking-wider">Processo Ativo</label>
        <select 
          id="sidebar-case-selector"
          value={selectedCaseId || ''} 
          onChange={(e) => setSelectedCaseId(e.target.value || null)}
          className="w-full bg-[#003D4D] text-slate-100 text-sm py-2 px-3 rounded border border-[#001D24] focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
        >
          <option value="">-- Nenhum Selecionado --</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.number.substring(0, 15)}... ({c.client})
            </option>
          ))}
        </select>
        {activeCase ? (
          <div className="mt-1 flex items-center justify-between text-xs text-[#668288]">
            <span>Cliente: <strong className="text-slate-200 font-semibold">{activeCase.client}</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-[#003D4D] text-[#D4AF37] text-[10px] font-mono border border-[#001D24] font-bold">
              {activeCase.legalArea}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-[#D4AF37]/80 italic mt-0.5">Selecione ou crie um caso para operar</span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const stepStatus = item.isStep ? getStepStatus(item.id) : null;
          const isLocked = item.isStep && !selectedCaseId;

          const IconComponent = item.icon;

          return (
            <button
              id={`sidebar-nav-${item.id}`}
              key={item.id}
              disabled={isLocked && item.id !== 'newcase'}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-all cursor-pointer ${
                isActive 
                  ? 'bg-[#003D4D] text-[#D4AF37] font-semibold border-l-4 border-[#D4AF37] pl-2 shadow-sm' 
                  : isLocked && item.id !== 'newcase'
                  ? 'text-[#668288] cursor-not-allowed opacity-40' 
                  : 'text-[#A0B1B5] hover:bg-[#003D4D]/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#668288]'}`} />
                <span className="text-sm font-sans tracking-wide">{item.label}</span>
              </div>
              
              {/* Step Badges */}
              {stepStatus && selectedCaseId && (
                <div className={`flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full border ${stepStatus.bg}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${(stepStatus as any).bgDot}`}></span>
                  <span>{stepStatus.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Integration Control Panel */}
      <div className="p-4 bg-[#001D24] border-t border-[#003D4D] text-xs">
        <div className="flex items-center justify-between text-[11px] text-[#668288] font-semibold mb-2">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3 text-[#D4AF37]" />
            CONEXÃO DE DADOS
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#003D4D] text-[#A0B1B5] border border-[#001D24] text-[9px] font-bold">
            V1.0.0
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 bg-[#002B36] p-1 rounded border border-[#003D4D]">
          <button
            onClick={() => setIntegrationMode('simulado')}
            className={`py-1 text-center rounded transition-all text-[10px] font-bold uppercase cursor-pointer ${
              integrationMode === 'simulado'
                ? 'bg-[#D4AF37] text-[#002B36] font-extrabold shadow'
                : 'text-[#A0B1B5] hover:text-white'
            }`}
          >
            Offline Sim
          </button>
          <button
            onClick={() => setIntegrationMode('real')}
            className={`py-1 text-center rounded transition-all text-[10px] font-bold uppercase flex items-center justify-center gap-1 cursor-pointer ${
              integrationMode === 'real'
                ? 'bg-amber-600 text-white font-extrabold shadow'
                : 'text-[#A0B1B5] hover:text-[#D4AF37]'
            }`}
          >
            Real API
          </button>
        </div>

        {integrationMode === 'real' && (
          <div className="mt-2.5 p-2 bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 rounded flex gap-1.5 items-start">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
            <span>Usando chaves e credenciais do servidor para chamadas reais ao modelo Gemini.</span>
          </div>
        )}
      </div>
    </aside>
  );
}
