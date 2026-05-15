# Implementation Plan - Toug CLI

## Status

Fase 16 Discovery concluido em 2026-05-15.

Proxima etapa: Architecture da Task 037.

## Objetivo

Evoluir o Toug CLI mantendo a pipeline forcada e a rastreabilidade por `docs/`.

## Evolucao atual - Fase 16

Objetivo da Fase 16: substituir o runner PowerShell com fila e log bruto por um terminal compartilhado observavel baseado em ConPTY, com eventos estruturados, contexto automatico de terminal e compressao por IA.

Documentos de referencia:

- `docs/idea_fase16.md`
- `docs/scope_fase16.md`
- `docs/non_goals_fase16.md`
- `docs/task_037.md`
- `docs/decision_log.md`

## Sequencia macro da Fase 16

1. Projetar arquitetura ConPTY para terminal compartilhado por sessao.
2. Projetar novo schema de sessao com eventos e `sequence` global.
3. Projetar montagem de contexto cronologico para IA.
4. Projetar contexto automatico incremental de terminal.
5. Projetar compressao por IA com limites de tokens e fallback de modelos.
6. Projetar `read_terminal_output`, `/terminal`, `@terminal` e `/help`.
7. Dividir implementacao em tasks formais.
8. Executar apenas apos Architecture aprovada.

## Proxima acao da pipeline

Iniciar a Task 037:

- ID: 037
- Nome: Fase 16.1 - Arquitetura de Terminal Compartilhado e Memoria Estruturada
- Agente: Architect
- Skill: `design-architecture`
- Arquivo: `docs/task_037.md`

## Assumptions confirmadas

- Foco inicial em Windows via ConPTY.
- Terminal compartilhado e por sessao.
- Usuario e IA nao digitam simultaneamente.
- Terminal estruturado entra automaticamente no contexto quando houver mudanca.
- Sem redaction automatica.
- Compressao de contexto usa IA e memoria estruturada.
- Sessoes antigas nao migram automaticamente, mas podem ser carregadas com aviso.

## Observacao

Este plano nao substitui a task formal. Para a proxima etapa, `docs/task_037.md` e a fonte operacional.
