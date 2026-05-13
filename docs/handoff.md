# Handoff

## Task
- ID: 022
- Nome: Fase 13.5 - Routing Heurístico e Atualização de Modelos Docker
- Agente responsavel: Executor

## Objetivo
Implementar bypass rápido para dúvidas simples no `index.ts` usando o prefixo `?` e atualizar os comandos de gerência de modelo (`pull_models`) do Docker.

## Escopo Executado
- O `index.ts` intercepta inputs com `?` no início, acionando um pipeline temporário usando exclusivamente o Agente `DISCOVERY` (que não depende de Project Context). O contexto da dúvida é servido no console e imediatamente deletado da memória para não atrapalhar a execução do projeto rodando no fundo.
- Os arquivos `docker/pull_models.bat` e `docker/pull_models.sh` sofreram refatoração total, adicionando lógicas de limpeza agressiva (`ollama rm`) para `llama3`, `deepseek-r1` e `gemma3`, abrindo espaço para baixar `qwen3:14b` e `qwen3:8b` como os atuais pilares absolutos de inteligência do Toug-CLI.

## Validacao / Evidencia
- A aplicação compila sem erros (`npm run build`). 
- A lógica de heurística isola com sucesso as chamadas de API, garantindo queries leves e desacopladas para perguntas triviais do usuário.

## Proxima acao sugerida
- Agente: Reviewer
- Skill: Nenhuma
- Objetivo: Ler a `task_022.md` e validar se a interceptação de `?` atende às expectativas de heurística da Fase 13, fechando assim a última pendência desta jornada.
