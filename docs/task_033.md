# Task 033 - Atualizar Fallback Global para Gemini 3

## Status

Concluida.

## Contexto

O owner confirmou que o nivel gratuito da Gemini API passou a permitir rotas Gemini 3 e solicitou uma atualizacao simples na ordem global de fallback.

## Escopo

- Atualizar `src/agents/modelRegistry.ts`.
- Manter fallback unico para todos os agentes.
- Preservar fallback por API key Gemini.
- Preservar fallback final via Ollama com Qwen3.
- Atualizar `package.json` e `package-lock.json` para `1.1.13`.
- Atualizar `docs/` e `README.md`.

## Ordem implementada

1. `gemini-3.1-pro-preview`
2. `gemini-3-flash-preview`
3. `gemini-2.5-pro`
4. `gemini-3.1-flash-lite`
5. `gemini-2.5-flash`
6. `gemini-2.5-flash-lite`
7. `gemini-2.0-flash`
8. `gemini-2.0-flash-lite`
9. `qwen3:14b`
10. `qwen3:8b`

## Observacao sobre IDs

Os nomes de produto informados pelo owner foram mapeados para IDs de API atuais da documentacao oficial:

- Gemini 3.1 Pro -> `gemini-3.1-pro-preview`
- Gemini 3 Flash -> `gemini-3-flash-preview`
- Gemini 3.1 Flash-Lite -> `gemini-3.1-flash-lite`

Se uma API key nao tiver acesso ou cota para uma rota, o `PipelineEngine` segue o fallback existente.

## Evidencias

- `src/agents/modelRegistry.ts` atualizado.
- `package.json` e `package-lock.json` atualizados para `1.1.13`.
- `npx tsc --noEmit` passou.
- `npm run build` passou apos permissao elevada para escrita em `dist/`.
- Validacao runtime em `dist/agents/modelRegistry.js` confirmou a ordem exportada.
- Documentacao oficial atualizada em:
  - `README.md`;
  - `docs/project_status.md`;
  - `docs/handoff.md`;
  - `docs/tasks.md`;
  - `docs/review_report.md`;
  - `docs/decision_log.md`;
  - `docs/scope_fase15.md`;
  - `docs/architecture_fase15.md`.
