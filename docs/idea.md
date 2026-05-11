# Idea — Toug CLI

## Problema

O desenvolvimento de software assistido por IA depende de serviços cloud (OpenAI, Anthropic), o que cria:
- dependência de APIs externas e custos variáveis;
- perda de controle sobre dados e código;
- ausência de disciplina no processo de desenvolvimento;
- modelos genéricos que não seguem fluxos estruturados.

## Solução

Um **CLI de terminal** que conecta a modelos de IA rodando localmente (via Ollama + Docker) e orquestra múltiplos agentes especializados, cada um com um modelo de IA dedicado, forçando rigorosamente uma pipeline de desenvolvimento estruturada.

## Proposta de valor

- 100% local, sem dependência de cloud
- Múltiplos modelos especializados por função (Discovery, Architect, Executor, Reviewer)
- Pipeline forçada: o modelo é obrigado a seguir o fluxo definido
- Acesso real a comandos do PC e arquivos do projeto (com aprovação)
- Contexto contínuo via artefatos em `docs/`

## Público-alvo

- **MVP**: uso pessoal do criador
- **Futuro**: desenvolvedores que buscam IA local com disciplina de processo

## Nome

**Toug CLI** — comando: `toug`
