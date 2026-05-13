# Toug CLI

Assistente de desenvolvimento por IA no terminal, com pipeline disciplinada, provedores local/cloud e controle humano sobre a execucao.

O Toug CLI foi feito para apoiar projetos de software seguindo uma pipeline fixa baseada em agentes: Discovery, Architect, Executor, Reviewer, Orchestrator e Project Research. O estado real do projeto fica em `docs/`, e a conversa no terminal serve como interface de trabalho.

---

## Features

- **Pipeline forcada**: state machine com papeis claros para descoberta, arquitetura, execucao, revisao e orquestracao.
- **Provedores Ollama e Gemini**: use modelos locais via Ollama/Docker ou Gemini via API key.
- **Fallback multi-modelo e multi-key**: no modo Gemini, o CLI tenta todos os modelos da key atual antes de trocar para a proxima key; ao esgotar tudo, cai para Ollama local.
- **Modelos internos por agente**: o usuario nao precisa escolher modelos por papel; o `modelRegistry` define a ordem de fallback.
- **Tool calling**: execucao de comandos, leitura e escrita de arquivos via ferramentas controladas.
- **Approval gates**: comandos e gravacoes pedem aprovacao, a menos que `autoApproveMode` esteja ativo.
- **Menus interativos**: navegacao por setas, Enter para selecionar e Ctrl+C para voltar/cancelar.
- **Menu principal**: iniciar nova conversa, abrir configuracoes ou carregar sessoes anteriores.
- **Comando `/menu`**: volta ao menu principal durante uma conversa.
- **Configuracoes pelo terminal**: trocar provider, endpoint Ollama, auto-approve, thinking e API keys Gemini.
- **Gerenciamento de API keys Gemini**: adicionar, apagar, renomear apelidos e alterar ordem de prioridade.
- **Sessoes persistentes**: cada sessao fica em uma pasta propria com `session.json`.
- **Historico paginado**: `/sessoes` mostra 5 sessoes por pagina, com total e pagina atual.
- **Mencoes `@`**: use `@arquivo` ou `@/pasta` para injetar conteudo no prompt.
- **Thinking display**: exibe pensamento quando o provider/modelo retorna esse conteudo. No Gemini, o CLI solicita pensamentos, mas a API so exibe se retornar partes `thought`.
- **Ctrl+C seguro**: durante geracao, interrompe o stream sem fechar o CLI.

---

## Requisitos

- Node.js 18+
- Git
- Docker com Docker Compose, se for usar Ollama local
- API key Gemini, se for usar Gemini cloud

---

## Instalacao

Clone o repositorio:

```bash
git clone https://github.com/T0ug/Toug-CLI.git
cd Toug-CLI
```

Instale dependencias e compile:

```bash
npm install
npm run build
```

Para usar Ollama via Docker:

```bash
cd docker
docker-compose up -d
```

Baixe os modelos locais:

```cmd
cd docker
pull_models.bat
```

Em Linux/macOS:

```bash
cd docker
chmod +x pull_models.sh
./pull_models.sh
```

Execute:

```bash
npm run start
```

---

## Configuracao

Na primeira execucao, o CLI cria:

```text
~/.toug-cli/toug.config.json
```

Exemplo:

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
        "key": "SUA_API_KEY",
        "alias": "Principal"
      },
      {
        "key": "OUTRA_API_KEY",
        "alias": "Reserva"
      }
    ]
  },
  "autoApproveMode": false,
  "showThinking": true
}
```

Use `/config` para alterar:

- provider padrao: Ollama ou Gemini;
- endpoint do Ollama;
- API keys Gemini;
- apelidos das keys;
- prioridade das keys;
- auto-approve;
- exibicao de pensamento da IA.

A ordem em `gemini.apiKeys` define a prioridade das keys no fallback.

---

## Uso

Ao iniciar, o CLI mostra o menu principal:

```text
Menu principal
> Iniciar nova conversa
  Configuracoes
  Sessoes anteriores
```

Durante uma conversa:

| Comando | Descricao |
| --- | --- |
| `/menu` | Volta ao menu principal |
| `/config` | Abre configuracoes |
| `/sessoes` | Lista sessoes anteriores |
| `/exit` | Salva e encerra |
| `? pergunta` | Usa rota rapida para tarefa simples |
| `@arquivo` | Injeta um arquivo no contexto |
| `@/pasta` | Injeta arquivos de uma pasta no contexto |
| `Ctrl+C` | Interrompe a geracao atual |

---

## Sessoes

As sessoes ficam em:

```text
~/.toug-cli/sessions/<hash-do-projeto>/<session_id>/session.json
```

O comando `/sessoes`:

- lista sessoes do projeto atual;
- mostra 5 por pagina;
- informa pagina atual e total;
- permite carregar uma sessao;
- permite apagar uma sessao.

Arquivos antigos de sessao em formato JSON solto sao migrados em modo best-effort quando o CLI acessa as sessoes do projeto.

---

## Fallback

No modo Gemini, a ordem e:

```text
Key atual + modelo 1
Key atual + modelo 2
Key atual + modelo 3
Proxima key + modelo 1
Proxima key + modelo 2
Proxima key + modelo 3
Ollama local
```

Exemplo para o agente Executor:

```text
gemini-2.5-pro
gemini-2.5-flash
gemini-2.5-flash-lite
qwen3:14b
qwen3:8b
```

---

## Estrutura

```text
src/
  agents/      definicoes de agentes e registro de modelos
  cli/         interface de terminal
  data/        configuracoes e sessoes
  engine/      pipeline, tools e deteccao de projeto
  providers/   Ollama e Gemini
  index.ts     entrada principal

docs/
  project_status.md
  handoff.md
  tasks.md
  decision_log.md

docker/
  docker-compose.yml
  pull_models.bat
  pull_models.sh
```

---

## Desenvolvimento

Compilar:

```bash
npm run build
```

Rodar:

```bash
npm run start
```

Em instalacoes dentro de `C:\Program Files`, o build pode precisar de permissao elevada para escrever em `dist/`.

---

## Licenca

MIT

---

## Autor

T0ug - [github.com/T0ug](https://github.com/T0ug)
