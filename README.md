# Toug CLI

**Assistente de desenvolvimento AI local com pipeline forçada.**

O Toug CLI é uma ferramenta de terminal que conecta a modelos de IA locais (via Ollama/Docker) para desenvolvimento assistido por inteligência artificial, com um pipeline de execução rigoroso inspirado em metodologias de engenharia de software.

---

## ✨ Features

- **Pipeline Forçada** — State Machine com 6 estados (Discovery → Architect → Executor → Reviewer → Orchestrator → Project Research).
- **LLM 100% Local** — Roda modelos via Ollama em Docker, sem dependência de APIs cloud.
- **Tool Calling Nativo** — A IA executa comandos shell (`<run_command>`), lê e grava arquivos (`<read_file>`, `<write_file>`).
- **Approval Gates** — Todo comando destrutivo exige aprovação humana antes de executar.
- **Sessões Persistentes** — Salva e restaura conversas entre reinicializações.
- **Compressão de Contexto** — Contexto longo é automaticamente comprimido para sessões extensas.
- **Detecção Inteligente de Projeto** — Ao iniciar, detecta se o projeto é novo ou existente e ajusta o estado automaticamente.
- **Multi-Model por Agente** — Cada agente usa o modelo mais adequado (configurável via `toug.config.json`).

---

## 📋 Requisitos

- **Node.js** 18+
- **Docker** com Docker Compose
- **Git**

---

## 🚀 Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/T0ug/Toug-CLI.git
cd Toug-CLI
```

### 2. Instalar dependências e compilar

```bash
npm install
npm run build
```

### 3. Subir o servidor Ollama via Docker

```bash
cd docker
docker-compose up -d
```

### 4. Baixar os modelos

**Windows:**
```cmd
cd docker
pull_models.bat
```

**Linux/Mac:**
```bash
cd docker
chmod +x pull_models.sh
./pull_models.sh
```

### 5. Executar

```bash
npm run start
```

---

## ⚙️ Configuração

O arquivo de configuração é criado automaticamente em `~/.toug-cli/toug.config.json` na primeira execução.

```json
{
  "ollamaEndpoint": "http://localhost:11434",
  "models": {
    "discovery": "gemma3:4b",
    "architect": "deepseek-r1:8b",
    "executor": "qwen2.5-coder:7b",
    "reviewer": "deepseek-r1:8b",
    "orchestrator": "qwen3:8b",
    "project_research": "qwen2.5-coder:7b"
  },
  "autoApproveMode": false
}
```

---

## 🏗️ Arquitetura

```
src/
├── cli/              # Interface de terminal (readline, cores ANSI)
├── agents/           # Definições de agentes e System Prompts
├── engine/           # Pipeline Engine, Ollama Client, Tool Runner
├── data/             # Config Manager e Session Manager
└── index.ts          # Entrypoint principal (REPL Loop)

docker/
├── docker-compose.yml  # Container do Ollama
├── pull_models.bat     # Script de download (Windows)
└── pull_models.sh      # Script de download (Linux/Mac)
```

### Pipeline de Estados

```
IDLE → ORCHESTRATING → DISCOVERY → ARCHITECT → EXECUTING → REVIEW
                ↑                                              |
                └──────────────────────────────────────────────┘
```

---

## 🔧 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Compila o TypeScript |
| `npm run start` | Inicia o CLI interativo |
| `/exit` | Encerra a sessão (auto-save) |

---

## 📄 Licença

MIT

---

## 👤 Autor

**T0ug** — [github.com/T0ug](https://github.com/T0ug)
