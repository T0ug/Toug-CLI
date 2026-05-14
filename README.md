# Toug CLI

Assistente de desenvolvimento por IA no terminal, com pipeline disciplinada, provedores local/cloud, sessoes persistentes, terminal externo observavel e controle humano sobre comandos e escrita de arquivos.

O Toug CLI foi criado para trabalhar em projetos de software sem depender apenas da conversa do chat. O estado real do projeto fica em `docs/`, a pipeline vive em `.agents/`, e a interface de trabalho e o terminal. A IA pode pesquisar, arquitetar, executar e revisar, mas sempre dentro de papeis definidos e com ferramentas controladas.

Versao atual do projeto: `1.1.16`.

Estado atual: **Fase 15 concluida e validada sem ressalvas pelo owner em 2026-05-14**.

---

## O que o Toug CLI faz

O Toug CLI e um CLI agentico para desenvolvimento assistido por IA. Ele combina:

- pipeline fixa com agentes especializados;
- estado persistido por projeto e por sessao;
- provedores Gemini e Ollama;
- fallback global de modelos;
- leitura e escrita de arquivos com aprovacao;
- execucao de comandos em terminal PowerShell persistente;
- log bruto de terminal por sessao;
- mencoes de arquivos e do terminal;
- menus interativos e configuracao global.

A ideia central e simples: a IA ajuda, mas o projeto nao vira uma conversa solta. O CLI mantem disciplina de fluxo, artefatos, estado e revisao.

---

## Estado atual

A Fase 15 esta validada sem ressalvas. Isso significa que o sistema atual ja inclui:

- terminal externo persistente por sessao;
- abertura manual com `/terminal`;
- abertura automatica no primeiro comando executado pela IA;
- execucao de comandos da IA sempre no mesmo terminal da sessao;
- log persistente em arquivo por sessao;
- retorno de `run_command` baseado no log real, sem mensagem sintetica de sucesso;
- leitura de terminal com `@terminal`;
- leitura parcial com `@terminal:N`;
- comando `/help`;
- comando `/status`;
- fallback global de modelos para todos os agentes;
- bloqueio de transicoes de pipeline iniciadas pelo modelo;
- isolamento de `@terminal`, para que a IA receba o log e nao o texto literal da mencao;
- tolerancia a locks transitorios de `terminal.log` no Windows.

Pendencias atuais registradas em `docs/`:

- push final para GitHub;
- publicacao npm opcional e manual pelo owner.

---

## Conceitos principais

### Pipeline

O Toug CLI trabalha com uma pipeline fixa. Cada estado tem uma responsabilidade propria:

| Estado | Papel |
| --- | --- |
| `IDLE` | Estado neutro, aguardando direcao |
| `PROJECT_RESEARCH` | Entender um projeto existente a partir de arquivos e docs |
| `DISCOVERY` | Clarificar intencao, escopo e criterios |
| `ARCHITECT` | Desenhar arquitetura e plano tecnico |
| `EXECUTING` | Implementar uma task definida |
| `REVIEW` | Validar entrega, evidencias e riscos |
| `ORCHESTRATING` | Analisar estado e sugerir proximo passo |

O estado da pipeline nao deve ser decidido livremente pelo modelo. O CLI responde `/status` e perguntas naturais sobre o estado atual diretamente, e bloqueia tentativas do modelo de transicionar a pipeline por conta propria.

### Docs como fonte de verdade

O estado do projeto deve ser lido de `docs/`, nao da memoria do chat.

Arquivos centrais:

```text
docs/project_status.md
docs/handoff.md
docs/tasks.md
docs/decision_log.md
```

Em projetos com `AGENTS.md`, as regras locais tambem devem ser obedecidas. No proprio Toug CLI, por exemplo, antes de agir e obrigatorio ler os quatro arquivos acima.

### Agentes

Os agentes vivem em `.agents/` e representam papeis da pipeline:

- `Orchestrator`: analisa estado e sugere proximo passo;
- `Discovery`: clarifica intencao;
- `Project Research`: reconstrui contexto de projeto existente;
- `Architect`: define arquitetura;
- `Executor`: implementa tasks;
- `Reviewer`: valida entrega.

O usuario nao precisa escolher modelo por agente. A ordem de fallback e unica para todos.

---

## Recursos

- **Pipeline disciplinada**: state machine com papeis claros.
- **Gemini e Ollama**: cloud via Gemini ou local via Ollama.
- **Fallback global**: todos os agentes usam a mesma ordem de modelos, agora priorizando Gemini 3.
- **Fallback transparente**: quando uma rota falha e outra responde, o CLI informa qual modelo e key deram certo.
- **Fallback multi-key**: no Gemini, a ordem das API keys cadastradas define prioridade.
- **Terminal persistente**: comandos rodam em uma janela PowerShell externa por sessao.
- **Preferencia por Windows Terminal**: no Windows, quando iniciado pelo `cmd.exe` classico, o Toug pode relancar a si mesmo no Windows Terminal.
- **Log bruto de terminal**: tudo que acontece no terminal da sessao e salvo em `terminal.log`.
- **`@terminal`**: anexa o log bruto do terminal ao contexto da IA.
- **`@terminal:N`**: anexa apenas as ultimas N linhas.
- **`/terminal`**: abre ou reabre o terminal persistente da sessao.
- **`/status`**: mostra estado, agente, provider, modelo e alias da key ativa.
- **`/help`**: lista comandos e mencoes suportados.
- **Sessoes persistentes**: historico por projeto em `~/.toug-cli/sessions`.
- **Mencoes de arquivos**: `@arquivo` injeta conteudo no prompt.
- **Menus interativos**: navegacao por setas e Enter.
- **Config global**: provider, endpoint, keys, aliases, auto-approve e thinking.
- **Thinking display**: exibe pensamento quando o provider retorna partes de pensamento.
- **Approval gates**: comandos e escrita de arquivos pedem aprovacao por padrao.
- **Ctrl+C seguro**: interrompe streaming sem derrubar o CLI.

---

## Requisitos

- Node.js 18 ou superior;
- npm;
- Git, recomendado;
- Windows PowerShell, para o terminal persistente no Windows;
- Windows Terminal (`wt.exe`), recomendado no Windows;
- Docker e Docker Compose, se for usar Ollama via Docker;
- API key Gemini, se for usar Gemini cloud.

O CLI tambem pode usar Ollama em outro servidor, desde que o endpoint esteja configurado.

---

## Windows Terminal

No Windows, o Toug funciona melhor no Windows Terminal.

Quando o comando `toug` e executado em um console Windows interativo fora do Windows Terminal e o Windows Terminal ja esta instalado, o CLI pergunta:

```text
O Toug funciona melhor em Windows Terminal, aceita prosseguir para ele?
```

Opcoes:

- `Sim`: abre uma nova janela/aba do Windows Terminal executando o mesmo comando `toug` e encerra o processo atual.
- `Nao`: encerra o processo atual.
- `Nao perguntar novamente`: pede uma confirmacao extra:

```text
Selecionando essa opcao voce concorda em sempre executar por padrao o comando Toug pelo Windows Terminal?
```

Se confirmado, o Toug grava uma preferencia interna e, nas proximas execucoes fora do Windows Terminal, relanca automaticamente no Windows Terminal.

Quando o Windows Terminal nao esta instalado, o CLI pergunta:

```text
O Toug funciona melhor em Windows Terminal, gostaria de instala-lo para melhor funcionamento e uso?
```

Se confirmado, o Toug executa:

```bash
winget install --id Microsoft.WindowsTerminal -e --accept-package-agreements --accept-source-agreements
```

Apos instalacao bem-sucedida, a preferencia interna de abrir pelo Windows Terminal e ativada automaticamente.

Essa preferencia nao aparece no `/config`. O fluxo nao roda durante `npm run start`, para nao atrapalhar desenvolvimento local.

---

## Instalacao

### Via npm global

```bash
npm i -g toug-cli@latest
```

Depois execute:

```bash
toug
```

### A partir do repositorio

```bash
git clone https://github.com/T0ug/Toug-CLI.git
cd Toug-CLI
npm install
npm run build
npm run start
```

Para instalar globalmente a partir do clone local:

```bash
npm install -g .
toug
```

Em instalacoes dentro de `C:\Program Files`, `npm run build` pode exigir terminal com permissao administrativa para escrever em `dist/`.

---

## Configuracao inicial

Na primeira execucao, o Toug CLI cria a configuracao global em:

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

- provider ativo: Gemini ou Ollama;
- endpoint do Ollama;
- API keys Gemini;
- apelidos das API keys;
- ordem de prioridade das API keys;
- auto-approve;
- exibicao de pensamento.

---

## Usando Gemini

1. Execute `toug`.
2. Abra `/config`.
3. Escolha Gemini como provider.
4. Cadastre uma ou mais API keys.
5. Defina apelidos para identificar cada key no terminal.
6. Ajuste a ordem das keys se quiser controlar a prioridade.

Durante o uso, o Toug mostra o provider, o modelo e, quando aplicavel, o apelido da key ativa.

---

## Usando Ollama

Suba o Ollama localmente ou via Docker.

Com Docker:

```bash
cd docker
docker-compose up -d
```

Baixe os modelos locais no Windows:

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

Depois configure o endpoint no `/config`, por exemplo:

```text
http://localhost:11434
```

Modelos Ollama usados no fallback atual:

- `qwen3:14b`;
- `qwen3:8b`.

---

## Fallback de modelos

A ordem de fallback e global para todos os agentes:

```text
1. gemini-3.1-pro-preview
2. gemini-3-flash-preview
3. gemini-2.5-pro
4. gemini-3.1-flash-lite
5. gemini-2.5-flash
6. gemini-2.5-flash-lite
7. gemini-2.0-flash
8. gemini-2.0-flash-lite
9. qwen3:14b
10. qwen3:8b
```

Quando o provider ativo e Gemini, o CLI tenta os modelos Gemini seguindo a ordem acima para a key atual. Ao esgotar as rotas disponiveis, passa para a proxima key cadastrada. Se nao houver rota Gemini utilizavel, o fallback final pode cair para Ollama, quando configurado.

Quando o provider ativo e Ollama, o CLI usa apenas as rotas Ollama disponiveis.

Quando uma rota falha por limite/cota e outra rota gera resposta, o CLI imprime a rota que efetivamente funcionou:

```text
[Fallback] Rota bem-sucedida: Gemini (Model: gemini-3-flash-preview, Key: Principal).
```

Para fallback local:

```text
[Fallback] Rota bem-sucedida: Ollama (Model: qwen3:14b).
```

Observacao sobre nomes comerciais e IDs de API:

- Gemini 3.1 Pro usa o ID `gemini-3.1-pro-preview`;
- Gemini 3 Flash usa o ID `gemini-3-flash-preview`;
- Gemini 3.1 Flash-Lite usa o ID `gemini-3.1-flash-lite`.

Se a API key ativa nao tiver acesso ou cota para uma rota, o fallback segue para a proxima.

---

## Como usar no dia a dia

Entre na pasta do projeto e execute:

```bash
toug
```

O CLI detecta o projeto atual pelo diretorio de execucao. Ao iniciar, ele mostra o menu principal:

```text
Menu principal
> Iniciar nova conversa
  Configuracoes
  Sessoes anteriores
```

Fluxos comuns:

- Para analisar um projeto existente, inicie uma conversa e explique o objetivo.
- Para trabalhar seguindo a pipeline, mantenha `docs/` atualizado.
- Para pedir uma acao pequena, use linguagem natural.
- Para anexar um arquivo, mencione `@caminho/do/arquivo`.
- Para ver o terminal persistente, use `/terminal`.
- Para pedir que a IA leia o terminal, use `@terminal`.
- Para saber o estado atual da pipeline, use `/status`.

---

## Comandos do REPL

| Comando | Descricao |
| --- | --- |
| `/exit` | Salva a sessao atual e encerra o CLI |
| `/menu` | Volta ao menu principal |
| `/config` | Abre configuracoes globais |
| `/sessoes` | Lista, carrega ou apaga sessoes anteriores |
| `/terminal` | Abre ou reabre o terminal persistente da sessao atual |
| `/status` | Mostra estado da pipeline, agente, provider, modelo e key ativa |
| `/help` | Mostra ajuda dentro do CLI |
| `?pergunta` | Executa uma pergunta simples em modo rapido |
| `@arquivo` | Anexa o conteudo de um arquivo ao prompt |
| `@terminal` | Anexa o log bruto inteiro do terminal da sessao |
| `@terminal:N` | Anexa as ultimas N linhas do log bruto do terminal |
| `Ctrl+C` | Interrompe a geracao atual sem encerrar o CLI |

Exemplos:

```text
@README.md resuma o projeto
```

```text
@terminal o que aconteceu no terminal?
```

```text
@terminal:40 veja as ultimas linhas e me diga se o build falhou
```

```text
/status
```

---

## Terminal persistente

A partir da Fase 15, comandos executados pela IA nao dependem mais de uma execucao isolada que pode perder output. O Toug usa um terminal PowerShell persistente por sessao.

Comportamento:

- `/terminal` abre a janela do terminal da sessao;
- o primeiro comando da IA tambem abre o terminal automaticamente;
- todos os comandos da IA rodam no mesmo terminal da sessao;
- o diretorio inicial e o diretorio onde o `toug` foi iniciado;
- o log e salvo em tempo real;
- o retorno da ferramenta `run_command` vem do log real;
- o CLI nao sintetiza mais "comando executado com sucesso" sem output.

No Windows, o CLI tenta abrir via `wt.exe`. Se o Windows Terminal nao estiver disponivel, tenta fallback visual via `cmd start`.

### Onde ficam os logs

Os logs ficam dentro da pasta da sessao:

```text
~/.toug-cli/sessions/<hash-do-projeto>/<session_id>/terminal/terminal.log
```

Arquivos relacionados ao terminal:

```text
terminal.log       log bruto da janela PowerShell
commands.jsonl     fila de comandos enviada ao runner
terminal-state.json estado do terminal da sessao
runner.ps1         script PowerShell usado pelo runner
```

### `@terminal`

`@terminal` e um gatilho do CLI. A IA nao precisa receber literalmente a palavra `@terminal`; ela recebe o conteudo do log anexado.

Isso evita confusao: quando voce escreve:

```text
O que aconteceu agora? @terminal
```

o modelo recebe a pergunta mais o log do terminal. Nessa rodada, ferramentas sao bloqueadas salvo se o usuario pedir explicitamente uma nova acao. O objetivo e fazer a IA observar o terminal, nao sair executando comandos novos.

### Log bruto e privacidade

O log de terminal e bruto. O CLI nao faz redaction automatica.

Se voce usa provider cloud, como Gemini, qualquer conteudo anexado por `@terminal` pode ser enviado ao provider. Evite anexar logs com secrets, tokens ou variaveis sensiveis quando estiver usando provider cloud.

---

## Sessoes

As sessoes ficam em:

```text
~/.toug-cli/sessions/<hash-do-projeto>/<session_id>/session.json
```

Cada projeto possui um hash proprio baseado no diretorio. Isso evita misturar historicos de projetos diferentes.

O comando `/sessoes` permite:

- listar sessoes anteriores do projeto atual;
- navegar por paginas;
- carregar uma sessao;
- apagar uma sessao.

Ao carregar uma sessao antiga, o log antigo continua acessivel. O terminal vivo nao e restaurado como processo do passado; se necessario, o CLI reabre uma nova janela para aquela sessao quando voce usar `/terminal` ou quando a IA executar um comando.

---

## Ferramentas da IA

O Toug CLI expoe ferramentas controladas ao modelo:

- leitura de arquivos;
- escrita de arquivos;
- execucao de comandos;
- function calling nativo no Gemini;
- tool calling em formato XML para rotas compativeis.

Por padrao, acoes sensiveis pedem permissao:

- executar comando;
- gravar arquivo.

Com `autoApproveMode` ativado, o CLI reduz confirmacoes manuais. Use com cuidado, especialmente em projetos reais.

---

## Estrutura do projeto

```text
src/
  agents/
    agentLoader.ts        prompts, instrucoes e ferramentas disponiveis
    modelRegistry.ts      ordem global de fallback de modelos

  cli/
    selectMenu.ts         menus interativos com setas

  data/
    configManager.ts      configuracao global
    sessionManager.ts     persistencia de sessoes

  engine/
    pipelineEngine.ts     state machine, streaming, fallback e tools
    terminalSessionManager.ts terminal persistente, fila e logs
    toolRunner.ts         execucao de comandos via terminal persistente
    artifactManager.ts    leitura/escrita controlada de artefatos
    projectDetector.ts    deteccao de projeto

  providers/
    geminiProvider.ts     provider Gemini via @google/genai
    ollamaProvider.ts     provider Ollama

  index.ts                entrada do CLI e REPL

docs/
  project_status.md       estado oficial do projeto
  handoff.md              handoff da fase/task atual
  tasks.md                fonte de verdade das tasks
  decision_log.md         decisoes arquiteturais e operacionais
  review_report.md        validacoes e evidencias

.agents/
  agents/                 definicoes dos agentes
  skills/                 skills da pipeline
  workflows/              workflows obrigatorios

docker/
  docker-compose.yml
  pull_models.bat
  pull_models.sh
```

---

## Desenvolvimento

Instalar dependencias:

```bash
npm install
```

Compilar TypeScript:

```bash
npm run build
```

Executar build local:

```bash
npm run start
```

Executar como CLI global a partir do repositorio:

```bash
npm install -g .
toug
```

Verificar versao instalada globalmente:

```bash
npm list -g toug-cli --depth=0
```

---

## Publicacao

O pacote publica apenas:

```text
dist/
README.md
```

Fluxo tipico:

```bash
npm run build
npm version patch --no-git-tag-version
npm publish
```

A publicacao npm permanece uma acao manual do owner.

---

## Solucao de problemas

### `/terminal` nao abriu janela

- Confirme que esta usando uma versao atual (`1.1.16` ou superior).
- Feche e reabra o processo `toug` apos atualizar o pacote global.
- No Windows, instale ou habilite Windows Terminal (`wt.exe`).
- Se `wt.exe` nao existir, o CLI tenta fallback via `cmd start`.

### A IA nao viu o que aconteceu no terminal

Use:

```text
@terminal
```

ou, para reduzir contexto:

```text
@terminal:50
```

### O log esta grande demais

Prefira `@terminal:N`, por exemplo:

```text
@terminal:80
```

### O CLI respondeu sobre estado da pipeline de forma estranha

Use:

```text
/status
```

Perguntas naturais sobre o estado atual tambem sao interceptadas pelo CLI, mas `/status` e o caminho mais direto.

### `git status` falha com `dubious ownership`

Em diretorios como `C:\Program Files`, o Git pode bloquear o repositorio. Configure `safe.directory` para esse caminho se quiser usar comandos Git ali.

### `npm run build` falha dentro de `C:\Program Files`

Execute o terminal com permissao administrativa ou mova o clone para uma pasta de usuario.

---

## Seguranca e limites

- O Toug CLI pode executar comandos e escrever arquivos quando aprovado.
- Revise comandos antes de permitir execucao.
- Logs de terminal sao brutos e podem conter dados sensiveis.
- `@terminal` envia o log anexado para o modelo ativo.
- Em provider cloud, evite anexar secrets.
- `autoApproveMode` deve ser usado apenas quando voce confia no contexto de execucao.
- O CLI ajuda a disciplinar a pipeline, mas nao substitui revisao humana.

---

## Licenca

MIT

---

## Autor

T0ug - [github.com/T0ug](https://github.com/T0ug)
