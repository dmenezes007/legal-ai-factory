# EPIC 1 - Knowledge Discovery Report

## Escopo auditado
- Fonte primaria: `knowledge/sources/original/notebooklm`
- Total de documentos analisados: **25**
- Taxonomia aplicada: `knowledge/taxonomy.yaml`

## Inventario Executivo
| Area juridica | Quantidade |
|---|---:|
| Saude Suplementar Empresarial | 18 |
| Processual Civil Probatorio | 4 |
| Nao identificado | 2 |
| Contencioso Civel e Consumidor | 1 |

| Categoria taxonomica | Quantidade |
|---|---:|
| jurisprudencia | 13 |
| modelo_peca | 4 |
| documento_processual | 3 |
| skill | 3 |
| doutrina | 1 |
| mapa_de_teses | 1 |

## Detecoes automaticas
- Grupos de documentos duplicados (hash exato): **2**
- Pares de documentos semelhantes: **1**
- Pares de documentos complementares: **8**

## Candidatos naturais identificados
- Skills: **3**
- Workflows: **11**
- Mapas de Teses: **1**
- Templates: **4**
- Knowledge Objects: **17**

## Maturidade por dominio
| Dominio | Documentos | Categorias cobertas | Maturidade |
|---|---:|---|---|
| Saude Suplementar Empresarial | 18 | documento_processual, doutrina, jurisprudencia, mapa_de_teses, modelo_peca, skill | 5 (Avancado) |
| Nao identificado | 2 | jurisprudencia | 1.8 (Inicial) |
| Processual Civil Probatorio | 4 | documento_processual, jurisprudencia | 3 (Intermediario) |
| Contencioso Civel e Consumidor | 1 | skill | 1 (Inicial) |

## Matriz de prioridade para migracao
| Candidato | Tipo | Completude | Reutilizacao | Valor operacional | Dependencia externa | Score | Prioridade |
|---|---|---:|---:|---:|---:|---:|---|
| Skill de Contestacao de Reajuste Anual (Falso Coletivo Produto 557) | Skill | 5 | 5 | 5 | 2 | 4.85 | Alta prioridade |
| Workflow de Montagem Defensiva (doutrina + jurisprudencia + mapa + modelo) | Workflow | 4 | 5 | 4 | 3 | 4.1 | Media prioridade |
| Mapa de Aderencia de Teses para reajuste anual | Mapa de Teses | 4 | 4 | 4 | 1 | 4.15 | Media prioridade |
| Template de Contestacao de Reajuste SulAmerica | Template | 4 | 5 | 5 | 1 | 4.7 | Alta prioridade |
| Knowledge Objects de Jurisprudencia por tese | Knowledge Object | 4 | 4 | 4 | 1 | 4.15 | Media prioridade |

### Alta prioridade
- Skill de Contestacao de Reajuste Anual (Falso Coletivo Produto 557) (Skill)
- Template de Contestacao de Reajuste SulAmerica (Template)

### Media prioridade
- Workflow de Montagem Defensiva (doutrina + jurisprudencia + mapa + modelo) (Workflow)
- Mapa de Aderencia de Teses para reajuste anual (Mapa de Teses)
- Knowledge Objects de Jurisprudencia por tese (Knowledge Object)

### Baixa prioridade
- Nenhum

## Primeira Skill oficial indicada para o MVP
**Skill de Contestacao de Reajuste Anual (Falso Coletivo Produto 557)**

Justificativa pelos criterios do EPIC:
- Maior completude: Combina modelos de contestacao, mapa de teses, doutrina, extratos atuariais, laudos e jurisprudencia correlata.
- Maior reutilizacao: Reaplicavel em litigios repetitivos de reajuste anual com mesma estrutura argumentativa.
- Maior valor operacional: Impacta diretamente o fluxo fim-a-fim de geracao de peca e defesa de maior recorrencia no acervo.
- Menor dependencia externa: Depende majoritariamente de acervo interno consolidado, com baixa necessidade de fontes externas adicionais.

## Observacoes
- Nenhuma conversao para SDL foi realizada neste epico.
- Nenhuma nova funcionalidade ou tela foi implementada.
- Este relatorio e exclusivamente de descoberta, mapeamento e priorizacao.
