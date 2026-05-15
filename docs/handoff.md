# Handoff

## Task

- ID: 037
- Nome: Fase 16.1 - Arquitetura de Terminal Compartilhado e Memoria Estruturada
- Agente responsavel: Architect
- Status: Nao iniciada

## Resultado

Discovery da Fase 16 concluido e confirmado pelo owner em 2026-05-15.

A evolucao confirmada substitui a premissa da Fase 15 de runner PowerShell com fila e log bruto por um terminal compartilhado observavel baseado em ConPTY, com novo schema de sessao, eventos estruturados, contexto automatico incremental de terminal e compressao por IA.

## Contexto obrigatorio

- `docs/idea_fase16.md`
- `docs/scope_fase16.md`
- `docs/non_goals_fase16.md`
- `docs/task_037.md`
- `docs/project_status.md`
- `docs/tasks.md`
- `docs/decision_log.md`

## Pontos confirmados

- ConPTY e a base tecnica.
- Windows-first/Windows-only e aceitavel para o MVP.
- `/terminal` mantem o nome e troca a implementacao.
- Usuario e IA usam o mesmo terminal, mas com controle de posse.
- Comandos da IA pedem permissao, salvo `autoApproveMode`.
- Comandos pendentes aparecem no terminal antes da aprovacao.
- Comandos recusados entram como eventos estruturados.
- Comandos longos entram como `running` e bloqueiam novos comandos da IA.
- Usuario libera terminal manualmente, por exemplo com `Ctrl+C`.
- Comandos manuais do usuario entram automaticamente no contexto.
- Terminal estruturado e fonte principal para IA; log bruto fica para auditoria/fallback.
- Resultados de ferramenta nao devem mais ser salvos como `role: "user"`.
- Novo `session.json` usa blocos separados e `sequence` global.
- Contexto enviado a IA e timeline cronologica por `sequence`.
- Compressao por IA usa limites 120k/180k tokens; Qwen local 24k/30k.
- Sessoes defasadas por `schemaVersion` mostram aviso sempre que carregadas.

## Restricoes

- Architect nao deve implementar codigo.
- Nao instalar dependencias nesta task.
- Nao migrar sessoes antigas automaticamente.
- Nao apagar sessoes antigas automaticamente.
- Nao criar `/terminal-stop`.
- Nao implementar suporte multiplataforma completo nesta fase.
- Nao fazer redaction automatica.

## Saidas esperadas da proxima acao

- `docs/architecture_fase16.md`
- Tasks formais de implementacao derivadas da arquitetura, se necessario.
- `docs/tasks.md` atualizado.
- `docs/handoff.md` atualizado para a etapa seguinte.
- `docs/decision_log.md` atualizado com decisoes arquiteturais.

## Proxima Acao Sugerida

- Iniciar Architecture da Task 037 com agente Architect e skill `design-architecture`.

