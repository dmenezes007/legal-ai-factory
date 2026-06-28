# Operacao de Ingestao de Conhecimento

## Entrada

Diretorio monitorado: `knowledge/sources/original`

Formatos aceitos:
- .txt
- .md
- .pdf
- .docx

## Processamento

- Extracao textual (quando tecnicamente possivel)
- Gravacao em `knowledge/sources/processed`
- Metadados JSON em `knowledge/sources/metadata`
- Classificacao automatica:
  - skill
  - mapa_de_teses
  - modelo_peca
  - jurisprudencia
  - doutrina
  - legislacao
  - template
  - caso_exemplo
  - desconhecido

## Execucao

```bash
npm run ingest
```

## Rastreabilidade

Cada item processado gera:
- ID unico
- caminho da fonte original
- caminho da versao processada
- categoria
- alertas de extracao
