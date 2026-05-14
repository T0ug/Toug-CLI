# Implementation Plan - Toug CLI

## Status

Fase 15 Discovery concluido em 2026-05-14.

Proxima etapa: Architecture da Task 027.

## Objetivo

Evoluir o Toug CLI mantendo a pipeline forcada e a rastreabilidade por `docs/`.

## Evolucao atual - Fase 15

Objetivo da Fase 15: substituir respostas sinteticas de sucesso de comandos por um terminal externo persistente por sessao, com log persistente como fonte de verdade para usuario e IA.

Documentos de referencia:

- `docs/idea_fase15.md`
- `docs/scope_fase15.md`
- `docs/non_goals_fase15.md`
- `docs/task_027.md`
- `docs/decision_log.md`

## Sequencia macro da Fase 15

1. Projetar arquitetura de terminal persistente por sessao.
2. Projetar persistencia e leitura de log por sessao.
3. Projetar `run_command` baseado em log real.
4. Projetar `/terminal`, `/help`, `@terminal` e `@terminal:N`.
5. Projetar fallback unico de modelos para todos os agentes.
6. Dividir implementacao em tasks formais.
7. Executar apenas apos Architecture aprovada.

## Proxima acao da pipeline

Iniciar a Task 027:

- ID: 027
- Nome: Fase 15.1 - Arquitetura de Terminal Persistente por Sessao
- Agente: Architect
- Skill: `design-architecture`
- Arquivo: `docs/task_027.md`

## Assumptions confirmadas

- Foco inicial em Windows/PowerShell.
- Terminal externo e por sessao.
- Log bruto pode ser enviado para IA, inclusive provider cloud.
- Reabertura de sessao antiga nao restaura estado vivo do PowerShell.
- Autocomplete de mencoes fica fora da Fase 15.
- Fallback de modelos e igual para todos os agentes.

## Observacao

Este plano nao substitui a task formal. Para a proxima etapa, `docs/task_027.md` e a fonte operacional.
