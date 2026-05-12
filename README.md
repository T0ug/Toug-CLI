# Toug CLI

**Assistente de desenvolvimento AI local com pipeline forçada.**

O Toug CLI é uma ferramenta de terminal que conecta a modelos de IA locais (via Ollama/Docker) para desenvolvimento assistido por inteligência artificial, com um pipeline de execução rigoroso inspirado em metodologias de engenharia de software.

---

## ✨ Features

- **Pipeline Forçada** — State Machine com 6 estados (Discovery → Architect → Executor → Reviewer → Orchestrator → Project Research).
- **Provedores Híbridos (Local/Cloud)** — Roda local via Ollama ou global via Google Gemini, integrando Function Calling nativo e Fallback automático de API Keys.
- **Tool Calling Nativo** — A IA executa comandos shell (`<run_command>`), lê e grava arquivos (`<read_file>`, `<write_file>`).
- **Approval Gates** — Todo comando destrutivo exige aprovação humana antes de executar.
- **Sessões Persistentes** — Snapshot salvo a cada iteração individual na conversa. Você retoma de onde parou infalivelmente.
- **Detecção Inteligente de Projeto** — Inicia em Discovery para novos projetos, Architect/Research para legados baseando-se em `docs/`.
- **Limites de Sandbox e Cancelamento** — Geração abortável via `Ctrl+C` iterativo sem desligar o console. Path traversal e saídas fora do repositório estritamente banidas.
- **Multi-Model por Agente** — Cada etapa assume o modelo local ou cloud otimizado nas configurações.

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

O arquivo de configuração `v2` é criado dinamicamente em `~/.toug-cli/toug.config.json` na primeira execução. A CLI pedirá que você escolha o **Ollama** ou **Gemini** primariamente.

```json
{
  "lastProvider": "gemini",
  "ollama": {
    "endpoint": "http://localhost:11434"
  },
  "gemini": {
    "apiKeys": [
      "SUA_API_KEY_AKI",
      "OUTRA_API_KEY_SECUNDARIA_AKI"
    ]
  },
  "models": {
    "ollama": {
      "discovery": "gemma3:4b",
      "architect": "deepseek-r1:8b",
      "executor": "qwen2.5-coder:7b",
      "reviewer": "deepseek-r1:8b",
      "orchestrator": "qwen3:8b",
      "project_research": "qwen2.5-coder:7b"
    },
    "gemini": {
      "discovery": "gemini-2.5-flash",
      "architect": "gemini-2.5-pro",
      "executor": "gemini-2.5-flash",
      "reviewer": "gemini-2.5-pro",
      "orchestrator": "gemini-2.5-flash",
      "project_research": "gemini-2.5-flash"
    }
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
| `npm run build` | Compila o código TypeScript base |
| `npm run start` | Inicia o CLI interativomente |
| `/config` | Invoca o ConfigWizard e ajusta provedor Global/Ollama/Gemini localmente |
| `/exit` | Encerra a sessão atual (o autosave garantirá a volta intacta) |
| `Ctrl+C` | (Se rodando) Aborta o stream de geração sem matar o processo. |

---

## 📄 Licença

MIT

---

## 👤 Autor

**T0ug** — [github.com/T0ug](https://github.com/T0ug)
