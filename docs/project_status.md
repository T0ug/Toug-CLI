# Project Status - Toug CLI

## Status atual

Fase 13 em andamento. Discovery concluído com Understanding Lock confirmado pelo usuário. Aguardando Architect para design_architecture.

## Concluido

- [x] Discovery inicial do MVP.
- [x] Arquitetura inicial.
- [x] Infraestrutura Node.js/TypeScript.
- [x] Setup Ollama/Docker.
- [x] Cliente Ollama com streaming.
- [x] State Machine e agentes.
- [x] REPL CLI.
- [x] Tool runners por XML.
- [x] ProjectDetector.
- [x] Persistencia de sessoes.
- [x] Gestao de artefatos.
- [x] README, package metadata e release polish.
- [x] Otimizacao de modelos locais.
- [x] Reforco de UX de ferramentas.
- [x] Fase 12 - Provedores Globais e Gemini (todas 7 tasks validadas).
- [x] Fase 13 - Discovery (Understanding Lock confirmado).

## Nova evolucao validada - 2026-05-12

Discovery concluiu e o usuario confirmou o Understanding Lock para a Fase 13: fallback multi-modelo, menções de arquivo e gestão de sessões.

### Confirmado

- Fallback por modelo antes de fallback por API key.
- Ollama como último fallback no modo Gemini (offline = aviso).
- Modelos Ollama unificados em qwen3:14b (primário) e qwen3:8b (fallback).
- Apelidos obrigatórios para API keys com exibição no terminal.
- Sistema de menções @ resolvido pelo CLI sem consumo de tokens.
- Deduplicação de menções por sessão.
- /sessoes para listar, renomear e retomar qualquer sessão anterior.
- Contexto expandido: 50 → 100 mensagens.
- Routing heurístico com confirmação do usuário.
- Atualização Docker: remover modelos antigos, manter qwen3:8b + qwen3:14b.

### Proxima fase

- Proxima acao: Executor inicia a task_020.md (Menções @file)
- Skill indicada: Nenhuma
- Status: **TASK DEFINIDA, AGUARDANDO EXECUTOR**.

## Pendente manual

- [ ] Push final para o GitHub.
- [ ] Publicacao no npm, opcional e manual pelo owner.

