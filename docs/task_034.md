# Task 034 - Exibir Rota de Fallback Bem-Sucedida

## Status

Concluida.

## Contexto

O CLI ja informava quando uma rota Gemini falhava por limite/cota, mas nao deixava claro qual fallback efetivamente gerou a resposta.

## Escopo

- Atualizar `PipelineEngine` para registrar que o fallback foi acionado.
- Quando uma rota posterior gerar resposta com sucesso, imprimir:
  - provider;
  - modelo;
  - alias da key, quando o provider for Gemini.
- Atualizar pacote para `1.1.14`.
- Atualizar README e documentos oficiais.

## Comportamento implementado

Exemplo Gemini:

```text
[Fallback] Rota bem-sucedida: Gemini (Model: gemini-3-flash-preview, Key: Principal).
```

Exemplo Ollama:

```text
[Fallback] Rota bem-sucedida: Ollama (Model: qwen3:14b).
```

## Arquivos alterados

- `src/engine/pipelineEngine.ts`
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/project_status.md`
- `docs/handoff.md`
- `docs/tasks.md`
- `docs/review_report.md`
- `docs/decision_log.md`

## Evidencias

- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- `dist/engine/pipelineEngine.js` contem as mensagens `Rota bem-sucedida` para Gemini e Ollama.
