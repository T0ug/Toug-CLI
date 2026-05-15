# Task

## Identificacao

- ID: 037
- Nome: Fase 16.1 - Arquitetura de Terminal Compartilhado e Memoria Estruturada
- Fase: 16 - Terminal Compartilhado Observavel e Memoria Estruturada
- Agente responsavel: Architect

---

## Objetivo

Projetar a arquitetura tecnica da Fase 16, cobrindo terminal ConPTY compartilhado, novo schema de sessao, eventos estruturados, montagem de contexto cronologico e compressao por IA.

---

## Contexto

A Fase 15 validou terminal persistente baseado em runner PowerShell e log bruto, mas a validacao de uso mostrou que esse modelo nao entrega terminal realmente compartilhado nem memoria operacional confiavel. A Fase 16 deve substituir essa base por ConPTY e por um contrato de contexto estruturado.

---

## Entradas

- `docs/idea_fase16.md`
- `docs/scope_fase16.md`
- `docs/non_goals_fase16.md`
- `docs/project_status.md`
- `docs/tasks.md`
- `docs/handoff.md`
- `docs/decision_log.md`
- Codigo atual em `src/engine/pipelineEngine.ts`
- Codigo atual em `src/engine/terminalSessionManager.ts`
- Codigo atual em `src/data/sessionManager.ts`
- Codigo atual em `src/providers/*`

---

## Escopo

- Projetar arquitetura ConPTY para terminal compartilhado Windows.
- Definir controle de posse do terminal.
- Definir eventos estruturados de conversa, ferramentas e terminal.
- Definir novo `session.json` com `schemaVersion`, `tougVersion`, blocos separados e `sequence` global.
- Definir montagem de contexto em timeline cronologica.
- Definir politica de contexto automatico incremental do terminal.
- Definir politica de resumo de outputs de terminal.
- Definir ferramenta `read_terminal_output(commandId)`.
- Definir compressao por IA, limites de tokens e ordem de modelos.
- Definir tratamento de sessoes defasadas.
- Definir impacto em `/terminal`, `@terminal`, `@terminal:<linhas>`, `/help` e README.
- Materializar tasks formais de implementacao posteriores.

---

## Fora de escopo (CRITICO)

- Nao implementar codigo nesta task.
- Nao instalar dependencias.
- Nao alterar runtime do terminal ainda.
- Nao migrar sessoes antigas.
- Nao mudar regras de pipeline fora do necessario para a arquitetura.

---

## Saidas esperadas

- Documento de arquitetura da Fase 16 em `docs/architecture_fase16.md`.
- Tasks formais subsequentes materializadas em `docs/task_038.md` em diante, se a arquitetura exigir divisao.
- `docs/tasks.md` atualizado com a Task 037 e tasks derivadas.
- `docs/handoff.md` apontando para a proxima acao correta.
- `docs/decision_log.md` atualizado com decisoes arquiteturais.

---

## Criterios de aceite

- Arquitetura cobre todos os requisitos confirmados em Discovery.
- Arquitetura explicita contratos de sessao, eventos e contexto.
- Arquitetura define como ConPTY sera integrado ao CLI.
- Arquitetura define como a IA recebe terminal estruturado e memoria comprimida.
- Arquitetura define validacao manual e tecnica.
- Nenhuma implementacao e feita nesta task.

---

## Dependencias

- Fase 15 concluida e validada.
- Understanding Lock da Fase 16 confirmado pelo owner.

---

## Restricoes

- ConPTY e obrigatorio como base do MVP.
- Windows-first/Windows-only e aceitavel.
- `docs/` continua sendo a fonte de verdade.
- Resultados de ferramenta nao devem continuar como `role: "user"` no novo contrato.

---

## Impacto no sistema

- Terminal e execucao de comandos.
- Persistencia de sessao.
- PipelineEngine e montagem de contexto.
- Providers Gemini/Ollama.
- Compressao de contexto.
- Comandos internos `/terminal`, `/help` e mencoes `@terminal`.

---

## Estrategia de implementacao

Esta task deve apenas projetar a solucao. A arquitetura deve dividir a implementacao em etapas pequenas e validaveis, preferencialmente isolando primeiro o novo contrato de sessao/contexto antes da troca completa do terminal.

---

## Plano de validacao

- Revisar arquitetura contra `docs/scope_fase16.md`.
- Verificar se cada requisito possui caminho tecnico.
- Verificar se cada nao objetivo foi respeitado.
- Garantir que tasks derivadas tenham criterios de aceite testaveis.

---

## Artefatos a atualizar

- `docs/architecture_fase16.md`
- `docs/tasks.md`
- `docs/handoff.md`
- `docs/project_status.md`
- `docs/decision_log.md`

---

## Observacoes

Esta task inicia a etapa Architecture da Fase 16. Execucao de codigo so deve ocorrer apos arquitetura aprovada e task de implementacao liberada pelo Orchestrator.

---

## Status

- [x] Nao iniciada
- [ ] Em andamento
- [ ] Concluida
- [ ] Bloqueada

