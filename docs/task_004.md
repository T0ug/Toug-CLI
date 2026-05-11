# Task

## Identificação

- ID: 004
- Nome: Fase 3 — Pipeline Engine e State Machine
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Embutir internamente na aplicação os modelos arquiteturais de Agentes, Skills e a State Machine de execução. A aplicação deve ser capaz de carregar e gerenciar os Prompts e regras base do sistema (como Orchestrator, Discovery, Architect, etc.), ligando as instâncias a um executor da Engine de estados.

---

## Contexto

Temos o Client raw do Ollama capaz de chamar Modelos com streaming. Agora, precisamos da abstração de Inteligência do projeto: a Pipeline Engine. Com isso, os usuários poderão enviar uma mensagem, o Orchestrator interno fará parsing, e o fluxo correto da tarefa mudará o 'Estado' ativo.

---

## Entradas

- `docs/architecture.md` (Para conferir o State Machine Diagram).
- Arquivos pré-existentes na pasta `.agents/` da sua própria estrutura (caso queria inspirar-se em Prompts de Sistema).

---

## Escopo

- Criar `src/agents/agentLoader.ts`: Ler localmente / encapsular as strings base e "System Prompts" dos 5 agentes principais (Discovery, Architect, Executor, Reviewer, Orchestrator).
- Criar a Interface principal de Agente: `AgentContext`, `SystemMessage`.
- Criar `src/engine/pipelineEngine.ts` que guarde o Estado atual (ex: `State: IDLE | DISCOVERY | ARCHITECT | EXECUTING | REVIEW | ORCHESTRATING`).
- Mapear nativamente as responsabilidades do Orchestrator (O routing interno que determina para qual Estado pular dependendo da frase).

---

## Fora de escopo (CRÍTICO)

- NÃO construir a interação de input e leitura com o filesystem local do computador (Execução de Tools, ler e gravar arquivos Node) agora. Ferramentas são Fase 5!
- NÃO codar o input loop do terminal CLI do usuário real. Por enquanto, só as classes abstratas instanciáveis.

---

## Saídas esperadas

- Classes TypeScript e System Prompts embutidos estruturalmente no Node para compor a espinha dorsal de Raciocínio (Engine).

---

## Critérios de aceite

- É possível instanciar `new PipelineEngine()` e manipular suas transições de estado via código puro no `index.ts`.
- Mapeamentos Agent -> Model batem (conforme `configManager`), ex: Se o estado é 'Architect', o `ollamaClient.streamChat` enviaria as requests usando 'deepseek-r1-distill-qwen-32b'.

---

## Dependências

- Task 003 (`ollamaClient` funcionando).

---

## Restrições

- Manter arquitetura orientada a Objeto ou Functional pura. As regras vitais dos Agents (Scope, Limits, Formats) que existiam puramente em Markdown devem virar constantes TypeScript prontas para a injetora de Content do LLM.

---

## Estratégia de implementação

- Sugerimos injetar um pequeno Hardcode map contendo as diretrizes ou criar uma read bridge da pasta local `.agents`. Fica a critério do Executor carregar do filesystem se for dinâmico, ou hardcoded fallback se faltar. Preferencialmente ler de `.agents/` caso presente localmente com fallback caso seja chamado fora desse escopo.

---

## Plano de validação

- Simular a entrada de uma string no `index.ts`, inicializando a `PipelineEngine`, definindo o agente para Orchestrator, e logando o prompt de sistema mapeado em tela.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
