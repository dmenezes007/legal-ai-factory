# Local Setup

## Requisitos

- Node.js 20+
- npm

## Instalar

```bash
npm install
```

## Rodar frontend e API local

```bash
npm run dev:all
```

Frontend: http://localhost:3000
API local: http://localhost:8787

## Pipeline de ingestao

Coloque fontes em `knowledge/sources/original` e rode:

```bash
npm run ingest
```

## Caso de exemplo

```bash
npm run demo:case
```

## Testes

```bash
npm test
```
