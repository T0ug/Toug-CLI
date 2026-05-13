# Task

## Identificação

- ID: 001
- Nome: Fase 1 — Infraestrutura base
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Inicializar a fundação do projeto Node.js e TypeScript, configurando scaffolding físico de diretórios, sistema de build e definição de pacote global para CLI.

---

## Contexto

Esta é a primeira etapa de implementação técnica. Antes de inserir lógicas pesadas, agentes ou conexões com LLMs, a fundação nativa do Node precisa estar perfeitamente estruturada para garantir a consistência das próximas tarefas.

---

## Entradas

- `docs/architecture.md` (Para conhecer a divisão de camadas do src/)
- `docs/tasks.md` (Fase 1 definida no macro)
- `docs/decision_log.md`

---

## Escopo

- Rodar instrução de build (`npm init`).
- Configurar TypeScript (`tsconfig.json`) com build strict para `./dist`.
- Criar árvore de diretórios raiz para as "5 camadas lógicas": `src/cli`, `src/orchestrator`, `src/agents`, `src/engine`, `src/data`.
- Criar aquivo entrypoint `src/index.ts`.
- Configurar na `package.json` o campo `"bin": { "toug": "./dist/index.js" }`.
- Instalar dependências iniciais e básicas de infra (ex: `typescript`, `@types/node`).
- Inicializar repositório Git local.

---

## Fora de escopo (CRÍTICO)

- NÃO implementar nenhuma lógica do CLI (parsers do commander).
- NÃO embutir leitura recursiva ou sistema de agents do `.agents/` ainda.
- NÃO conectar biblioteca HTTP (fetch/undici) ou Ollama ainda.

---

## Saídas esperadas

- O repositório contendo todas as descrições de pacotes (`package.json`, `tsconfig.json`).
- O esqueleto do `src/` modularizado.
- Um script simples `npm run build` funcional sem falhas de linter.

---

## Critérios de aceite

- A pasta `.git` existe.
- A compilação TypeScript transita arquivos de `src` para `dist` retornando *Exit Code 0*.
- O `package.json` possui as rotas corretas pro binário do terminal ser executado localmente amarrado ao comando global `toug`.

---

## Dependências

- Nenhuma dependência local anterior (esta é a task fundadora).

---

## Restrições

- Padrões de tipo: TypeScript estritamente tipado.
- Dependências em exagero: Não instalar bibliotecas não autorizadas pela arquitetura.

---

## Impacto no sistema

- Estabelece ambiente root. O código-fonte só poderá crescer com base na modelagem de pastas que for definida aqui.

---

## Estratégia de implementação

1. Inicialização do Git e NPM.
2. Instalações de "dev" via `npm i -D`.
3. Criação dos arquivos `.json` das tipagens e configs.
4. Geração das subpastas (`mkdir -p src/...`).

---

## Plano de validação

- Na raiz do projeto terminal: Verificar presença de `./node_modules`, `tsconfig.json`.
- Rodar `npx tsc --noEmit` de validação em um arquivo fictício simples.

---

## Artefatos a atualizar

- `package.json`
- `tsconfig.json`
- `docs/project_status.md` (Pelo Reviewer futuramente).

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
