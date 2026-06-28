import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_CASES, 
  DEFAULT_DOCUMENTS, 
  DEFAULT_DIAGNOSTICS, 
  DEFAULT_THESES, 
  DEFAULT_OUTLINES, 
  DEFAULT_LOGS 
} from './data/mockData';
import { 
  LegalCase, 
  CaseDocument, 
  CaseDiagnostic, 
  LegalThesis, 
  OutlineItem, 
  AuditLog 
} from './types';

// Importing modules
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NewCase from './components/NewCase';
import CaseSources from './components/CaseSources';
import Diagnostic from './components/Diagnostic';
import ThesesMap from './components/ThesesMap';
import Architecture from './components/Architecture';
import Drafting from './components/Drafting';
import Revision from './components/Revision';
import AuditLogs from './components/AuditLogs';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('newcase');
  
  // App-wide state with robust localstorage lazy hydration
  const [cases, setCases] = useState<LegalCase[]>(() => {
    const saved = localStorage.getItem('legal_ai_cases');
    return saved ? JSON.parse(saved) : DEFAULT_CASES;
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(() => {
    const saved = localStorage.getItem('legal_ai_active_case_id');
    return saved ? JSON.parse(saved) : 'case_1';
  });

  const [documents, setDocuments] = useState<CaseDocument[]>(() => {
    const saved = localStorage.getItem('legal_ai_documents');
    return saved ? JSON.parse(saved) : DEFAULT_DOCUMENTS;
  });

  const [diagnostics, setDiagnostics] = useState<Record<string, CaseDiagnostic>>(() => {
    const saved = localStorage.getItem('legal_ai_diagnostics');
    return saved ? JSON.parse(saved) : DEFAULT_DIAGNOSTICS;
  });

  const [theses, setTheses] = useState<LegalThesis[]>(() => {
    const saved = localStorage.getItem('legal_ai_theses');
    return saved ? JSON.parse(saved) : DEFAULT_THESES;
  });

  const [outlines, setOutlines] = useState<Record<string, OutlineItem[]>>(() => {
    const saved = localStorage.getItem('legal_ai_outlines');
    return saved ? JSON.parse(saved) : DEFAULT_OUTLINES;
  });

  const [logs, setLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('legal_ai_logs');
    return saved ? JSON.parse(saved) : DEFAULT_LOGS;
  });

  const [integrationMode, setIntegrationMode] = useState<'simulado' | 'real'>(() => {
    const saved = localStorage.getItem('legal_ai_integration_mode');
    return saved ? (JSON.parse(saved) as any) : 'simulado';
  });

  // Sync state changes to localstorage to avoid state loss
  useEffect(() => {
    localStorage.setItem('legal_ai_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('legal_ai_active_case_id', JSON.stringify(selectedCaseId));
  }, [selectedCaseId]);

  useEffect(() => {
    localStorage.setItem('legal_ai_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('legal_ai_diagnostics', JSON.stringify(diagnostics));
  }, [diagnostics]);

  useEffect(() => {
    localStorage.setItem('legal_ai_theses', JSON.stringify(theses));
  }, [theses]);

  useEffect(() => {
    localStorage.setItem('legal_ai_outlines', JSON.stringify(outlines));
  }, [outlines]);

  useEffect(() => {
    localStorage.setItem('legal_ai_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('legal_ai_integration_mode', JSON.stringify(integrationMode));
  }, [integrationMode]);

  // Case creation callback
  const handleCaseCreated = (newCase: LegalCase, newDocs: CaseDocument[]) => {
    setCases(prev => [newCase, ...prev]);
    setDocuments(prev => [...newDocs, ...prev]);
    setSelectedCaseId(newCase.id);
    
    // Add Audit Log
    const newLog: AuditLog = {
      id: `log_init_${Math.random().toString(36).substr(2, 9)}`,
      caseId: newCase.id,
      timestamp: new Date().toISOString(),
      stage: 'Cadastro de Caso',
      modelUsed: 'N/A',
      status: 'sucesso',
      observations: `Caso cadastrado com sucesso. Número ${newCase.number}. Área Jurídica: ${newCase.legalArea}.`
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Advance page tab to "Fontes"
    setActiveTab('sources');
  };

  // Document ingestion callback
  const handleDocumentsProcessed = (processedDocs: CaseDocument[], newLogs: AuditLog[]) => {
    // Update local documents
    setDocuments(prev => {
      return prev.map(doc => {
        const matchingProcessed = processedDocs.find(pd => pd.id === doc.id);
        return matchingProcessed ? { ...doc, ...matchingProcessed } : doc;
      });
    });

    // Update case status to processed
    if (selectedCaseId) {
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseId) {
          return { ...c, status: 'processed' };
        }
        return c;
      }));
    }

    // Append logs
    setLogs(prev => [...newLogs, ...prev]);
  };

  // Case diagnostic callback
  const handleDiagnosticGenerated = (diagnosticData: CaseDiagnostic, newLogs: AuditLog[]) => {
    setDiagnostics(prev => ({
      ...prev,
      [diagnosticData.caseId]: diagnosticData
    }));

    if (selectedCaseId) {
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseId) {
          return { ...c, status: 'diagnosed' };
        }
        return c;
      }));
    }

    setLogs(prev => [...newLogs, ...prev]);
  };

  // Theses mapping callback
  const handleThesesUpdated = (updatedTheses: LegalThesis[], newLogs?: AuditLog[]) => {
    // Update main theses store
    setTheses(prev => {
      // Filter out existing theses for this case and replace them, keeping others
      const otherCasesTheses = prev.filter(t => t.caseId !== selectedCaseId);
      return [...otherCasesTheses, ...updatedTheses];
    });

    if (selectedCaseId) {
      // If theses are successfully generated for the first time, advance status
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseId && c.status === 'diagnosed') {
          return { ...c, status: 'theses_mapped' };
        }
        return c;
      }));
    }

    if (newLogs) {
      setLogs(prev => [...newLogs, ...prev]);
    }
  };

  const handleNextStepFromTheses = () => {
    setActiveTab('architecture');
  };

  // Outlines/Architecture callback
  const handleOutlineUpdated = (updatedOutline: OutlineItem[], newLogs?: AuditLog[]) => {
    if (!selectedCaseId) return;

    setOutlines(prev => ({
      ...prev,
      [selectedCaseId]: updatedOutline
    }));

    // Increment status to architecture_defined if currently theses_mapped
    setCases(prev => prev.map(c => {
      if (c.id === selectedCaseId && c.status === 'theses_mapped') {
        return { ...c, status: 'architecture_defined' };
      }
      return c;
    }));

    if (newLogs) {
      setLogs(prev => [...newLogs, ...prev]);
    }
  };

  const handleNextStepFromArchitecture = () => {
    // Advance status of case to 'drafting'
    if (selectedCaseId) {
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseId && c.status === 'architecture_defined') {
          return { ...c, status: 'drafting' };
        }
        return c;
      }));
    }
    setActiveTab('drafting');
  };

  const handleOutlineDraftsUpdated = (updatedOutline: OutlineItem[]) => {
    if (!selectedCaseId) return;
    setOutlines(prev => ({
      ...prev,
      [selectedCaseId]: updatedOutline
    }));
  };

  const handleCaseCompleted = () => {
    if (selectedCaseId) {
      setCases(prev => prev.map(c => {
        if (c.id === selectedCaseId) {
          return { ...c, status: 'completed' };
        }
        return c;
      }));

      // Check if audit log already exists for completion to avoid spamming
      const hasCompletedLog = logs.some(l => l.caseId === selectedCaseId && l.stage === 'Exportação da Defesa');
      if (!hasCompletedLog) {
        const completionLog: AuditLog = {
          id: `log_comp_${Math.random().toString(36).substr(2, 9)}`,
          caseId: selectedCaseId,
          timestamp: new Date().toISOString(),
          stage: 'Exportação da Defesa',
          modelUsed: 'Gerador DOCX Nativo',
          status: 'sucesso',
          observations: 'Peça de contestação compilada e exportada com sucesso no formato Word (DOCX).'
        };
        setLogs(prev => [completionLog, ...prev]);
      }
    }
  };

  // Filter current data based on active process
  const activeCase = cases.find(c => c.id === selectedCaseId) || null;
  const activeCaseDocs = selectedCaseId ? documents.filter(d => d.caseId === selectedCaseId) : [];
  const activeCaseDiag = selectedCaseId ? diagnostics[selectedCaseId] || null : null;
  const activeCaseTheses = selectedCaseId ? theses.filter(t => t.caseId === selectedCaseId) : [];
  const activeCaseOutline = selectedCaseId ? outlines[selectedCaseId] || [] : [];

  // Reset demo databases helper
  const handleResetApp = () => {
    if (window.confirm('Deseja resetar o banco de dados da sandbox para as configurações padrão? Todos os seus novos dados salvos serão apagados.')) {
      localStorage.clear();
      setCases(DEFAULT_CASES);
      setSelectedCaseId('case_1');
      setDocuments(DEFAULT_DOCUMENTS);
      setDiagnostics(DEFAULT_DIAGNOSTICS);
      setTheses(DEFAULT_THESES);
      setOutlines(DEFAULT_OUTLINES);
      setLogs(DEFAULT_LOGS);
      setActiveTab('newcase');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased font-sans flex select-none">
      {/* Dynamic Keyframe Animation Styles injected once */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* FIXED SIDEBAR LEFT */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cases={cases}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        integrationMode={integrationMode}
        setIntegrationMode={setIntegrationMode}
      />

      {/* MAIN CONTENT AREA RIGHT */}
      <main className="ml-80 flex-1 p-8 min-h-screen flex flex-col justify-between max-w-7xl">
        <div className="flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <Dashboard 
              cases={cases}
              outlineItems={outlines}
              setSelectedCaseId={setSelectedCaseId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'newcase' && (
            <NewCase onCaseCreated={handleCaseCreated} />
          )}

          {activeTab === 'sources' && activeCase && (
            <CaseSources 
              activeCase={activeCase}
              documents={activeCaseDocs}
              onDocumentsProcessed={handleDocumentsProcessed}
              onNextStep={() => setActiveTab('processing')}
            />
          )}

          {activeTab === 'processing' && activeCase && (
            <div className="space-y-8">
              <Diagnostic 
                activeCase={activeCase}
                documents={activeCaseDocs}
                diagnostic={activeCaseDiag}
                onDiagnosticGenerated={handleDiagnosticGenerated}
                onNextStep={() => setActiveTab('processing')}
                showNextButton={false}
              />
              {activeCaseDiag && (
                <ThesesMap 
                  activeCase={activeCase}
                  theses={activeCaseTheses}
                  onThesesUpdated={handleThesesUpdated}
                  onNextStep={handleNextStepFromTheses}
                />
              )}
            </div>
          )}

          {activeTab === 'architecture' && activeCase && (
            <Architecture 
              activeCase={activeCase}
              selectedTheses={activeCaseTheses.filter(t => t.selected)}
              outline={activeCaseOutline}
              onOutlineUpdated={handleOutlineUpdated}
              onNextStep={handleNextStepFromArchitecture}
            />
          )}

          {activeTab === 'drafting' && activeCase && (
            <Drafting 
              activeCase={activeCase}
              selectedTheses={activeCaseTheses.filter(t => t.selected)}
              outline={activeCaseOutline}
              onOutlineUpdated={handleOutlineDraftsUpdated}
              onNextStep={() => setActiveTab('revision')}
            />
          )}

          {activeTab === 'revision' && activeCase && (
            <Revision 
              activeCase={activeCase}
              outline={activeCaseOutline}
              onOutlineUpdated={handleOutlineDraftsUpdated}
              onCaseCompleted={handleCaseCompleted}
              mode="review"
              onNextStep={() => setActiveTab('export')}
            />
          )}

          {activeTab === 'export' && activeCase && (
            <Revision 
              activeCase={activeCase}
              outline={activeCaseOutline}
              onOutlineUpdated={handleOutlineDraftsUpdated}
              onCaseCompleted={handleCaseCompleted}
              mode="export"
            />
          )}

          {activeTab === 'logs' && activeCase && (
            <AuditLogs 
              activeCase={activeCase}
              logs={logs}
            />
          )}
        </div>

        {/* Global Footer with Sandbox Control */}
        <footer className="border-t border-slate-200/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 select-none">
          <span>
            © {new Date().getFullYear()} <strong>D. Menezes Legai AI</strong>. Todos os direitos reservados. Projetado para advocacia corporativa de alta performance.
          </span>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleResetApp}
              className="text-slate-400 hover:text-rose-600 transition-colors font-semibold"
            >
              Resetar Banco Sandbox
            </button>
            <span>•</span>
            <span className="font-mono bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
              Local Time: 14:07 BRT
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
