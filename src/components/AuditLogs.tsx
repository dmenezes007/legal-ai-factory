import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Cpu, 
  Clock,
  History,
  ShieldCheck,
  Server
} from 'lucide-react';
import { LegalCase, AuditLog } from '../types';

interface AuditLogsProps {
  activeCase: LegalCase;
  logs: AuditLog[];
}

export default function AuditLogs({ activeCase, logs }: AuditLogsProps) {
  // Filter logs for this specific case
  const caseLogs = logs.filter(log => log.caseId === activeCase.id);

  const getStatusIcon = (status: AuditLog['status']) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-white rounded-full shrink-0" />;
      case 'alerta':
        return <AlertTriangle className="h-5 w-5 text-amber-500 bg-white rounded-full shrink-0" />;
      case 'erro':
        return <XCircle className="h-5 w-5 text-rose-500 bg-white rounded-full shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-slate-400 bg-white rounded-full shrink-0" />;
    }
  };

  const getStatusRowBg = (status: AuditLog['status']) => {
    switch (status) {
      case 'sucesso': return 'border-emerald-100 bg-emerald-50/10';
      case 'alerta': return 'border-amber-100 bg-amber-50/10';
      case 'erro': return 'border-rose-100 bg-rose-50/10';
      default: return 'border-slate-100 bg-slate-50/20';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Logs e Auditoria do Processo</h2>
          <p className="text-sm text-slate-500">
            Acompanhe o histórico completo de execuções de inteligência artificial aplicadas ao caso de <strong className="text-slate-800">{activeCase.client}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Timeline visualization */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="h-4.5 w-4.5 text-[#D4AF37]" />
              Linha do Tempo de Produção da Defesa
            </h3>

            {caseLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Nenhuma execução registrada para este caso. Siga as etapas anteriores para registrar logs na auditoria de IA.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {/* Sort logs newest first */}
                {[...caseLogs]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log) => (
                    <div key={log.id} className="relative space-y-2">
                      {/* Node point */}
                      <span className="absolute -left-8 top-1.5 flex h-5 w-5 items-center justify-center bg-white rounded-full">
                        {getStatusIcon(log.status)}
                      </span>

                      {/* Log card */}
                      <div className={`p-4 rounded-lg border shadow-xs ${getStatusRowBg(log.status)}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <h4 className="font-bold text-slate-800 text-sm">{log.stage}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>

                        <div className="pt-2 space-y-2">
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">{log.observations}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4AF37] bg-slate-900/5 px-2 py-0.5 rounded border border-slate-200/40 w-fit">
                            <Cpu className="h-3 w-3" />
                            <span>MODELO: {log.modelUsed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Audit guidelines & system settings details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Server className="h-4 w-4 text-[#D4AF37]" />
              ESTRUTURA DE AUDITORIA
            </h4>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                A Legal AI Factory segue diretrizes estritas de <strong>Explicabilidade da IA</strong> (Explainable AI - XAI). Cada parágrafo sugerido ou tese recomendada tem seus parâmetros mapeados.
              </p>
              
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#002B36] text-[11px]">Segurança e Governança</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    Toda consulta ao modelo obedece às permissões do advogado revisor. Nenhuma informação de cliente alimenta modelos públicos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
