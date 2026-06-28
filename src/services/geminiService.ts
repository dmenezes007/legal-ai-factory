import { LegalCase, CaseDocument, CaseDiagnostic, LegalThesis, OutlineItem, AuditLog } from '../types';
import { DEFAULT_DIAGNOSTICS, DEFAULT_THESES, DEFAULT_OUTLINES } from '../data/mockData';

// Simulated latency helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8787';

function getExecutionMode(): 'mock' | 'real' {
  try {
    const mode = JSON.parse(localStorage.getItem('legal_ai_integration_mode') || '"simulado"');
    return mode === 'real' ? 'real' : 'mock';
  } catch {
    return 'mock';
  }
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`API ${path} falhou com status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Service to orchestrate AI Legal Operations.
 * Highly structured so that developers can easily substitute these mock methods
 * with real fetch requests to a server-side route running the @google/genai SDK.
 */
export const geminiService = {
  async autoReviewChapter(content: string): Promise<string> {
    try {
      const mode = getExecutionMode();
      const review = await postJson<{ reviewedContent: string }>('/api/skill/review', {
        content,
        options: {
          mode,
          simulatedData: mode !== 'real'
        }
      });

      if (review.reviewedContent && review.reviewedContent.trim().length > 0) {
        return review.reviewedContent;
      }
    } catch {
      // fallback local
    }

    await delay(300);

    return content
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+\./g, '.')
      .replace(/\s+,/g, ',')
      .trim();
  },

  /**
   * Simulates OCR and text extraction from uploaded PDFs, DOCX, and TXT files.
   */
  async processDocuments(
    caseId: string,
    documents: CaseDocument[],
    onProgress: (docId: string, progress: number) => void,
    sourceSubdir?: string
  ): Promise<{ processedDocs: CaseDocument[]; logs: AuditLog[] }> {
    try {
      const apiResult = await postJson<any>('/api/ingest', {
        sourceSubdir: sourceSubdir && sourceSubdir.trim().length > 0 ? sourceSubdir : undefined
      });
      const metadataByName = new Map<string, any>();

      (apiResult.items || []).forEach((item: any) => {
        metadataByName.set(String(item.fileName || '').toLowerCase(), item);
      });

      const processedDocs = documents.map((doc) => {
        const meta = metadataByName.get(doc.name.toLowerCase());
        if (!meta) {
          return doc;
        }

        onProgress(doc.id, 100);
        return {
          ...doc,
          status: (meta.extracted ? 'processed' : 'error') as 'processed' | 'error',
          contentSnippet: meta.extracted
            ? `[Ingestão local] ${meta.category} | ${meta.textLength} caracteres extraídos.`
            : 'Falha de extração no pipeline local.'
        };
      });

      const logs: AuditLog[] = [
        {
          id: `log_ingest_${Math.random().toString(36).substr(2, 9)}`,
          caseId,
          timestamp: new Date().toISOString(),
          stage: 'Processamento de Fontes',
          modelUsed: 'Ingestion Pipeline Local',
          status: 'sucesso',
          observations: `Ingestão concluída: ${apiResult.processed}/${apiResult.total} arquivos processados.`
        }
      ];

      return { processedDocs, logs };
    } catch {
      // fallback mock abaixo
    }

    const processedDocs: CaseDocument[] = [];
    const logs: AuditLog[] = [];

    for (const doc of documents) {
      if (doc.status === 'processed') {
        processedDocs.push(doc);
        continue;
      }

      onProgress(doc.id, 10);
      await delay(400);
      onProgress(doc.id, 40);
      await delay(500);
      onProgress(doc.id, 80);
      await delay(300);

      const isError = Math.random() < 0.05; // 5% chance of simulated error for demonstration
      const status = isError ? 'error' : 'processed';
      const snippet = isError 
        ? undefined 
        : `[Trecho extraído por IA] Este documento refere-se ao arquivo "${doc.name}" anexado ao processo. Contém assinaturas eletrônicas válidas e foi indexado na base vetorial da D. Menezes Legai AI em ${new Date().toLocaleDateString('pt-BR')}.`;

      processedDocs.push({
        ...doc,
        status,
        contentSnippet: snippet
      });

      logs.push({
        id: `log_ocr_${Math.random().toString(36).substr(2, 9)}`,
        caseId,
        timestamp: new Date().toISOString(),
        stage: 'Processamento de Fontes',
        modelUsed: 'Gemini 2.5 Flash (OCR Engine)',
        status: isError ? 'erro' : 'sucesso',
        observations: isError 
          ? `Falha ao processar o arquivo ${doc.name}. Assinatura corrompida ou PDF protegido.`
          : `Arquivo "${doc.name}" (${doc.size}) processado com sucesso. Texto extraído e vetorizado.`
      });

      onProgress(doc.id, 100);
    }

    return { processedDocs, logs };
  },

  /**
   * Analyzes case metadata and processed documents to generate a full Legal Diagnostic.
   */
  async generateDiagnostic(
    caseData: LegalCase,
    documents: CaseDocument[]
  ): Promise<{ diagnostic: CaseDiagnostic; logs: AuditLog[] }> {
    await delay(2000); // Simulate deep reasoning delay

    // If it's one of our default cases, return its pre-baked diagnostic
    if (DEFAULT_DIAGNOSTICS[caseData.id]) {
      const diagnostic = DEFAULT_DIAGNOSTICS[caseData.id];
      const log: AuditLog = {
        id: `log_diag_${Math.random().toString(36).substr(2, 9)}`,
        caseId: caseData.id,
        timestamp: new Date().toISOString(),
        stage: 'Diagnóstico Jurídico',
        modelUsed: 'Gemini 2.5 Pro (Reasoning)',
        status: 'sucesso',
        observations: 'Análise de inicial e fontes concluída. Cruzamento de pedidos do autor com possíveis pontos de omissão.'
      };
      return { diagnostic, logs: [log] };
    }

    // Otherwise, dynamically construct a realistic diagnostic based on form data
    const claims = [
      `Indenização pleiteada pela parte autora (${caseData.plaintiff}) com base em inadimplemento contratual.`,
      `Pedido subsidiário de condenação em honorários sucumbenciais de 20% e juros moratórios desde a citação.`
    ];

    const foundations = [
      `Invocação genérica da responsabilidade civil objetiva (Art. 186 e 927 do Código Civil).`,
      `Alegação de inversão do ônus da prova em desfavor de ${caseData.defendant}.`
    ];

    const diagnostic: CaseDiagnostic = {
      caseId: caseData.id,
      plaintiff: caseData.plaintiff,
      defendant: caseData.defendant,
      rite: caseData.rite,
      court: caseData.court,
      claims,
      foundations,
      keyDocuments: documents.map(d => d.name),
      gaps: [
        {
          id: `gap_dyn_1`,
          title: 'Necessidade de Prova Documental Específica',
          description: `A petição inicial carece de comprovação idônea dos prejuízos alegados por ${caseData.plaintiff}.`,
          severity: 'high',
          suggestion: 'Solicitar ao cliente comprovantes internos que atestem o cumprimento das obrigações ou a culpa exclusiva de terceiro.'
        },
        {
          id: `gap_dyn_2`,
          title: 'Prescrição Parcial Potencial',
          description: 'A narrativa factual remete a acontecimentos ocorridos há mais de 3 anos do ajuizamento.',
          severity: 'medium',
          suggestion: 'Arguir prejudicial de mérito de prescrição trienal (Art. 206, § 3º, V do Código Civil).'
        }
      ]
    };

    const log: AuditLog = {
      id: `log_diag_${Math.random().toString(36).substr(2, 9)}`,
      caseId: caseData.id,
      timestamp: new Date().toISOString(),
      stage: 'Diagnóstico Jurídico',
      modelUsed: 'Gemini 2.5 Pro (Reasoning)',
      status: 'sucesso',
      observations: `Diagnóstico criado dinamicamente para o processo ${caseData.number}. Identificadas 2 lacunas fundamentais.`
    };

    return { diagnostic, logs: [log] };
  },

  /**
   * Generates defensive theses based on the case diagnostics.
   */
  async generateTheses(
    caseData: LegalCase,
    diagnostic: CaseDiagnostic
  ): Promise<{ theses: LegalThesis[]; logs: AuditLog[] }> {
    await delay(1500); // Simulate thesis mapping delay

    const caseId = caseData.id;
    // Return pre-baked if case exists
    const allPreBaked = DEFAULT_THESES.filter(t => t.caseId === caseId);
    if (allPreBaked.length > 0) {
      const log: AuditLog = {
        id: `log_thesis_${Math.random().toString(36).substr(2, 9)}`,
        caseId,
        timestamp: new Date().toISOString(),
        stage: 'Mapeamento de Teses',
        modelUsed: 'Gemini 2.5 Pro (Jurisprudence Engine)',
        status: 'sucesso',
        observations: `Identificadas ${allPreBaked.length} teses jurídicas viáveis de defesa de acordo com as lacunas diagnosticadas.`
      };
      return { theses: allPreBaked, logs: [log] };
    }

    // Dynamic generation of theses
    const theses: LegalThesis[] = [
      {
        id: `thesis_dyn_1_${caseId}`,
        caseId,
        title: 'Ausência de Nexo de Causalidade - Culpa Exclusiva da Vítima ou de Terceiro',
        hypothesis: `O dano alegado por ${caseData.plaintiff} decorreu diretamente de sua própria conduta negligente ou de fato alheio à esfera de controle de ${caseData.defendant}.`,
        adherence: 'Alta',
        normativeBasis: 'Artigo 14, § 3º, inciso II do Código de Defesa do Consumidor ou Artigo 393 do Código Civil.',
        relatedEvidence: 'Documentação anexada e relatórios técnicos do cliente.',
        correlatedRequest: 'Julgamento de improcedência total dos pleitos indenizatórios por ausência de nexo causal.',
        selected: true,
        type: 'merito'
      },
      {
        id: `thesis_dyn_2_${caseId}`,
        caseId,
        title: 'Prejudicial de Mérito - Prescrição Trienal da Pretensão Reparatória',
        hypothesis: 'A pretensão de reparação civil prescreve em 3 anos, contados da ciência inequívoca do suposto ilícito.',
        adherence: 'Média',
        normativeBasis: 'Artigo 206, § 3º, inciso V do Código Civil Brasileiro.',
        relatedEvidence: 'Datas de ocorrência dos fatos apontadas na inicial (superior a 36 meses).',
        correlatedRequest: 'Extinção do processo com resolução do mérito nos termos do Artigo 487, inciso II do Código de Processo Civil.',
        selected: true,
        type: 'merito'
      },
      {
        id: `thesis_dyn_3_${caseId}`,
        caseId,
        title: 'Inexistência de Danos Morais - Mero Dissabor do Cotidiano',
        hypothesis: 'O mero descumprimento de cláusula contratual não enseja abalo psicológico suficiente para macular os direitos da personalidade.',
        adherence: 'Alta',
        normativeBasis: 'Súmula nº 75 do TJRJ ou jurisprudência consolidada do STJ sobre mero aborrecimento comercial.',
        relatedEvidence: 'Falta de relatórios médicos, atestados ou provas de isolamento social da vítima.',
        correlatedRequest: 'Improcedência do pedido de compensação por dano moral ou fixação em patamar simbólico.',
        selected: true,
        type: 'merito'
      }
    ];

    const log: AuditLog = {
      id: `log_thesis_${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      timestamp: new Date().toISOString(),
      stage: 'Mapeamento de Teses',
      modelUsed: 'Gemini 2.5 Pro (Jurisprudence Engine)',
      status: 'sucesso',
      observations: `Teses jurídicas sugeridas com base em estatísticas e precedentes do juízo: ${caseData.court}.`
    };

    return { theses, logs: [log] };
  },

  /**
   * Builds the defence architecture / outline of chapters.
   */
  async generateArchitecture(
    caseData: LegalCase,
    selectedTheses: LegalThesis[]
  ): Promise<{ outline: OutlineItem[]; logs: AuditLog[] }> {
    try {
      const mode = getExecutionMode();
      const apiResult = await postJson<{ outline: OutlineItem[] }>('/api/skill/architecture', {
        caseData,
        selectedTheses,
        options: {
          mode,
          simulatedData: mode !== 'real'
        }
      });

      const log: AuditLog = {
        id: `log_arch_${Math.random().toString(36).substr(2, 9)}`,
        caseId: caseData.id,
        timestamp: new Date().toISOString(),
        stage: 'Arquitetura da Defesa',
        modelUsed: mode === 'real' ? 'Gemini (API Local)' : 'Skill Runner Local (Mock)',
        status: 'sucesso',
        observations: `Arquitetura gerada via API local com ${apiResult.outline.length} capítulos.`
      };

      return { outline: apiResult.outline, logs: [log] };
    } catch {
      // fallback mock abaixo
    }

    await delay(1200);

    const caseId = caseData.id;
    // Check pre-baked
    if (DEFAULT_OUTLINES[caseId]) {
      const outline = DEFAULT_OUTLINES[caseId];
      const log: AuditLog = {
        id: `log_arch_${Math.random().toString(36).substr(2, 9)}`,
        caseId,
        timestamp: new Date().toISOString(),
        stage: 'Arquitetura da Defesa',
        modelUsed: 'Gemini 2.5 Pro (Structural Outline)',
        status: 'sucesso',
        observations: `Estrutura de roteiro de contestação criada com ${outline.length} capítulos fundamentais baseados nas teses aprovadas.`
      };
      return { outline, logs: [log] };
    }

    // Dynamic generation of Outline
    const outline: OutlineItem[] = [
      {
        id: `out_dyn_1_${caseId}`,
        caseId,
        title: '1. PREÂMBULO E QUALIFICAÇÃO',
        sectionType: 'preambulo',
        content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ${caseData.court}

PROCESSO Nº ${caseData.number}

${caseData.defendant.toUpperCase()}, já qualificado nos autos da ação que lhe move ${caseData.plaintiff}, vem apresentar contestação pelas razões de fato e de direito subsequentes.`,
        status: 'aprovado',
        order: 1
      },
      {
        id: `out_dyn_2_${caseId}`,
        caseId,
        title: '2. SÍNTESE DA PETIÇÃO INICIAL',
        sectionType: 'resumo',
        content: `A parte autora propôs a presente demanda aduzindo que sofreu prejuízos decorrentes de atos praticados pela Ré. Requer indenizações materiais e morais vultosas. Em síntese, a inicial carece de elementos probatórios básicos, como restará demonstrado.`,
        status: 'revisado',
        order: 2
      }
    ];

    // Add selected theses as chapters
    selectedTheses.forEach((thesis, index) => {
      outline.push({
        id: `out_dyn_thesis_${thesis.id}`,
        caseId,
        title: `${index + 3}. MÉRITO - ${thesis.title.toUpperCase()}`,
        sectionType: thesis.type === 'preliminar' ? 'preliminares' : 'merito',
        content: `O reclamante fundamenta o seu pedido sob a alegação de que existe ${thesis.hypothesis}.
        
Entretanto, tal hipótese não se sustenta faticamente ou juridicamente, tendo em vista que, de acordo com o ${thesis.normativeBasis}, as provas anexadas aos autos revelam que ${thesis.relatedEvidence}.
        
Portanto, imperioso o acolhimento do pedido de ${thesis.correlatedRequest}.`,
        status: 'nao_iniciado',
        order: index + 3
      });
    });

    // Add closure
    outline.push({
      id: `out_dyn_req_${caseId}`,
      caseId,
      title: `${selectedTheses.length + 3}. REQUERIMENTOS FINAIS E PEDIDOS`,
      sectionType: 'requerimentos',
      content: `Diante de todo o exposto, requer-se:
1. O acolhimento total das teses defensivas para julgar a presente ação INTEGRALMENTE IMPROCEDENTE;
2. Condenação da parte autora em custas e honorários sucumbenciais.
      
Termos em que, pede deferimento.
São Paulo, ${new Date().toLocaleDateString('pt-BR')}.`,
      status: 'nao_iniciado',
      order: selectedTheses.length + 3
    });

    const log: AuditLog = {
      id: `log_arch_${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      timestamp: new Date().toISOString(),
      stage: 'Arquitetura da Defesa',
      modelUsed: 'Gemini 2.5 Pro (Structural Outline)',
      status: 'sucesso',
      observations: `Criado roteiro com ${outline.length} capítulos defensivos personalizados.`
    };

    return { outline, logs: [log] };
  },

  /**
   * Generates drafting content for a single chapter.
   */
  async draftChapter(
    caseData: LegalCase,
    chapter: OutlineItem,
    selectedTheses: LegalThesis[]
  ): Promise<{ draftedContent: string; log: AuditLog }> {
    try {
      const mode = getExecutionMode();
      const apiResult = await postJson<{ draftedContent: string }>('/api/skill/draft', {
        caseData,
        chapter,
        selectedTheses,
        options: {
          mode,
          simulatedData: mode !== 'real'
        }
      });

      const apiLog: AuditLog = {
        id: `log_draft_${Math.random().toString(36).substr(2, 9)}`,
        caseId: caseData.id,
        timestamp: new Date().toISOString(),
        stage: 'Redação da Peça',
        modelUsed: mode === 'real' ? 'Gemini (API Local)' : 'Skill Runner Local (Mock)',
        status: 'sucesso',
        observations: `Capítulo "${chapter.title}" redigido via API local.`
      };

      return { draftedContent: apiResult.draftedContent, log: apiLog };
    } catch {
      // fallback mock abaixo
    }

    await delay(1800); // Simulate high-quality drafting delay

    // We can return a heavily styled, expanded, highly professional draft prose
    const relatedThesis = selectedTheses.find(t => chapter.title.includes(t.title.toUpperCase()) || chapter.id.includes(t.id));
    
    let text = chapter.content;

    if (relatedThesis) {
      text = `DO MÉRITO DE DEFESA: ${relatedThesis.title.toUpperCase()}
      
Conforme anunciado, a tese defensiva da contestante repousa sobre sólidas bases normativas e fáticas. A parte autora insiste na tese de responsabilidade irrestrita, omitindo que a hipótese de incidência legal recai precisamente sobre:
"${relatedThesis.hypothesis}"

O ordenamento jurídico pátrio afasta categoricamente qualquer dever de reparar quando inexistentes os pressupostos da responsabilidade civil. A regra insculpida no dispositivo normativo correspondente (${relatedThesis.normativeBasis}) impõe clareza solar sobre o tema.

Ademais, as provas coligidas no caderno processual evidenciam de forma irrefutável que:
"${relatedThesis.relatedEvidence}"

Não se pode olvidar a lição da doutrina clássica, a qual assevera que o enriquecimento sem causa é expressamente repudiado em nosso sistema. Portanto, a procedência do pedido autoral representaria nítida afronta ao ordenamento legal.

Por conseguinte, a contestante requer o integral acolhimento da presente tese jurídica para determinar a imediata improcedência do pedido de:
"${relatedThesis.correlatedRequest}"`;
    } else if (chapter.sectionType === 'preambulo') {
      text = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ${caseData.court.toUpperCase()}

PROCESSO REFERÊNCIA Nº ${caseData.number}

${caseData.defendant.toUpperCase()}, pessoa jurídica de direito privado inscrita devidamente no CNPJ/MF, com sede e representação legal já qualificadas nos autos da ação em epígrafe movida por ${caseData.plaintiff.toUpperCase()}, vem perante este ilustre Juízo, por intermédio de seus bastantes advogados ao final firmados, tempestivamente e sob as garantias do contraditório e da ampla defesa, apresentar sua manifestação em sede de

CONTESTAÇÃO

com amparo nos artigos 335 e seguintes do Código de Processo Civil (ou correspondente da CLT), rechaçando todos os pedidos aduzidos na inicial, demonstrando que as pretensões autorais revelam manifesto equívoco lógico-jurídico, de acordo com as razões de fato e de direito que passa a aduzir.`;
    } else if (chapter.sectionType === 'resumo') {
      text = `DA SÍNTESE DA EXORDIAL E SEUS EQUÍVOCOS
      
A Requerente (${caseData.plaintiff}) ingressou em juízo alegando, em apertada síntese, que contratou os serviços da Requerida (${caseData.defendant}) e que, em decorrência de alegadas falhas operacionais, teria sofrido dissabores e prejuízos materiais e extrapatrimoniais.

Diante do suposto dano, pretende obter provimento judicial condenatório para pagamento de indenização a título de danos materiais e morais expressivos.

Contudo, como restará cabalmente demonstrado ao longo desta peça, a narrativa inicial desconsidera premissas operacionais verídicas, carece de estofo documental idôneo de suporte e se apega a conceitos genéricos de dano moral presumido de todo inaplicáveis ao caso concreto. As alegações autorais não resistem ao escrutínio fático, devendo o pleito ser repelido em sua integralidade.`;
    } else if (chapter.sectionType === 'requerimentos') {
      text = `DOS PEDIDOS E REQUERIMENTOS FINAIS

Ex positis, diante de toda a matéria de fato, direito e prova debatida na presente peça, a Requerida pugna a Vossa Excelência que se digne de receber a presente defesa em todos os seus termos e anexos, para o fim de:

1. Reconhecer as PRELIMINARES e PREJUDICIAIS arguidas, com a consequente extinção do feito ou limitação da responsabilidade tarifária se aplicável;

2. No mérito propriamente dito, julgar TOTALMENTE IMPROCEDENTES os pedidos formulados pela parte autora, desonerando a Ré de qualquer pagamento pecuniário e declarando a extinção da relação litigiosa;

3. Subsidiariamente, em caso de eventual condenação, arbitrar os valores com moderação draconiana, em fiel observância aos postulados constitucionais da proporcionalidade e da razoabilidade, repelindo o enriquecimento sem causa da Autora;

4. Condenar a parte adversa ao pagamento integral das custas processuais vigentes e honorários sucumbenciais advocatícios de praxe, fixados no teto máximo legal sobre o valor atualizado da causa.

Protesta provar o alegado por todos os meios em direito admitidos, notadamente prova documental complementar, testemunhal e pericial se necessárias.

Nesses termos,
Pede e espera deferimento.

São Paulo, ${new Date().toLocaleDateString('pt-BR')}.

ADVOGADO SIGNATÁRIO
OAB/UF DE ORIGEM`;
    }

    const log: AuditLog = {
      id: `log_draft_${Math.random().toString(36).substr(2, 9)}`,
      caseId: caseData.id,
      timestamp: new Date().toISOString(),
      stage: 'Redação da Peça',
      modelUsed: 'Gemini 2.5 Pro (Drafting Specialist)',
      status: 'sucesso',
      observations: `Capítulo "${chapter.title}" redigido de forma integral utilizando as técnicas de escrita persuasiva e termos jurídicos aplicados.`
    };

    return { draftedContent: text, log };
  },

  /**
   * Generates a downloadable string in .doc/rtf format that opens natively in MS Word,
   * simulating a genuine DOCX file export with formatting, headings, and legal margins.
   */
  generateDocxBlob(caseData: LegalCase, outline: OutlineItem[]): Blob {
    // Generate a rich HTML representation wrapped in XML or simple CSS-styled HTML
    // which Microsoft Word parses perfectly as a styled text document.
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Contestacao - Processo ${caseData.number}</title>
        <style>
          @page {
            size: 21cm 29.7cm;
            margin: 3cm 3cm 3cm 3cm; /* Standard legal margins in Brazil */
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000000;
            text-align: justify;
          }
          h1 {
            font-family: 'Times New Roman', Times, serif;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
            margin-top: 18pt;
            margin-bottom: 12pt;
            page-break-after: avoid;
          }
          h2 {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 14pt;
            margin-bottom: 6pt;
            page-break-after: avoid;
          }
          p {
            margin-bottom: 12pt;
            text-indent: 2.5cm; /* Paragraph indentation */
          }
          .header-meta {
            text-align: right;
            font-weight: bold;
            margin-bottom: 36pt;
            text-indent: 0;
          }
          .title-doc {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-top: 48pt;
            margin-bottom: 48pt;
            text-indent: 0;
          }
        </style>
      </head>
      <body>
        <div class="header-meta">
          AO JUÍZO DA ${caseData.court.toUpperCase()}<br/>
          PROCESSO Nº: ${caseData.number}
        </div>
        
        <div class="title-doc">
          CONTESTAÇÃO
        </div>
    `;

    // Sort outline by order and append
    const sortedOutline = [...outline].sort((a, b) => a.order - b.order);
    sortedOutline.forEach(item => {
      // Prepare content for HTML rendering (replace newlines with <p>)
      const formattedContent = item.content
        .split('\n\n')
        .map(paragraph => {
          if (paragraph.trim().startsWith('EXCELENTÍSSIMO') || paragraph.trim().startsWith('PROCESSO') || paragraph.trim().startsWith('CONTESTAÇÃO')) {
            return `<div style="text-align: center; font-weight: bold; margin-bottom: 12pt;">${paragraph.replace(/\n/g, '<br/>')}</div>`;
          }
          return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('');

      htmlContent += `
        <h2>${item.title}</h2>
        <div>${formattedContent}</div>
        <br/>
      `;
    });

    htmlContent += `
      </body>
      </html>
    `;

    return new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8'
    });
  }
  ,

  async generateDocxViaApi(caseData: LegalCase, outline: OutlineItem[]): Promise<Blob> {
    const mode = getExecutionMode();
    const response = await fetch(`${API_BASE_URL}/api/export/docx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseData,
        outline,
        simulatedData: mode !== 'real' || caseData.simulatedData !== false
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na geração DOCX: ${response.status}`);
    }

    return response.blob();
  }
};
