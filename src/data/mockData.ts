import { LegalCase, CaseDocument, CaseDiagnostic, LegalThesis, OutlineItem, AuditLog } from '../types';

export const DEFAULT_CASES: LegalCase[] = [
  {
    id: 'case_1',
    number: '1023456-78.2026.8.26.0100',
    court: '3ª Vara Cível do Foro Central da Comarca de São Paulo - SP',
    rite: 'Procedimento Comum Cível',
    plaintiff: 'Mariana de Souza Silva',
    defendant: 'AeroBrasil Linhas Aéreas S/A',
    client: 'AeroBrasil Linhas Aéreas S/A',
    legalArea: 'Direito do Consumidor / Civil',
    observations: 'Caso envolve atraso de voo internacional (SP-Paris) de 14 horas e extravio temporário de bagagem por 3 dias na ida.',
    createdAt: '2026-06-25T09:30:00-03:00',
    status: 'theses_mapped'
  },
  {
    id: 'case_2',
    number: '0100456-12.2026.5.02.0045',
    court: '45ª Vara do Trabalho de São Paulo - SP',
    rite: 'Procedimento Ordinário Trabalhista',
    plaintiff: 'João Ricardo Pereira',
    defendant: 'TechSoluções Serviços S/A',
    client: 'TechSoluções Serviços S/A',
    legalArea: 'Direito do Trabalho',
    observations: 'Pedido de horas extras com base em suposto cargo de confiança inexistente e equiparação salarial com colega paradigma.',
    createdAt: '2026-06-26T14:15:00-03:00',
    status: 'drafting'
  }
];

export const DEFAULT_DOCUMENTS: CaseDocument[] = [
  // Case 1 Docs
  {
    id: 'doc_1_1',
    caseId: 'case_1',
    name: 'Petiçao_Inicial_MarianaSilva.pdf',
    size: '1.2 MB',
    type: 'pdf',
    status: 'processed',
    contentSnippet: 'Petição inicial requerendo indenização por danos morais no valor de R$ 25.000,00 e danos materiais de R$ 4.200,00 decorrentes de atraso de voo e extravio de bagagem.'
  },
  {
    id: 'doc_1_2',
    caseId: 'case_1',
    name: 'Comprovante_Passagem_E_Bagagem.pdf',
    size: '450 KB',
    type: 'pdf',
    status: 'processed',
    contentSnippet: 'E-ticket do voo AB-924 de São Paulo (GRU) para Paris (CDG). Comprovante de despacho de 1 mala com peso de 22kg.'
  },
  {
    id: 'doc_1_3',
    caseId: 'case_1',
    name: 'Relatorio_PIR_Extravio.pdf',
    size: '320 KB',
    type: 'pdf',
    status: 'processed',
    contentSnippet: 'Property Irregularity Report (PIR) aberto no aeroporto de Paris Charles de Gaulle em 12/03/2026. Bagagem entregue no hotel em 15/03/2026.'
  },
  {
    id: 'doc_1_4',
    caseId: 'case_1',
    name: 'Notas_Fiscais_Gastos_Emergenciais.pdf',
    size: '890 KB',
    type: 'pdf',
    status: 'pending',
    contentSnippet: 'Recibos de compras de roupas, itens de higiene pessoal e medicamentos efetuadas em Paris nos dias 13 e 14 de março de 2026, totalizando € 680,00.'
  },

  // Case 2 Docs
  {
    id: 'doc_2_1',
    caseId: 'case_2',
    name: 'Inicial_Trabalhista_JoaoPereira.docx',
    size: '85 KB',
    type: 'docx',
    status: 'processed',
    contentSnippet: 'Reclamação trabalhista alegando jornada das 08h às 20h sem pagamento de horas extras, sustentando nulidade do cargo de gestão (Art. 62, II da CLT).'
  },
  {
    id: 'doc_2_2',
    caseId: 'case_2',
    name: 'Contrato_de_Trabalho_Assinado.pdf',
    size: '2.1 MB',
    type: 'pdf',
    status: 'processed',
    contentSnippet: 'Contrato individual de trabalho de João Ricardo Pereira. Cargo de Coordenador de Operações, com gratificação de função de 40% sobre o salário básico.'
  },
  {
    id: 'doc_2_3',
    caseId: 'case_2',
    name: 'Holerites_Periodo_Integral.pdf',
    size: '3.4 MB',
    type: 'pdf',
    status: 'processed',
    contentSnippet: 'Demonstrativos de pagamento dos últimos 24 meses evidenciando salário base de R$ 8.500,00 acrescido de gratificação de função de R$ 3.400,00.'
  }
];

export const DEFAULT_DIAGNOSTICS: Record<string, CaseDiagnostic> = {
  'case_1': {
    caseId: 'case_1',
    plaintiff: 'Mariana de Souza Silva',
    defendant: 'AeroBrasil Linhas Aéreas S/A',
    rite: 'Procedimento Comum Cível',
    court: '3ª Vara Cível do Foro Central de São Paulo - SP',
    claims: [
      'Indenização por danos morais de R$ 25.000,00 decorrente de estresse, fadiga e frustração pelo atraso do voo GRU-CDG.',
      'Indenização por danos materiais de R$ 4.200,00 (referente a € 700,00) gastos com roupas e produtos de higiene em Paris.'
    ],
    foundations: [
      'Artigo 14 do Código de Defesa do Consumidor (CDC) - Responsabilidade objetiva do prestador de serviço.',
      'Artigo 6º, VI do CDC - Direito à efetiva prevenção e reparação de danos patrimoniais e morais.',
      'Precedentes do STJ sobre dano moral presumido (in re ipsa) em atrasos severos de voos internacionais.'
    ],
    keyDocuments: [
      'Petição Inicial',
      'Bilhete de passagem aérea GRU-CDG',
      'PIR (Relatório de Irregularidade de Bagagem)',
      'Notas fiscais de compras em Paris'
    ],
    gaps: [
      {
        id: 'gap_1_1',
        title: 'Ausência de Prova de Assistência Material',
        description: 'A petição inicial alega que a companhia aérea não prestou assistência material (alimentação e hospedagem) durante as 14h de atraso em Guarulhos.',
        severity: 'high',
        suggestion: 'Verificar no sistema interno se foram emitidos vouchers de alimentação e hotel, ou se a passageira recusou a acomodação oferecida.'
      },
      {
        id: 'gap_1_2',
        title: 'Falta de Comprovação de Danos Materiais Reais',
        description: 'Os recibos de compras juntados aos autos totalizam € 680,00, mas incluem itens de luxo (perfumes, sapatos de marca) que extrapolam o conceito de despesa emergencial por bagagem atrasada.',
        severity: 'medium',
        suggestion: 'Impugnar especificamente as notas fiscais de itens não-essenciais ou supérfluos na contestação.'
      },
      {
        id: 'gap_1_3',
        title: 'Limitação pelo Tratado de Montreal',
        description: 'A autora pleiteia indenizações com base exclusiva no CDC, ignorando as Convenções Internacionais (Varsóvia/Montreal) consagradas pelo STF (Tema 210 de Repercussão Geral).',
        severity: 'medium',
        suggestion: 'Invocar a aplicação preferencial do Tratado de Montreal para limitar o teto indenizatório por danos materiais e refutar o dano moral punitivo.'
      }
    ]
  },
  'case_2': {
    caseId: 'case_2',
    plaintiff: 'João Ricardo Pereira',
    defendant: 'TechSoluções Serviços S/A',
    rite: 'Procedimento Ordinário Trabalhista',
    court: '45ª Vara do Trabalho de São Paulo - SP',
    claims: [
      'Nulidade do enquadramento no art. 62, II da CLT (Cargo de Confiança) com condenação ao pagamento de 320 horas extras.',
      'Equiparação salarial com o paradigma Thiago Alencar, com pagamento de diferenças salariais de R$ 2.500,00/mês.'
    ],
    foundations: [
      'Artigo 461 da CLT - Equiparação salarial por idêntica função, produtividade e perfeição técnica.',
      'Súmula 6 do TST - Requisitos e ônus da prova na equiparação salarial.',
      'Artigo 58 e 59 da CLT - Limites da jornada ordinária de trabalho.'
    ],
    keyDocuments: [
      'Contrato de Trabalho do Reclamante',
      'Holerites demonstrando pagamento de gratificação de função (40%)',
      'Ficha de registro de empregados do Reclamante e do Paradigma'
    ],
    gaps: [
      {
        id: 'gap_2_1',
        title: 'Ausência de Controle de Jornada',
        description: 'A empresa não registrava os pontos do reclamante confiando no enquadramento do cargo de confiança. Caso o juiz descaracterize o art. 62, haverá presunção de veracidade da jornada alegada pelo autor (Súmula 338 do TST).',
        severity: 'high',
        suggestion: 'Localizar e-mails corporativos, registros de logins no sistema ou depoimentos de testemunhas que confirmem que o autor possuía total flexibilidade de horários e poder de mando.'
      },
      {
        id: 'gap_2_2',
        title: 'Diferença de Tempo de Serviço do Paradigma',
        description: 'A petição alega igualdade absoluta, mas a ficha funcional do paradigma Thiago Alencar mostra que este trabalha na empresa há 4 anos a mais que o reclamante.',
        severity: 'low',
        suggestion: 'Invocar óbice do §1º do Art. 461 da CLT (diferença de tempo na função superior a 2 anos impede equiparação).'
      }
    ]
  }
};

export const DEFAULT_THESES: LegalThesis[] = [
  // Case 1 Theses
  {
    id: 'thesis_1_1',
    caseId: 'case_1',
    title: 'Prevalência dos Tratados Internacionais (Tema 210 STF)',
    hypothesis: 'Aplica-se a Convenção de Montreal em detrimento das normas gerais do CDC para voos internacionais.',
    adherence: 'Alta',
    normativeBasis: 'Art. 178 da CF/88; Recurso Extraordinário (RE) 636331 (Tema 210 do STF).',
    relatedEvidence: 'Bilhete aéreo internacional de ida e volta.',
    correlatedRequest: 'Improcedência ou limitação de indenização acima dos limites em DES (Direitos Especiais de Saque).',
    selected: true,
    type: 'preliminar'
  },
  {
    id: 'thesis_1_2',
    caseId: 'case_1',
    title: 'Caso Fortuito Externo - Condições Climáticas Adversas (Força Maior)',
    hypothesis: 'O atraso de 14 horas ocorreu devido ao fechamento temporário do aeroporto internacional de GRU por névoa densa na pista.',
    adherence: 'Alta',
    normativeBasis: 'Art. 393 do Código Civil Brasileiro (exclusão de responsabilidade civil).',
    relatedEvidence: 'Boletim meteorológico oficial da INFRAERO de 12/03/2026 e diário de bordo do comandante.',
    correlatedRequest: 'Improcedência total do pleito indenizatório por dano moral.',
    selected: true,
    type: 'merito'
  },
  {
    id: 'thesis_1_3',
    caseId: 'case_1',
    title: 'Inexistência de Dano Moral Presumido em Extravio Temporário de Bagagem',
    hypothesis: 'A bagagem foi devolvida intacta em 3 dias. Mero aborrecimento cotidiano, sem violação aos direitos da personalidade.',
    adherence: 'Média',
    normativeBasis: 'Jurisprudência unificada da 3ª e 4ª Turma do Superior Tribunal de Justiça (STJ).',
    relatedEvidence: 'PIR com data de devolução registrada no dia 15/03/2026.',
    correlatedRequest: 'Improcedência do dano moral ou, subsidiariamente, redução drástica do quantum (mínimo razoável).',
    selected: true,
    type: 'merito'
  },
  {
    id: 'thesis_1_4',
    caseId: 'case_1',
    title: 'Impugnação Específica aos Danos Materiais Requeridos (Supérfluos)',
    hypothesis: 'O reembolso deve se limitar a itens de primeira necessidade. Compras de cosméticos de grife e sapatos caros não são indenizáveis.',
    adherence: 'Alta',
    normativeBasis: 'Art. 944 do Código Civil (extensão do dano mede a indenização); Princípio da vedação ao enriquecimento sem causa.',
    relatedEvidence: 'Notas fiscais de compras contendo perfumes, sapatos e joias.',
    correlatedRequest: 'Exclusão dos itens supérfluos, reduzindo a condenação material para o máximo de € 150,00.',
    selected: true,
    type: 'merito'
  },

  // Case 2 Theses
  {
    id: 'thesis_2_1',
    caseId: 'case_2',
    title: 'Legítimo Enquadramento no Cargo de Confiança (Art. 62, II, CLT)',
    hypothesis: 'O reclamante era coordenador-geral, possuía amplos poderes de contratação, dispensa e aplicação de penalidades, além de gratificação superior a 40%.',
    adherence: 'Alta',
    normativeBasis: 'Artigo 62, II e parágrafo único da CLT.',
    relatedEvidence: 'Fichas de demissão e admissão assinadas pelo reclamante; Holerites comprovando pagamento do adicional.',
    correlatedRequest: 'Improcedência total do pleito de horas extraordinárias.',
    selected: true,
    type: 'merito'
  },
  {
    id: 'thesis_2_2',
    caseId: 'case_2',
    title: 'Impugnação à Equiparação Salarial - Diferença Temporal Superior a 2 Anos',
    hypothesis: 'O paradigma Thiago possui 4 anos a mais de casa na exata mesma função de Coordenador, óbice intransponível do art. 461 da CLT.',
    adherence: 'Alta',
    normativeBasis: 'Artigo 461, §1º da CLT; Súmula 6, inciso III do Colendo TST.',
    relatedEvidence: 'Ficha Cadastral do Colaborador Thiago Alencar, contratado em 2020.',
    correlatedRequest: 'Improcedência absoluta do pedido de equiparação salarial e reflexos.',
    selected: true,
    type: 'merito'
  },
  {
    id: 'thesis_2_3',
    caseId: 'case_2',
    title: 'Inaplicabilidade de Multas dos Arts. 467 e 477 da CLT',
    hypothesis: 'Não há parcelas rescisórias incontroversas e o pagamento das verbas rescisórias ordinárias foi quitado estritamente no prazo legal.',
    adherence: 'Alta',
    normativeBasis: 'Artigos 467 e 477 da Consolidação das Leis do Trabalho.',
    relatedEvidence: 'TRCT devidamente assinado e comprovante de PIX bancário dentro de 10 dias da rescisão.',
    correlatedRequest: 'Afastamento definitivo das penalidades pleiteadas.',
    selected: true,
    type: 'processual'
  }
];

export const DEFAULT_OUTLINES: Record<string, OutlineItem[]> = {
  'case_1': [
    {
      id: 'o_1_1',
      caseId: 'case_1',
      title: '1. PREÂMBULO E QUALIFICAÇÃO',
      sectionType: 'preambulo',
      content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA 3ª VARA CÍVEL DO FORO CENTRAL DA COMARCA DE SÃO PAULO - SP.

PROCESSO Nº 1023456-78.2026.8.26.0100

AEROBRASIL LINHAS AÉREAS S/A, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº 12.345.678/0001-90, com sede na Avenida Paulista, nº 1.000, Bela Vista, São Paulo/SP, CEP 01310-100, endereço eletrônico juridico@aerobrasil.com, por seus advogados signatários (mandato anexo), vem, mui respeitosamente, perante Vossa Excelência, com fulcro nos artigos 335 e seguintes do Código de Processo Civil, apresentar a presente

CONTESTAÇÃO

à Ação de Indenização por Danos Morais e Materiais proposta por MARIANA DE SOUZA SILVA, já qualificada nos autos, pelos motivos de fato e de direito que passa a expor.`,
      status: 'aprovado',
      order: 1
    },
    {
      id: 'o_1_2',
      caseId: 'case_1',
      title: '2. SÍNTESE DA PETIÇÃO INICIAL',
      sectionType: 'resumo',
      content: `Trata-se de ação de indenização por danos materiais e morais na qual a Autora alega ter contratado os serviços de transporte aéreo da Ré para o trecho São Paulo (GRU) - Paris (CDG), em voo agendado para o dia 12/03/2026 (voo AB-924).

Sustenta a Autora que o referido voo sofreu um atraso de 14 (quatorze) horas na decolagem, acarretando cansaço e frustração extrema. Ademais, relata que, ao desembarcar no destino final (Paris), foi surpreendida com o extravio temporário de sua bagagem despachada, a qual somente veio a ser entregue em seu hotel após 3 (três) dias.

Sob estes argumentos, postula a condenação da companhia aérea ré ao pagamento de:
a) Danos materiais no montante de R$ 4.200,00, referentes a gastos emergenciais com vestuário e produtos de higiene pessoal efetuados no exterior;
b) Danos morais na vultosa importância de R$ 25.000,00 sob a premissa de dano "in re ipsa".

Entretanto, conforme restará amplamente demonstrado, os pedidos formulados pela Autora carecem de amparo jurídico e fático, devendo a presente ação ser julgada totalmente improcedente.`,
      status: 'revisado',
      order: 2
    },
    {
      id: 'o_1_3',
      caseId: 'case_1',
      title: '3. PRELIMINAR - PREVALÊNCIA DOS TRATADOS INTERNACIONAIS (TEMA 210 STF)',
      sectionType: 'preliminares',
      content: `Antes de adentrar ao mérito, impõe-se destacar questão jurídica de suma relevância quanto à legislação aplicável ao presente litígio.

A Autora fundamenta sua petição inicial unicamente nas disposições gerais do Código de Defesa do Consumidor (CDC). Todavia, tratando-se de transporte aéreo internacional de passageiros, incidem de forma direta as normas internacionais unificadas, em especial a Convenção de Montreal, ratificada pelo Brasil.

O Supremo Tribunal Federal, ao julgar em regime de repercussão geral o Recurso Extraordinário (RE) 636331 (Tema 210), fixou a seguinte tese constitucional vinculante:

"Nos termos do art. 178 da Constituição da República, as normas e os tratados internacionais limitam a responsabilidade das transportadoras aéreas de passageiros, especialmente as Convenções de Varsóvia e Montreal, tendo prevalência em relação ao Código de Defesa do Consumidor."

Deste modo, qualquer análise de indenização por danos materiais oriundos de extravio de bagagem ou atraso de voo internacional deve se submeter estritamente aos parâmetros e limites pecuniários expressos na Convenção de Montreal, expressos em Direitos Especiais de Saque (DES), restando vedada a aplicação irrestrita das regras gerais e fluidas do CDC.`,
      status: 'gerado',
      order: 3
    },
    {
      id: 'o_1_4',
      caseId: 'case_1',
      title: '4. MÉRITO - CASO FORTUITO EXTERNO: CONDIÇÕES CLIMÁTICAS ADVERSAS',
      sectionType: 'merito',
      content: `No mérito, cumpre esclarecer que o atraso de 14 horas decolagem do voo AB-924 no dia 12/03/2026 não decorreu de falha operacional, desídia ou negligência da empresa aérea, mas sim de força maior decorrente de severas condições meteorológicas no Aeroporto de Guarulhos.

Na referida data, a região metropolitana de São Paulo foi atingida por uma neblina de altíssima densidade, o que reduziu a visibilidade horizontal na pista de pouso e decolagem para patamares muito inferiores aos limites de segurança operacional homologados pelas autoridades aeronáuticas (DECEA/ANAC).

O aeroporto operou sob condições de "pista fechada para pousos e decolagens" por sucessivas horas, gerando um efeito cascata em toda a malha aérea nacional e internacional. Conforme Boletim Meteorológico Oficial da INFRAERO em anexo, a névoa impossibilitou a decolagem do voo da requerida no horário programado por estritas razões de segurança coletiva.

O artigo 393 do Código Civil prevê de forma expressa a exclusão de responsabilidade por perdas e danos nas hipóteses de caso fortuito ou força maior:

"Art. 393. O devedor não responde pelos prejuízos resultantes de caso fortuito ou força maior, se expressamente não se houver por eles responsabilizado."

A segurança dos passageiros e da tripulação é o pilar absoluto da aviação civil. Forçar uma decolagem sob névoa densa violaria gravemente as normas de segurança internacional. Portanto, caracterizado o fortuito externo por fato da natureza imprevisível e inevitável, rompe-se o nexo de causalidade, afastando o dever de indenizar da contestante.`,
      status: 'gerado',
      order: 4
    },
    {
      id: 'o_1_5',
      caseId: 'case_1',
      title: '5. MÉRITO - AUSÊNCIA DE DANO MORAL PELO EXTRAVIO TEMPORÁRIO',
      sectionType: 'merito',
      content: `Pretende a Autora a percepção de vultosa indenização por dano moral no valor de R$ 25.000,00 alegando abalo anímico in re ipsa decorrente do atraso de bagagem por 3 dias na ida de sua viagem internacional.

Contudo, a moderna jurisprudência do Superior Tribunal de Justiça (STJ) pacificou o entendimento de que o extravio temporário de bagagem não gera dano moral presumido, incumbindo à parte autora o ônus de comprovar efetiva e concreta violação a seus direitos de personalidade.

No presente caso, a bagagem foi localizada e devidamente entregue no endereço de hospedagem da Autora em Paris em perfeito estado no terceiro dia de sua estada, conforme atesta o PIR anexo. A Autora não demonstra ter perdido compromisso profissional indeclinável, evento familiar crucial ou qualquer circunstância de extrema gravidade que justificasse o abalo psicológico indenizável.

O transtorno vivenciado, embora gere aborrecimento, insere-se nos riscos normais das viagens internacionais modernas de longa distância, não atingindo a dignidade da passageira. Admitir indenização de R$ 25.000,00 para um atraso de bagagem de 3 dias configuraria nítido enriquecimento sem causa, vedado pelo art. 884 do Código Civil.`,
      status: 'gerado',
      order: 5
    },
    {
      id: 'o_1_6',
      caseId: 'case_1',
      title: '6. MÉRITO - IMPUGNAÇÃO ESPECÍFICA AOS DANOS MATERIAIS REQUERIDOS',
      sectionType: 'merito',
      content: `A Autora pleiteia o ressarcimento integral de R$ 4.200,00 gastos em lojas de Paris durante o período de 3 dias em que aguardava sua mala.

Analisando pormenorizadamente as notas fiscais juntadas às fls. 23-30, constata-se que a passageira adquiriu itens que extrapolam, de forma flagrante, o conceito de "despesas emergenciais" ou de "primeira necessidade".

Entre as notas fiscais apresentadas, encontram-se compras de perfumes franceses importados, sapatos sociais de couro de grife de luxo e joias de prata, bens que em nada se relacionam com o vestuário básico de sobrevivência diária (como roupas íntimas, itens de higiene pessoal e vestimenta simples).

O dano material passível de reembolso deve se guiar pelo princípio da boa-fé objetiva e da mitigação do próprio prejuízo (duty to mitigate the loss). O passageiro não pode aproveitar-se do incidente de extravio temporário para renovar seu guarda-roupas com artigos supérfluos de luxo às custas da empresa aérea.

Desta forma, impugna-se especificamente as despesas relativas aos itens supérfluos, devendo eventual condenação limitar-se unicamente ao reembolso dos itens de higiene e vestuário essencial comprovados, que não excedem a quantia razoável de € 150,00 (cento e cinquenta euros).`,
      status: 'gerado',
      order: 6
    },
    {
      id: 'o_1_7',
      caseId: 'case_1',
      title: '7. REQUERIMENTOS FINAIS E PEDIDOS',
      sectionType: 'requerimentos',
      content: `Ante todo o exposto, pugna a Ré que se digne Vossa Excelência a:

1. Acolher a PRELIMINAR arguida para fixar a incidência prioritária da Convenção de Montreal ao caso em tela, limitando a apuração de danos materiais aos patamares de Direitos Especiais de Saque (DES), nos termos do Tema 210 de Repercussão Geral do STF;

2. No mérito, julgar TOTALMENTE IMPROCEDENTES todos os pedidos veiculados na petição inicial, reconhecendo a ocorrência de caso fortuito/força maior por razões climáticas e a inexistência de dano moral apto a ensejar reparação;

3. Subsidiariamente, na remota hipótese de condenação, seja o quantum indenizatório moral fixado sob estrita observância dos princípios da razoabilidade e proporcionalidade, em valor não superior a R$ 2.000,00, bem como sejam os danos materiais restritos estritamente aos itens de primeira necessidade demonstrados (€ 150,00);

4. Condenar a Autora ao pagamento das custas processuais e honorários advocatícios de sucumbência, estes arbitrados no teto legal do art. 85, §2º do Código de Processo Civil.

Protesta provar o alegado por todos os meios de prova em direito admitidos, especialmente pela juntada de novos documentos, relatórios climáticos, diário de voo da aeronave e depoimento pessoal da Autora.

Termos em que,
Pede deferimento.

São Paulo, 27 de junho de 2026.

ADVOGADO
OAB/SP Nº 123.456`,
      status: 'gerado',
      order: 7
    }
  ],
  'case_2': [
    {
      id: 'o_2_1',
      caseId: 'case_2',
      title: '1. PREÂMBULO E QUALIFICAÇÃO',
      sectionType: 'preambulo',
      content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA 45ª VARA DO TRABALHO DE SÃO PAULO - SP.

PROCESSO Nº 0100456-12.2026.5.02.0045

TECHSOLUÇÕES SERVIÇOS S/A, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 98.765.432/0001-10, estabelecida na Av. das Nações Unidas, nº 5.500, Pinheiros, São Paulo/SP, CEP 05425-070, por seus advogados signatários, nos autos da Reclamação Trabalhista movida por JOÃO RICARDO PEREIRA, vem apresentar

CONTESTAÇÃO

com amparo no artigo 847 da Consolidação das Leis do Trabalho (CLT), consubstanciada nas seguintes razões de fato e de direito.`,
      status: 'aprovado',
      order: 1
    },
    {
      id: 'o_2_2',
      caseId: 'case_2',
      title: '2. SÍNTESE DA RECLAMATÓRIA TRABALHISTA',
      sectionType: 'resumo',
      content: `O Reclamante ajuizou a presente reclamatória alegando que trabalhou na Reclamada no período de 15/02/2022 a 10/04/2026, exercendo por último a função de Coordenador de Operações, com salário base final de R$ 8.500,00.

Pleiteia a condenação da Reclamada ao pagamento de horas extras excedentes à 8ª diária e 44ª semanal, alegando labor em jornada das 08:00 às 20:00 de segunda a sexta-feira. Afirma que seu enquadramento no art. 62, II da CLT é nulo por ausência de reais poderes de gestão.

Requer ainda equiparação salarial com o paradigma Thiago Alencar, sustentando identidade de atribuições com diferença salarial de R$ 2.500,00 mensais, acrescido das multas dos arts. 467 e 477 da CLT.

Como restará sobejamente provado, os pleitos são integralmente infundados.`,
      status: 'revisado',
      order: 2
    },
    {
      id: 'o_2_3',
      caseId: 'case_2',
      title: '3. MÉRITO - ENQUADRAMENTO NO CARGO DE CONFIANÇA E ISENÇÃO DE JORNADA',
      sectionType: 'merito',
      content: `Sustenta o Reclamante a nulidade de seu cargo de confiança sob o frágil pretexto de que não possuía amplos poderes decisórios. A realidade fática, no entanto, é diametralmente oposta.

Como Coordenador de Operações, o Reclamante era a autoridade máxima no setor de tecnologia, coordenando equipe integrada por 14 analistas. Cabia exclusivamente ao autor:
a) Organizar escalas e autorizar férias;
b) Aplicar advertências e suspensões disciplinares (conforme fichas anexas);
c) Entrevistar candidatos e dar aval final para admissões e demissões do setor;
d) Representar a empresa em reuniões estratégicas com grandes clientes.

No aspecto financeiro, o padrão salarial do reclamante era altíssimo e plenamente diferenciado, contando com gratificação de função de 40% paga em holerite próprio sob a rubrica "Gratif. Cargo Confiança", no valor de R$ 3.400,00, totalizando salário de R$ 11.900,00 mensais.

Preenche, portanto, com perfeição matemática e funcional, todos os requisitos exigidos pelo Artigo 62, inciso II, e parágrafo único da CLT. Como detentor de cargo de gestão de alta fidúcia, o autor estava legalmente dispensado do controle de ponto e do recebimento de horas extraordinárias, razão pela qual deve ser julgado improcedente o pedido correspondente.`,
      status: 'gerado',
      order: 3
    },
    {
      id: 'o_2_4',
      caseId: 'case_2',
      title: '4. MÉRITO - IMPEDIMENTO LEGAL DA EQUIPARAÇÃO SALARIAL (DIFERENÇA DE TEMPO)',
      sectionType: 'merito',
      content: `O pleito de equiparação salarial com o colega Thiago Alencar esbarra em evidente impedimento legal intransponível.

Dispõe o artigo 461, §1º da CLT que o direito à equiparação salarial pressupõe, necessariamente, que a diferença de tempo de serviço na mesma função entre o reclamante e o paradigma indicado não seja superior a 2 (dois) anos.

Consultando as respectivas Fichas Funcionais anexas:
- O paradigma Thiago Alencar exerce a função de Coordenador de Operações desde 01/03/2018;
- O Reclamante João Ricardo somente passou a exercer o mesmo cargo de Coordenador de Operações em 01/10/2023.

Existe, portanto, uma diferença temporal de mais de 5 (cinco) anos no exercício da exata mesma função em favor do paradigma Thiago Alencar. Esse intervalo é sobejamente superior ao limite de 2 anos erigido pelo legislador reformador trabalhista de 2017.

Assim, resta sumariamente afastada a hipótese de igualdade salarial com arrimo no Artigo 461, §1º da CLT e na pacífica jurisprudência consubstanciada na Súmula nº 6, inciso III do Tribunal Superior do Trabalho (TST), ensejando a improcedência do pedido correspondente.`,
      status: 'nao_iniciado',
      order: 4
    }
  ]
};

export const DEFAULT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    caseId: 'case_1',
    timestamp: '2026-06-25T09:35:00-03:00',
    stage: 'Upload de Documentos',
    modelUsed: 'N/A (Upload de arquivos)',
    status: 'sucesso',
    observations: 'Documentos do caso (Petição Inicial, E-ticket, PIR) recebidos e armazenados com sucesso.'
  },
  {
    id: 'log_2',
    caseId: 'case_1',
    timestamp: '2026-06-25T09:40:00-03:00',
    stage: 'Leitura de Fontes',
    modelUsed: 'Gemini 2.5 Flash',
    status: 'sucesso',
    observations: 'Leitura OCR realizada em 3 arquivos. Conteúdo indexado e snippet extraído.'
  },
  {
    id: 'log_3',
    caseId: 'case_1',
    timestamp: '2026-06-25T09:45:00-03:00',
    stage: 'Diagnóstico Jurídico',
    modelUsed: 'Gemini 2.5 Pro',
    status: 'sucesso',
    observations: 'Análise do caso finalizada. Identificados 3 pedidos centrais e 3 lacunas críticas de defesa.'
  },
  {
    id: 'log_4',
    caseId: 'case_1',
    timestamp: '2026-06-25T09:50:00-03:00',
    stage: 'Mapeamento de Teses',
    modelUsed: 'Gemini 2.5 Pro',
    status: 'sucesso',
    observations: 'Mapa de teses gerado automaticamente com 4 teses aplicáveis ao rito e fundamentação.'
  }
];
