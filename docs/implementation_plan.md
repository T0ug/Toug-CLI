# Implementation Plan - Toug CLI Provider Evolution

## Status

Discovery concluido em 2026-05-12.

Architecture concluida em 2026-05-12.

Task formal inicial criada pelo Orchestrator: `docs/task_011.md`.

## Objetivo

Evoluir o Toug CLI para suportar provedores globais de IA, com Ollama/local e Gemini, mantendo a pipeline forcada, o controle de ferramentas, a seguranca operacional e a criacao disciplinada de artefatos.

## Arquitetura aprovada

Abordagem escolhida: Provider Layer + Tool Dispatcher + Safety Guard.

Documentos de referencia:

- `docs/architecture.md`
- `docs/api_contracts.md`
- `docs/decision_log.md`
- `docs/task_011.md`

## Sequencia macro aprovada

1. Formalizar provider global.
2. Mover modelos por agente para regras internas.
3. Adicionar cliente Gemini.
4. Normalizar ferramentas.
5. Reforcar seguranca de workspace.
6. Melhorar persistencia e controle de geracao.
7. Implementar erros fatais e logs.
8. Embutir pipeline no CLI.

## Proxima acao da pipeline

Executar a Task 011:

- ID: 011
- Nome: Fase 12.1 - Base de Providers, Config v2 e Model Registry
- Agente: Executor
- Skill: `implement-task`
- Arquivo: `docs/task_011.md`

## Assumptions confirmadas

- Projeto continua Windows-only nesta etapa.
- API keys Gemini ficam em texto puro.
- Logs podem conter API keys completas.
- Nao havera configuracao especifica por projeto.
- Nao havera Codex nesta etapa.
- Gemini nao deve cair automaticamente para Ollama se falhar totalmente.
- `transition_state` nao e ferramenta publica do modelo.

## Observacao

Este plano nao substitui a task formal. Para execucao, `docs/task_011.md` e a fonte operacional.
