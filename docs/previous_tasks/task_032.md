# Task

## Identificacao

- ID: 032
- Nome: Fase 15.6 - Validacao Integrada e Polish
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Reviewer

---

## Objetivo

Validar a entrega integrada da Fase 15, cobrindo terminal persistente, logs, comandos internos, mencoes e fallback global.

---

## Contexto

Tasks 028-031 implementam partes separadas da Fase 15. Esta task valida o comportamento integrado antes de considerar a fase concluida.

---

## Entradas

- `docs/architecture_fase15.md`
- `docs/task_028.md`
- `docs/task_029.md`
- `docs/task_030.md`
- `docs/task_031.md`
- Codigo implementado.

---

## Escopo

- Revisar implementacao contra arquitetura.
- Executar validacoes estaticas.
- Executar validacoes manuais quando possivel.
- Validar que mensagens sinteticas antigas foram removidas.
- Validar que logs brutos chegam via `@terminal`.
- Validar fallback global.
- Atualizar `review_report.md`, `handoff.md` e `project_status.md`.

---

## Fora de escopo (CRITICO)

- Implementar novas features.
- Adicionar autocomplete.
- Publicar pacote.

---

## Saidas esperadas

- Review report da Fase 15.
- Evidencias de validacao.
- Status documental alinhado.

---

## Criterios de aceite

- Todas as validacoes obrigatorias de `docs/architecture_fase15.md` foram executadas ou justificadas.
- Build TypeScript passa.
- Nao ha divergencia entre docs e codigo.
- Fase 15 tem handoff final claro.

---

## Dependencias

- Task 028 concluida.
- Task 029 concluida.
- Task 030 concluida.
- Task 031 concluida.

---

## Restricoes

- Nao aprovar sem evidencia.
- Registrar ressalvas explicitamente.

---

## Impacto no sistema

- Determina se a Fase 15 pode ser marcada como concluida.

---

## Estrategia de implementacao

Atuar em postura de Reviewer: priorizar bugs, regressao, riscos e lacunas de teste.

---

## Plano de validacao

- Seguir a secao "Validacao" de `docs/architecture_fase15.md`.
- Comparar logs de terminal com historico enviado para IA.
- Conferir fallback em `modelRegistry` e `PipelineEngine`.

---

## Artefatos a atualizar

- `docs/review_report.md`
- `docs/handoff.md`
- `docs/project_status.md`
- `docs/tasks.md`

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
