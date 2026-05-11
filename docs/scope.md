# Scope — Toug CLI (MVP)

## Incluído no MVP

### 1. Inicialização inteligente
- Detectar estado do projeto ao iniciar:
  - Pasta com `docs/` → Project Research + onboard
  - Pasta com código sem `docs/` → inferir estado
  - Pasta vazia → Discovery + Clarify Intent
- Exibir status do projeto no terminal ao carregar

### 2. Chat com streaming
- Interface de chat no terminal
- Respostas em streaming (token a token)
- Cada mensagem exibe: agent + modelo utilizado

### 3. Orquestração multi-modelo
- Orchestrator recebe mensagem e roteia ao agent/modelo correto
- 6 agents com modelos dedicados via Ollama API:
  - Discovery (Gemma 3 27B IT)
  - Architect (Qwen3 30B A3B Thinking)
  - Executor (Qwen3-Coder-Next)
  - Reviewer (DeepSeek-R1-Distill-Qwen-32B)
  - Orchestrator (Qwen3 30B A3B Instruct)
  - Project Research (Qwen3-Coder-Next)
- Fallback automático para modelo alternativo + notificação

### 4. Acesso a comandos do PC
- Comandos de terminal/shell
- Leitura de arquivos e diretórios
- Criação e edição de arquivos
- Execução de scripts
- Aprovação do usuário por padrão
- Modo auto-approve configurável (exceto admin)

### 5. Pipeline enforcement
- Pipeline fixa e embutida no CLI
- Agents forçados a seguir o fluxo definido
- Baseada na estrutura `.agents/` da PIPELINE_EXAMPLE

### 6. Gestão de artefatos
- Leitura e escrita em `docs/` do projeto
- Artefatos: idea.md, scope.md, tasks.md, decision_log.md, handoff.md, project_status.md, etc.

### 7. Persistência de sessões
- Histórico salvo em pasta local (instalação do CLI)
- Retomada de sessões anteriores
- Compressão automática de contexto a ~200k tokens

### 8. Configuração
- Arquivo `toug.config.json`
- Setup na primeira inicialização

### 9. Distribuição
- npm global: `npm install -g toug-cli`
- Repositório GitHub: "Toug CLI"
- Releases versionadas

## Restrições técnicas

- **Linguagem**: Node.js / TypeScript
- **OS**: Windows apenas (MVP)
- **API**: Ollama API, sem autenticação
- **Rede**: servidor dedicado na rede local
- **Comando**: `toug`
