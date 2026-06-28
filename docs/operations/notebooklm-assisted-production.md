# NotebookLM Assisted Production

## Objetivo

Integrar o NotebookLM como motor cognitivo assistido da Legal AI Factory, preservando a arquitetura propria e mantendo controle operacional humano.

## Escopo implementado (EPIC 5)

- Modulo criado em `tools/notebooklm-assistant`.
- Automacao via Playwright em modo visual.
- Suporte para abrir notebook existente por URL ou buscar por nome.
- Checkpoint humano para confirmar fontes carregadas.
- Execucao sequencial de comandos derivados da skill.
- Captura de respostas com espera de estabilizacao.
- Persistencia de respostas em `knowledge/cases/<case-id>/notebooklm-responses.json`.
- Geracao de DOCX final em `knowledge/cases/<case-id>/output/`.

## Regras de operacao

1. Nao realizar engenharia reversa agressiva da interface.
2. Nao armazenar credenciais Google em arquivo local.
3. Usar fallback de seletores e permitir operacao manual sempre que necessario.
4. Priorizar estabilidade sobre automacao total.

## Procedimento operacional

1. Executar:

```bash
npm run notebooklm:assistant -- --case-id <case-id> --notebook-url "https://notebooklm.google.com/notebook/<id>"
```

2. Confirmar no navegador:
- notebook correto
- fontes do caso carregadas e selecionadas

3. A cada etapa:
- validar prompt sugerido
- permitir ajuste manual
- confirmar continuidade

4. Ao final, validar artefatos:
- `knowledge/cases/<case-id>/notebooklm-responses.json`
- `knowledge/cases/<case-id>/output/contestacao_<case-id>.docx`

## Riscos conhecidos

- Mudancas de UI no NotebookLM podem reduzir eficacia dos seletores.
- Sessao Google expirada exige nova autenticacao manual.
- Captura automatica pode falhar em respostas muito curtas; nesses casos, usar colagem manual.

## Evidencias e auditoria

O arquivo `notebooklm-responses.json` e o registro oficial da execucao assistida, contendo:
- prompts enviados
- respostas capturadas
- timestamps
- observacoes operacionais

Esses registros suportam rastreabilidade sem acoplar a aplicacao a dependencia direta da interface do NotebookLM.
