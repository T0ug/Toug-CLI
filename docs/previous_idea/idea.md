# Idea - Toug CLI

## Problema

O desenvolvimento de software assistido por IA tende a depender de servicos cloud, custos variaveis, perda de controle sobre dados/codigo e fluxos pouco disciplinados.

O Toug CLI nasceu para resolver isso com uma CLI de terminal que conecta modelos de IA a uma pipeline forcada de desenvolvimento.

## Solucao atual

Uma CLI em Node.js/TypeScript que conecta a modelos locais via Ollama/Docker e orquestra agentes especializados:

- Discovery
- Architect
- Executor
- Reviewer
- Orchestrator
- Project Research

Cada agente segue regras e uma state machine, usando artefatos em `docs/` para manter continuidade.

## Evolucao planejada: provedores globais de IA

O Toug CLI deve deixar de depender exclusivamente de modelos locais via Ollama e passar a suportar a escolha de um provedor global de IA ao iniciar a CLI.

Nesta etapa, os provedores suportados devem ser:

- Ollama/local, mantendo o comportamento atual.
- Gemini, usando o SDK oficial `@google/genai`.

O objetivo da evolucao e manter a mesma pipeline forcada, os mesmos agentes e o mesmo controle de ferramentas, mas permitir que a execucao da inteligencia venha de um provedor externo quando o usuario escolher.

A escolha do provedor deve ser global para a sessao, perguntada sempre no start da CLI, com Enter usando o ultimo provedor salvo. O provedor tambem deve poder ser alterado pelo comando `/config`.

Os modelos por agente deixam de ser uma verdade livremente configuravel pelo usuario. Essa verdade deve viver nas regras versionadas do CLI.

## Mapeamento Gemini aprovado

- `orchestrator`: `gemini-2.5-flash`
- `discovery`: `gemini-2.5-flash`
- `project_research`: `gemini-2.5-flash`
- `architect`: `gemini-2.5-pro`
- `executor`: `gemini-2.5-pro`
- `reviewer`: `gemini-2.5-pro`

## Proposta de valor

- Escolher entre autonomia local e capacidade externa.
- Manter pipeline forcada independente do provedor.
- Manter aprovacao humana para ferramentas sensiveis.
- Manter continuidade via `docs/`.
- Remover dependencia de `.agents`, `GEMINI.md` ou `PIPELINE_EXAMPLE` no projeto do usuario.

## Publico-alvo

- MVP: uso pessoal do criador.
- Futuro: desenvolvedores que buscam IA com disciplina de processo, seja local ou por provedor externo.

## Nome

Toug CLI - comando: `toug`
