import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  ListTodo, 
  HelpCircle,
  AlertTriangle,
  RotateCw,
  Scale
} from 'lucide-react';
import { LegalCase, CaseDocument, CaseDiagnostic } from '../types';
import { geminiService } from '../services/geminiService';

interface DiagnosticProps {
  activeCase: LegalCase;
  documents: CaseDocument[];
  diagnostic: CaseDiagnostic | null;
  onDiagnosticGenerated: (diag: CaseDiagnostic, newLogs: any[]) => void;
  onNextStep: () => void;
}

export default function Diagnostic({
  activeCase,
  documents,
  diagnostic,
  onDiagnosticGenerated,
  onNextStep
}: DiagnosticProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDiagnostic = async () => {
    setIsGenerating(true);
    try {
      const result = await geminiService.generateDiagnostic(activeCase, documents);
      onDiagnosticGenerated(result.diagnostic, result.logs);
    } catch (err) {
      console.error('Error generating diagnostic:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <ShieldAlert className="h-4.5 w-4.5 text-rose-600 shrink-0" />;
      case 'medium':
        return <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
      default:
        return <HelpCircle className="h-4.5 w-4.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Diagnóstico Jurídico e Vulnerabilidades</h2>
          <p className="text-sm text-slate-500">
            A IA analisou as peças e extraiu o núcleo litigioso do processo. Revise os pedidos da inicial e as lacunas identificadas.
          </p>
        </div>

        {diagnostic ? (
          <div className="flex gap-2">
            <button
              onClick={handleGenerateDiagnostic}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Refazer Análise
            </button>
            <button
              onClick={onNextStep}
              className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C2A02C] text-slate-950 px-4 py-2.5 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/40 cursor-pointer"
            >
              Mapear Teses
              <ArrowRight className="h-4.5 w-4.5 text-slate-950" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleGenerateDiagnostic}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-5 py-2.5 rounded-md text-sm font-bold transition-all shadow border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4.5 w-4.5 animate-spin text-[#D4AF37]" />
                Mapeando Inicial...
              </>
            ) : (
              <>
                <Brain className="h-4.5 w-4.5 text-[#D4AF37]" />
                Gerar Diagnóstico por IA
              </>
            )}
          </button>
        )}
      </div>

      {!diagnostic ? (
        /* Empty / Generation Banner state */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
          <div className="h-14 w-14 bg-[#002B36]/5 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mx-auto text-[#002B36] shadow-inner">
            <Brain className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Gerar Diagnóstico Estratégico</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              O motor jurídico irá analisar o conteúdo das fontes anexadas para extrair pedidos, fundamentos de direito e alertar sobre as principais fragilidades da petição do autor.
            </p>
          </div>
          <button
            onClick={handleGenerateDiagnostic}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-[#002B36] hover:bg-[#004050] text-white px-5 py-3 rounded-md text-sm font-bold transition-all border border-[#D4AF37]/30 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin text-[#D4AF37]" />
                Analisando Fontes...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-400" />
                Iniciar Diagnóstico de Inicial
              </>
            )}
          </button>
        </div>
      ) : (
        /* Diagnostic dashboard content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Claims & Foundations */}
          <div className="lg:col-span-6 space-y-6">
            {/* Extracted Claims */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <ListTodo className="h-4.5 w-4.5 text-[#D4AF37]" />
                  Pedidos do Autor (Inicial)
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold uppercase">
                  {diagnostic.claims.length} Pedidos
                </span>
              </div>
              <div className="p-5 space-y-4">
                {diagnostic.claims.map((claim, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <span className="flex h-5 w-5 rounded-full bg-slate-100 border border-slate-200 items-center justify-center text-[10px] font-bold font-mono text-slate-500 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 font-sans leading-relaxed">{claim}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Foundations cited by Plaintiff */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <Scale className="h-4.5 w-4.5 text-[#D4AF37]" />
                  Fundamentos de Direito da Inicial
                </h3>
              </div>
              <div className="p-5 space-y-3">
                {diagnostic.foundations.map((found, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded flex gap-2.5 items-start">
                    <FileText className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 font-mono leading-relaxed">{found}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Case Vulnerabilities (Gaps / Lacunas) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                  <ShieldAlert className="h-4.5 w-4.5 text-[#D4AF37]" />
                  Lacunas e Alertas de Defesa
                </h3>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-bold uppercase">
                  Atenção Crítica
                </span>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-xs text-slate-500">
                  Abaixo estão listados os pontos fracos da petição exordial ou dados ausentes identificados pela IA. Use estes pontos para estruturar teses de impugnação específica.
                </p>

                {diagnostic.gaps.map((gap) => (
                  <div key={gap.id} className="border border-slate-150 rounded-lg overflow-hidden shadow-sm">
                    {/* Title and severity */}
                    <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-150 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        {getSeverityIcon(gap.severity)}
                        <h4 className="text-xs font-bold text-slate-800 truncate">{gap.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityColor(gap.severity)}`}>
                        {gap.severity === 'high' ? 'Crítico' : gap.severity === 'medium' ? 'Médio' : 'Informativo'}
                      </span>
                    </div>

                    {/* Gap details and suggestion */}
                    <div className="p-4 space-y-3 text-xs leading-relaxed">
                      <p className="text-slate-600">{gap.description}</p>
                      
                      {/* Suggestion box */}
                      <div className="p-3 bg-indigo-50/40 border border-indigo-100/60 rounded flex gap-2">
                        <div className="mt-0.5 text-indigo-700 shrink-0">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#002B36] mb-0.5">Sugestão de Defesa (IA)</p>
                          <p className="text-slate-600 text-[11px]">{gap.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
