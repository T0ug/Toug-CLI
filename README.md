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
- **Multi-Model por Agente** — O CLI decide qual o melhor modelo interno para cada etapa da pipeline.
- **Fallback Multi-Modelo e Multi-Key** — Cadeia de resiliência automática: troca de modelo Gemini → troca de API key → Ollama como último recurso.
- **Menções `@` de Arquivos e Pastas** — Digite `@arquivo.ts` ou `@/src` no prompt para injetar o conteúdo diretamente no contexto, sem consumo extra de tokens.
- **Gestão de Sessões (`/sessoes`)** — Liste, renomeie e retome qualquer sessão anterior, não apenas a mais recente.
- **Routing Heurístico** — O CLI detecta tarefas simples e sugere usar Ollama local para economizar cota da API.
- **Thinking Display** — Exibe o fluxo de raciocínio da IA antes da resposta final (configurável via `showThinking`).
- **Interface Interativa** — Navegação nativa via menus com setas do teclado para confirmações e opções de sessão.

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

O arquivo de configuração é criado dinamicamente em `~/.toug-cli/toug.config.json` na primeira execução. A CLI pedirá que você escolha o **Ollama** ou **Gemini** primariamente.

```json
{
  "configVersion": 2,
  "lastProvider": "gemini",
  "ollama": {
    "endpoint": "http://localhost:11434"
  },
  "gemini": {
    "apiKeys": [
      {
        "key": "SUA_API_KEY_AKI",
        "alias": "Minha_Key_Principal"
      }
    ]
  },
  "autoApproveMode": false,
  "showThinking": true
}
```

> **Nota:** A partir da versão v2 de configuração, o mapeamento de modelos por agente é gerenciado internamente pelo CLI (`modelRegistry`) com lógica de fallback multi-modelo, não precisando mais ser configurado manualmente.

---

## 🏗️ Arquitetura

```
src/
├── cli/              # Interface de terminal (readline, cores ANSI)
├── agents/           # Definições de agentes e System Prompts
├── engine/           # Pipeline Engine e Tool Runner
├── providers/        # Clientes Ollama e Gemini com eventos normalizados
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

### Fallback de Provedores (modo Gemini)

```
Modelo primário (2.5-pro / 2.5-flash)
    → Próximo modelo Gemini
    → Próxima API Key
    → Ollama local (qwen3:14b → qwen3:8b)
```

---

## 🔧 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Compila o código TypeScript |
| `npm run start` | Inicia o CLI interativamente |
| `/config` | Invoca o ConfigWizard e ajusta provedor, API keys e auto-approve |
| `/sessoes` | Lista, renomeia e retoma sessões anteriores |
| `/exit` | Encerra a sessão atual (o autosave garantirá a volta intacta) |
| `@arquivo` | Injeta o conteúdo de um arquivo no prompt (ex: `@src/index.ts`) |
| `@/pasta` | Injeta recursivamente os arquivos de uma pasta no prompt |
| `Ctrl+C` | (Se rodando) Aborta o stream de geração sem matar o processo |

---

## 📄 Licença

MIT

---

## 👤 Autor

**T0ug** — [github.com/T0ug](https://github.com/T0ug)
