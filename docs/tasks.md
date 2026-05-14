# Tasks - Toug CLI

## Fases concluidas

- [x] Fase 1 - Infraestrutura base
- [x] Fase 2 - Infraestrutura Ollama/Docker
- [x] Fase 3 - Pipeline engine
- [x] Fase 4 - Interface de chat
- [x] Fase 5 - Acesso a comandos e arquivos
- [x] Fase 6 - Inicializacao inteligente
- [x] Fase 7 - Persistencia de sessoes
- [x] Fase 8 - Gestao de artefatos
- [x] Fase 9 - Polish e release MVP
- [x] Fase 10 - Otimizacao de memoria e modelos locais
- [x] Fase 11 - UX de ferramentas e reforco de pipeline
- [x] Fase 12 - Provedores Globais e Gemini
- [x] Fase 13 - Fallback Multi-Modelo, Mencoes de Arquivo e Gestao de Sessoes
- [x] Fase 14 - Thinking Display, UX Interativa e Correcoes

## Pendente operacional

- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.

## Fase 12 - Provedores Globais e Gemini

Status: concluida e validada.

### Tasks formais

- [x] Task 011 - Fase 12.1 - Base de Providers, Config v2 e Model Registry (`docs/task_011.md`)
- [x] Task 012 - Fase 12.2 - Provedor Gemini e Function Calling (`docs/task_012.md`)
- [x] Task 013 - Fase 12.3 - Pipeline Engine com Suporte a Function Calling Nativo (`docs/task_013.md`)
- [x] Task 014 - Fase 12.4 - Interface de Selecao Global e Gemini Configs (`docs/task_014.md`)
- [x] Task 015 - Fase 12.5 - Robustez, Tratamento de Erros e Sessao Ciclica (`docs/task_015.md`)
- [x] Task 016 - Fase 12.6 - Controle de Interrupcao (SIGINT) e Limites de Seguranca (`docs/task_016.md`)
- [x] Task 017 - Fase 12.7 - Restricao de Artefatos Iniciais e Finalizacao da Fase 12 (`docs/task_017.md`)

## Fase 13 - Fallback Multi-Modelo, Mencoes de Arquivo e Gestao de Sessoes

Status: concluida e validada.

### Tasks formais

- [x] Task 018 - Fase 13.1 - Refatoracao de Registry e Migracao de Config de API Keys (`docs/task_018.md`)
- [x] Task 019 - Fase 13.2 - Logica de Fallback Multi-Modelo e API Keys no PipelineEngine (`docs/task_019.md`)
- [x] Task 020 - Fase 13.3 - Resolucao de Mencoes a Arquivos (@file) (`docs/task_020.md`)
- [x] Task 021 - Fase 13.4 - Gerenciador de Sessoes (/sessoes) e Limite de Contexto (`docs/task_021.md`)
- [x] Task 022 - Fase 13.5 - Routing Heuristico e Atualizacao de Modelos Docker (`docs/task_022.md`)

## Fase 14 - Thinking Display, UX Interativa e Correcoes

Status: concluida, validada com ressalvas e validada manualmente pelo usuario.

- [x] Implementar componente de menu interativo com setas.
- [x] Implementar menu principal pos-config.
- [x] Remover analise visual do diretorio e prompt automatico de retomar sessao.
- [x] Migrar selecoes Y/N e numericas para menus com setas.
- [x] Implementar thinking display para Ollama e Gemini.
- [x] Renderizar pensamento em cinza escuro durante streaming.
- [x] Adicionar toggle `showThinking` no `/config`.
- [x] Corrigir Ctrl+C durante streaming.
- [x] Substituir execucao de comandos por spawn com entrada interativa.
- [x] Implementar fluxo completo de API keys.

### Tasks formais

- [x] Task 023 - Fase 14.1 - Componente selectMenu e Fundacao de Config (`docs/task_023.md`)
- [x] Task 024 - Fase 14.2 - Thinking Display nos Providers e PipelineEngine (`docs/task_024.md`) - validada com ressalvas
- [x] Task 025 - Fase 14.3 - Fix Ctrl+C e ToolRunner com stdin interativo (`docs/task_025.md`) - validada com ressalvas
- [x] Task 026 - Fase 14.4 - Menu Principal, Migracao UX e Fluxo de API Keys (`docs/task_026.md`) - validada com ressalvas

## Fase 15 - Terminal Persistente, Logs e Fallback Unificado

Status: concluida e validada sem ressalvas pelo owner.

- [x] Projetar terminal externo persistente por sessao.
- [x] Projetar log persistente por sessao como fonte de verdade de comandos.
- [x] Projetar `/terminal` para abrir ou reabrir o terminal da sessao.
- [x] Projetar `@terminal` e `@terminal:N`.
- [x] Projetar `/help` com lista de comandos do CLI.
- [x] Projetar retorno de `run_command` baseado em log real, sem sucesso sintetico.
- [x] Projetar fallback unico de modelos para todos os agentes.

### Tasks formais

- [x] Task 027 - Fase 15.1 - Arquitetura de Terminal Persistente por Sessao (`docs/task_027.md`) - concluida e confirmada
- [x] Task 028 - Fase 15.2 - Terminal Session Manager e Artefatos por Sessao (`docs/task_028.md`) - aprovada
- [x] Task 029 - Fase 15.3 - Runner PowerShell e Execucao via Fila (`docs/task_029.md`) - aprovada
- [x] Task 030 - Fase 15.4 - Comandos `/terminal`, `/help` e Mencoes `@terminal` (`docs/task_030.md`) - aprovada
- [x] Task 031 - Fase 15.5 - Fallback Global de Modelos (`docs/task_031.md`) - aprovada
- [x] Task 032 - Fase 15.6 - Validacao Integrada e Polish (`docs/task_032.md`) - aprovada sem ressalvas
