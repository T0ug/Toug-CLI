# Architecture — Toug CLI

## 1. Visão Geral

Toug CLI é uma aplicação CLI construída em `Node.js` que utiliza uma forte abordagem de **Máquina de Estados Finita** (State Machine) para garantir um pipeline rigoroso no ciclo de vida de desenvolvimento de software colaborando com múltiplos modelos locais de IA acoplados via **Ollama**.

## 2. Camadas do Sistema

O CLI é construído sob uma arquitetura de 5 camadas estreitas:

1. **Interface Layer (CLI UI)**: Parseia args iniciais (`commander`) e lida com leitura dinâmica (`@inquirer/prompts`). Exibe *Server Sent Events (SSE)* da IA dinamicamente no stdout.
2. **Orchestration Layer (State Machine)**: É o motor global. Define em que fase a pasta atual se encontra (Discovery, Architect, Executor, Reviewer) gerenciado o lock do prompt e encaminhando mensagens para a persona certa.
3. **Agent Layer (As Personas)**: Conjunto de prompts dinâmicos e regras estritas mapeadas com os modelos. Acessam `.agents/` englobado local na root do NPM para embutir workflows e skills e constrói o pacote (Payload JSON HTTP).
4. **Execution Engine (Tool Handler)**: Abstração perigosa; controla quando o modelo quer interagir via ambiente (fs, shell). Por default, joga Prompts interativos parando a "mente" da IA até o aval do usuário. Executa e repassa CWD output pra IA.
5. **Data Layer (Persistência)**:
   - **Offline Storage** (Sessões/Tokens/Histórico) na pasta root do sistema do usuário (`AppData`).
   - **Live Artifacts** (Código, `docs/*.md`) gravados e lidos ativamente na pasta (CWD) onde o comando `toug` foi invocado.

## 3. Fluxo de Execução

1. **Boot**: `toug` rodado. Scaneia CWD.
   - Existe `docs/`? Estado = `Project Research` -> Lê arquivos -> Resumo pro console.
   - Vazio? Estado = `Discovery`.
2. **Input Loop**: Usuário envia input.
3. **Dispatch**: State Machine acha o Agent -> Junta `Histórico(Sessão) + SystemPrompt(Agent) + User Input + ToolList` -> Manda ao Ollama.
4. **Responde Loop**:
   - Vem chunk do Ollama -> escreve tela.
   - Ollama pede Tool Call? Congela Stream -> Avisa CLI e pede `Permitir?`.
   - Se `Executa Tool`, roda comando de SO, devolve output pra Thread (invisível em tela) e o LLM deduz resultado e segue respondendo o usuário.

## 4. Integrações

- **Ollama HTTP API (`/api/chat`)**: Fetch nativo (`http`/`undici`) em stream. Permite total controle da conexão, timout manual, tratamento rápido do `HTTP 503/404 Model Not Found` com fallback customizado sem overhead.
- **Node `child_process`**: Proxy pros Comandos de shell.
- **Node `fs/promises`**: Manipulação de pastas.

## 5. Tratamento de Erros de Sistema

- **Ollama Offline**: Retém draft local, avisa alerta fatal vermelho e encerra tentativa amigavelmente.
- **Modelo Ausente**: CLI troca pro *Fallback* da tabela map e recomeça roteamento invisível (com aviso amarelo).
- **Subprocess Error (Script Fail)**: Error Trace não mata a sessão do Node. O STDERR volta pra Thread da IA no formato `System Report: Command X crashed: [LOG]`, permitindo reparo.
- **Context Limit Over-Flow (`> ~200k tokens`)**: Auto-compressão roda sobre a database da sessão. A bagagem morta do chat é transformada em um Abstract paragraph, mas todo `docs/` e `código` é lido fresco, logo zero amnesia estrutural da IA.

## 6. Escalabilidade (MVP)
Desenho Single-Directory e Single-Instance. Para o MVP, não há necessidade de assincronismo via jobs workers soltos; threads rodarão no ciclo natural do evento bloqueante do input. Limitação restrita pela Memória (RAM + VRAM) do Docker host de IAs.
