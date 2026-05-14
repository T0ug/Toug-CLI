# Task

## Identificacao

- ID: 027
- Nome: Fase 15.1 - Arquitetura de Terminal Persistente por Sessao
- Fase: 15 - Terminal Persistente, Logs e Fallback Unificado
- Agente responsavel: Architect

---

## Objetivo

Definir a arquitetura tecnica para terminal externo persistente por sessao, log persistente acessivel a IA, comandos `/terminal` e `/help`, mencoes `@terminal`, e fallback unico de modelos para todos os agentes.

---

## Contexto

A Fase 14 concluiu a UX interativa e o ToolRunner com PowerShell. Apos a validacao, foi identificado que comandos de servidor, como `npm run dev`, podem ser reportados a IA como iniciados mesmo quando falham rapidamente. Tambem foi identificado que comandos como `cd` nao persistem entre execucoes.

Esta task deve projetar a correcao antes da implementacao.

---

## Entradas

- `docs/idea_fase15.md`
- `docs/scope_fase15.md`
- `docs/non_goals_fase15.md`
- `docs/architecture.md`
- `docs/architecture_fase14.md`
- `docs/decision_log.md`
- `src/engine/toolRunner.ts`
- `src/engine/pipelineEngine.ts`
- `src/data/sessionManager.ts`
- `src/index.ts`
- `src/agents/modelRegistry.ts`
- `log_examples/session.json`

---

## Escopo

- Projetar o ciclo de vida do terminal persistente por sessao.
- Projetar onde o log sera armazenado dentro da pasta da sessao.
- Projetar como `run_command` envia comandos ao terminal persistente.
- Projetar como o CLI le o log e devolve para a IA `Output do comando executado:`.
- Projetar sincronizacao de novos logs antes de chamadas ao modelo, se aplicavel.
- Projetar `/terminal`.
- Projetar `/help`.
- Projetar `@terminal` e `@terminal:N`.
- Projetar alteracoes no carregamento de sessoes para preservar acesso ao log.
- Projetar a nova ordem unica de fallback de modelos para todos os agentes.

---

## Fora de escopo (CRITICO)

- Implementar codigo.
- Criar autocomplete de mencoes.
- Restaurar estado vivo do PowerShell em sessoes antigas.
- Redigir ou mascarar segredos no log.
- Alterar o desenho da pipeline de agentes.
- Publicar no GitHub ou npm.

---

## Saidas esperadas

- Documento de arquitetura da Fase 15 em `docs/architecture_fase15.md`.
- Atualizacao de `docs/implementation_plan.md` com a sequencia macro da Fase 15.
- Definicao de tasks de implementacao seguintes, se a arquitetura exigir divisao.
- Atualizacao de `docs/handoff.md` para a proxima etapa da pipeline.
- Registro de decisoes relevantes em `docs/decision_log.md`.

---

## Criterios de aceite

- A arquitetura explica como evitar mensagens falsas de sucesso para comandos.
- A arquitetura define armazenamento e leitura do log por sessao.
- A arquitetura define comportamento de terminal novo, terminal ja aberto e sessao carregada.
- A arquitetura define contrato de `@terminal` e `@terminal:N`.
- A arquitetura define `/terminal` e `/help`.
- A arquitetura define fallback unico para todos os agentes.
- A arquitetura lista riscos, validacoes manuais e impactos no sistema.
- Nenhum codigo de producao e alterado nesta task.

---

## Dependencias

- Discovery da Fase 15 confirmado pelo usuario.
- Fase 14 concluida e validada.

---

## Restricoes

- Respeitar a pipeline em `.agents/`.
- Usar `docs/` como fonte de verdade.
- Manter foco Windows/PowerShell.
- Logs enviados para IA devem ser brutos por decisao do usuario.

---

## Impacto no sistema

- Afeta execucao de ferramentas.
- Afeta persistencia de sessao.
- Afeta entrada do usuario e comandos internos.
- Afeta mencoes `@`.
- Afeta fallback de modelos.

---

## Estrategia de implementacao

Esta task nao implementa. O Architect deve propor a estrutura tecnica, os contratos entre modulos e a divisao segura das tasks de execucao.

---

## Plano de validacao

- Validar arquitetura contra `log_examples/session.json`.
- Confirmar que o desenho cobre erro rapido de `npm run dev`.
- Confirmar que `cd` passa a ter estado persistente dentro do terminal da sessao.
- Confirmar que sessao carregada consegue acessar log antigo sem reabrir terminal automaticamente.
- Confirmar que fallback tem a mesma ordem para todos os agentes.

---

## Artefatos a atualizar

- `docs/architecture_fase15.md`
- `docs/implementation_plan.md`
- `docs/tasks.md`
- `docs/handoff.md`
- `docs/project_status.md`
- `docs/decision_log.md`

---

## Observacoes

O log bruto pode conter segredos. O usuario confirmou que nao deseja redaction automatica nesta fase.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
