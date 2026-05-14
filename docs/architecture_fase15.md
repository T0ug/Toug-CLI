# Architecture - Fase 15 - Terminal Persistente, Logs e Fallback Unificado

## Status

Arquitetura proposta.

## Abordagem escolhida

Abordagem A: PowerShell persistente por sessao com fila de comandos em arquivo.

## Justificativa

Esta abordagem atende aos requisitos confirmados da Fase 15:

- comandos da IA rodam sempre no mesmo terminal persistente;
- estado vivo como `cd`, variaveis e processos permanece enquanto o terminal estiver aberto;
- usuario e IA passam a observar o mesmo log persistente;
- `@terminal` e `@terminal:N` podem ler uma fonte de verdade unica;
- sessoes antigas mantem acesso ao log sem exigir restauracao do estado vivo do PowerShell.

## Estrutura geral

A Fase 15 deve introduzir uma camada dedicada para terminal persistente, separada do `PipelineEngine`, do `sessionManager` e do parser de mencoes.

### Camadas

- CLI interativo (`src/index.ts`)
  - Recebe comandos internos do usuario.
  - Adiciona `/terminal` e `/help`.
  - Expande mencoes `@terminal` e `@terminal:N`.
  - Continua delegando prompts normais ao `PipelineEngine`.

- Pipeline (`src/engine/pipelineEngine.ts`)
  - Continua controlando agentes, tools e historico.
  - Ao interceptar `run_command`, delega a execucao ao terminal persistente.
  - Salva no historico da IA apenas o contrato novo:
    - `Output do comando executado:`
    - trecho do log real produzido pelo terminal.

- Terminal persistente (`src/engine/terminalSessionManager.ts`, novo modulo)
  - Resolve a pasta de terminal da sessao atual.
  - Abre ou reabre a janela PowerShell da sessao.
  - Mantem uma fila de comandos.
  - Lanca um runner PowerShell dedicado.
  - Le o log para responder `run_command`, `@terminal` e `@terminal:N`.

- Persistencia de sessao (`src/data/sessionManager.ts`)
  - Continua sendo a fonte de verdade para sessoes.
  - Deve expor ou permitir resolver a pasta da sessao ativa.
  - A pasta da sessao passa a conter tambem os artefatos de terminal.

- Registry/fallback de modelos (`src/agents/modelRegistry.ts` e `PipelineEngine`)
  - Passa a usar uma ordem unica para todos os agentes.
  - Gemini e Ollama continuam como providers separados, mas a sequencia logica de fallback deve ser unica:
    1. `gemini-3.1-pro-preview`
    2. `gemini-3-flash-preview`
    3. `gemini-2.5-pro`
    4. `gemini-3.1-flash-lite`
    5. `gemini-2.5-flash`
    6. `gemini-2.5-flash-lite`
    7. `gemini-2.0-flash`
    8. `gemini-2.0-flash-lite`
    9. `qwen3:14b`
    10. `qwen3:8b`

### Artefatos por sessao

Dentro da pasta da sessao atual, a arquitetura deve reservar:

```text
session.json
terminal/
  terminal.log
  commands.queue
  terminal.state.json
  runner.ps1
```

`terminal.log` e a fonte de verdade para a IA e para o usuario.

`commands.queue` e o canal de entrada entre Toug CLI e terminal externo.

`terminal.state.json` guarda metadados operacionais, como `sessionId`, `cwdInicial`, status conhecido, timestamps e identificador do processo quando disponivel.

`runner.ps1` e o script responsavel por executar no PowerShell externo, observar a fila e gravar logs.

### Responsabilidades principais

- O Toug CLI nao deve declarar sucesso de comando sem evidencia no log.
- O terminal externo deve registrar comando, horario e output observavel.
- O `run_command` deve retornar para a IA um bloco baseado em log real.
- O usuario pode abrir o terminal com `/terminal`, mas ele tambem abre automaticamente no primeiro comando da IA.
- Ao carregar sessao antiga, o CLI nao reabre terminal automaticamente; apenas preserva acesso aos logs.
- Ao reabrir terminal de sessao antiga, ele inicia no diretorio inicial da sessao, sem tentar restaurar estado vivo anterior.

## Componentes e contratos

### `sessionManager`

Responsabilidade atual: salvar, carregar, listar e apagar sessoes.

Responsabilidade nova: expor a pasta real da sessao ativa para que outros modulos gravem artefatos auxiliares sem recriar logica de path.

Contrato esperado:

```ts
getActiveSessionInfo(cwd: string): {
  id: string;
  filePath: string;
  sessionDir: string;
  cwd: string;
}
```

Regras:

- `saveSession()` continua criando a sessao quando necessario.
- O terminal persistente nao deve inventar uma pasta paralela de sessao.
- Ao carregar uma sessao por `/sessoes`, a sessao ativa deve apontar para a pasta carregada.
- Ao apagar uma sessao, a pasta `terminal/` deve ser removida junto com `session.json`, pois vive dentro da mesma pasta.

### `terminalSessionManager`

Novo modulo responsavel por todo o ciclo de vida do terminal externo da sessao.

Contrato esperado:

```ts
ensureTerminalOpen(cwd: string): Promise<TerminalSessionInfo>
openTerminal(cwd: string): Promise<TerminalSessionInfo>
executeInTerminal(command: string, cwd: string): Promise<TerminalCommandResult>
readTerminalLog(cwd: string, options?: { tailLines?: number }): string
getTerminalPaths(cwd: string): TerminalPaths
```

Tipos esperados:

```ts
type TerminalPaths = {
  sessionDir: string;
  terminalDir: string;
  logPath: string;
  queuePath: string;
  statePath: string;
  runnerPath: string;
}

type TerminalSessionInfo = {
  sessionId: string;
  cwdInicial: string;
  terminalDir: string;
  logPath: string;
  isOpenKnown: boolean;
}

type TerminalCommandResult = {
  command: string;
  startedAt: string;
  finishedObservationAt: string;
  logExcerpt: string;
}
```

Regras:

- `ensureTerminalOpen()` deve ser usado pelo `run_command`.
- `/terminal` pode chamar `openTerminal()` diretamente.
- `executeInTerminal()` nao retorna sucesso sintetico; retorna apenas trecho de log observado.
- A janela externa deve ser aberta no `cwd` inicial da sessao.
- Falha ao abrir terminal deve gerar erro claro para usuario e IA.

### `runner.ps1`

Script gerado pelo Toug CLI dentro da pasta `terminal/`.

Responsabilidades:

- abrir em PowerShell interativo;
- identificar a janela como terminal do Toug CLI quando possivel;
- iniciar no diretorio inicial da sessao;
- garantir existencia de `terminal.log` e `commands.queue`;
- observar `commands.queue`;
- executar comandos pendentes em ordem;
- gravar no log:
  - horario;
  - prompt/diretorio atual;
  - comando;
  - stdout/stderr observavel;
  - marcador de fim da execucao quando o comando retornar controle;
- permitir que o usuario digite comandos manualmente no mesmo terminal.

Observacao arquitetural:

O runner deve equilibrar dois modos:

- comandos enviados pela IA via fila;
- comandos digitados manualmente pelo usuario.

Como comandos manuais em PowerShell puro nao sao trivialmente interceptados por Node, a arquitetura aceita que o runner use mecanismo PowerShell nativo de transcript ou wrapper de prompt para registrar o que for observavel no terminal.

### `toolRunner`

Responsabilidade atual: executar comandos diretamente via `spawn`.

Responsabilidade nova: deixar de ser o executor final de comandos de usuario/IA e virar uma fachada ou ser substituido pelo `terminalSessionManager`.

Contrato esperado:

```ts
executeShellCommand(command: string, cwd: string): Promise<string>
```

Novo comportamento:

- chama `executeInTerminal(command, cwd)`;
- retorna string no formato:

```text
Output do comando executado:
<trecho do terminal.log>
```

Regras:

- nao detectar `npm run dev` como caso especial de sucesso;
- nao retornar `Comando executado com sucesso (sem output)`;
- nao retornar `Comando de servidor iniciado` sem evidencia no log.

### `PipelineEngine`

Responsabilidade nova:

- passar `cwd` explicitamente para o executor de comandos;
- registrar no historico o novo contrato de output;
- manter o fluxo de aprovacao existente antes de executar comando.

Contrato de historico esperado:

```text
[TOOL RESULT] Output do comando executado:
...
```

### Parser de comandos internos no `index.ts`

Novos comandos:

- `/terminal`
  - abre ou reabre o terminal da sessao atual;
  - nao envia mensagem para IA;
  - imprime caminho do log para o usuario.

- `/help`
  - lista comandos existentes:
    - `/exit`
    - `/menu`
    - `/config`
    - `/sessoes`
    - `/terminal`
    - `/help`
    - `?pergunta`
    - `@arquivo`
    - `@terminal`
    - `@terminal:N`

### Parser de mencoes

Responsabilidade atual: detectar `@arquivo` e anexar conteudo.

Responsabilidade nova:

- tratar `@terminal` antes do parser generico de arquivos;
- tratar `@terminal:N` antes do parser generico de arquivos;
- anexar log bruto, sem redaction.

Contrato esperado:

```text
(Contexto anexado pelo usuario via @terminal)
--- Terminal log ---
...
```

Regras:

- `@terminal` anexa o log inteiro.
- `@terminal:N` anexa as ultimas N linhas.
- Se nao houver log, anexar mensagem clara informando que o terminal ainda nao possui log.
- `@terminal` nao deve entrar no mecanismo de deduplicacao de arquivos; o usuario pode pedir novamente para atualizar o contexto.

### `modelRegistry` e fallback

Responsabilidade nova:

- todos os agentes devem usar a mesma ordem logica de modelos.

Contrato esperado:

```ts
const GLOBAL_FALLBACK_MODELS = [
  { provider: 'gemini', model: 'gemini-3.1-pro-preview' },
  { provider: 'gemini', model: 'gemini-3-flash-preview' },
  { provider: 'gemini', model: 'gemini-2.5-pro' },
  { provider: 'gemini', model: 'gemini-3.1-flash-lite' },
  { provider: 'gemini', model: 'gemini-2.5-flash' },
  { provider: 'gemini', model: 'gemini-2.5-flash-lite' },
  { provider: 'gemini', model: 'gemini-2.0-flash' },
  { provider: 'gemini', model: 'gemini-2.0-flash-lite' },
  { provider: 'ollama', model: 'qwen3:14b' },
  { provider: 'ollama', model: 'qwen3:8b' }
]
```

Regras:

- A ordem independe do agente.
- Modelos Qwen usam o endpoint Ollama configurado.
- A UI de cabecalho deve refletir o modelo atual tentado.
- A transicao Gemini para Ollama deve acontecer apos esgotar modelos Gemini e chaves aplicaveis conforme regra vigente de keys.

## Fluxo de dados

### Fluxo 1 - Primeiro `run_command` da IA

1. Provider gera uma tool `run_command` ou texto XML `<run_command>`.
2. `PipelineEngine` intercepta a tool.
3. `PipelineEngine` aplica o fluxo de aprovacao existente.
4. Se aprovado, `PipelineEngine` chama `executeShellCommand(command, cwd)`.
5. `toolRunner` delega para `terminalSessionManager.executeInTerminal(command, cwd)`.
6. `terminalSessionManager` resolve a sessao ativa via `sessionManager`.
7. Se a pasta `terminal/` nao existir, ela e criada.
8. Se o terminal nao estiver aberto, `ensureTerminalOpen()` cria/atualiza `runner.ps1` e abre a janela PowerShell.
9. `executeInTerminal()` escreve um item de comando em `commands.queue` com:
   - id unico;
   - timestamp;
   - comando;
   - cwd inicial da sessao;
   - marcador de status pendente.
10. `runner.ps1` observa a fila, pega o comando pendente e executa no PowerShell persistente.
11. `runner.ps1` escreve em `terminal.log`:
   - inicio do comando;
   - diretorio atual;
   - comando;
   - output observado;
   - fim do comando quando o prompt retorna.
12. `executeInTerminal()` acompanha o crescimento de `terminal.log` a partir do offset anterior.
13. Quando detectar marcador de fim, timeout de observacao ou erro de terminal, retorna trecho do log.
14. `PipelineEngine` adiciona ao historico:

```text
[TOOL RESULT] Output do comando executado:
<trecho real do terminal.log>
```

15. O loop da IA continua com o resultado real.

### Fluxo 2 - Comando longo ou servidor dev

1. IA envia `npm run dev` ou comando equivalente.
2. O comando entra no mesmo fluxo de fila.
3. `runner.ps1` executa no terminal persistente.
4. Se o comando continuar rodando e nao devolver prompt, o log ainda cresce com stdout/stderr.
5. `executeInTerminal()` deve observar por uma janela curta configurada e retornar o log disponivel, sem declarar sucesso.
6. Retorno esperado:

```text
Output do comando executado:
[timestamp] PS ...> npm run dev
... logs observados ...
[SYSTEM] Comando ainda em execucao no terminal persistente; output acima e o log observado ate agora.
```

7. Se o comando falhar rapido, o trecho retornado contem o erro real, como `Missing script: "dev"`.

Regra critica:

O CLI nunca deve inferir que servidor esta rodando apenas porque o comando foi iniciado.

### Fluxo 3 - `/terminal`

1. Usuario digita `/terminal`.
2. `index.ts` chama `terminalSessionManager.openTerminal(cwd)`.
3. O manager resolve ou cria a sessao ativa.
4. O manager cria a pasta `terminal/` e o `runner.ps1`, se necessario.
5. O manager abre a janela PowerShell externa.
6. O CLI imprime para o usuario:
   - status de abertura;
   - caminho de `terminal.log`.
7. Nenhuma mensagem e enviada para IA.

### Fluxo 4 - Sessao carregada via `/sessoes`

1. Usuario escolhe sessao anterior.
2. `sessionManager.loadSessionFile()` restaura `history`, `state` e arquivo ativo.
3. A pasta da sessao carregada passa a ser a base para `terminal/`.
4. O terminal nao abre automaticamente.
5. `@terminal` pode ler o log antigo se existir.
6. `/terminal` ou `run_command` abre uma nova janela usando o diretorio inicial salvo em `session.json`.
7. O log novo continua sendo anexado ao `terminal.log` da mesma sessao.

### Fluxo 5 - `@terminal`

1. Usuario digita prompt contendo `@terminal`.
2. `index.ts` detecta `@terminal` antes do parser generico de arquivos.
3. `terminalSessionManager.readTerminalLog(cwd)` le o log bruto inteiro.
4. O CLI anexa o conteudo ao prompt enviado para a IA.
5. `@terminal` nao e deduplicado.

Formato anexado:

```text
(Contexto anexado pelo usuario via @terminal)
--- Terminal log ---
<terminal.log bruto>
```

### Fluxo 6 - `@terminal:N`

1. Usuario digita prompt contendo `@terminal:10`, por exemplo.
2. `index.ts` extrai `N`.
3. `terminalSessionManager.readTerminalLog(cwd, { tailLines: N })` retorna as ultimas `N` linhas.
4. O CLI anexa o trecho ao prompt.

Formato anexado:

```text
(Contexto anexado pelo usuario via @terminal:10)
--- Ultimas 10 linhas do terminal log ---
...
```

### Fluxo 7 - Logs novos observados sem comando da IA

Objetivo: dar acesso a IA a comandos digitados manualmente pelo usuario.

Regra arquitetural:

- logs novos nao devem ser enviados continuamente em background;
- antes de cada nova chamada ao modelo, o CLI pode sincronizar um resumo bruto dos logs novos desde o ultimo offset conhecido da sessao, se essa sincronizacao for implementada na task de execucao;
- essa sincronizacao deve ser registrada como contexto de terminal, nao como resultado de comando.

Formato recomendado:

```text
[TERMINAL LOG UPDATE]
<novas linhas desde a ultima sincronizacao>
```

Restricao:

Se essa sincronizacao automatica se mostrar arriscada para contexto/tokens, a implementacao minima aceitavel da Fase 15 continua sendo `@terminal` e `@terminal:N`.

### Fluxo 8 - Fallback unico de modelos

1. `PipelineEngine` solicita a lista global de rotas de modelo.
2. A rota contem pares `{ provider, model }`.
3. Para cada rota Gemini, o engine tenta o modelo com a API key atual.
4. Ao esgotar modelos Gemini da key atual por quota/RESOURCE_EXHAUSTED, avanca para a proxima API key e repete as rotas Gemini.
5. Ao esgotar todas as keys Gemini, avanca para rotas Ollama:
   - `qwen3:14b`;
   - `qwen3:8b`.
6. Rotas Ollama usam o endpoint configurado.
7. Fallback Ollama segue podendo descarregar o modelo anterior antes do proximo, conforme decisao existente.

Regra critica:

Nenhum agente deve receber ordenacao propria de modelos na Fase 15.

## Persistencia

### Local dos dados

Os artefatos de terminal vivem dentro da pasta da sessao ativa:

```text
~/.toug-cli/sessions/<hash-do-projeto>/<session_id>/
  session.json
  terminal/
    terminal.log
    commands.queue
    terminal.state.json
    runner.ps1
```

Essa escolha preserva o principio confirmado: terminal e log sao por sessao, nao por projeto.

### `session.json`

Continua armazenando:

- `id`;
- `cwd`;
- `state`;
- `history`;
- `savedAt`.

Extensao permitida:

```ts
terminal?: {
  logPath?: string;
  lastSyncedOffset?: number;
}
```

Observacao:

A extensao e opcional para manter compatibilidade com sessoes antigas.

### `terminal.log`

Fonte de verdade para outputs de comando e para `@terminal`.

Formato recomendado:

```text
[2026-05-14T18:20:31.123Z] [SESSION] Toug CLI terminal iniciado
[2026-05-14T18:20:31.124Z] [CWD] C:\projeto
[2026-05-14T18:20:40.000Z] [COMMAND:cmd_abc123] PS C:\projeto> npm run dev
[2026-05-14T18:20:40.900Z] [STDOUT:cmd_abc123] ...
[2026-05-14T18:20:41.100Z] [STDERR:cmd_abc123] npm ERR! Missing script: "dev"
[2026-05-14T18:20:41.200Z] [END:cmd_abc123] exitCode=1
```

Para comandos longos que nao retornam prompt dentro da janela de observacao:

```text
[2026-05-14T18:21:03.000Z] [COMMAND:cmd_def456] PS C:\projeto> npm run dev
[2026-05-14T18:21:04.000Z] [STDOUT:cmd_def456] Local: http://localhost:5173/
```

O retorno ao modelo deve incluir o trecho observado e uma nota do CLI de que o comando ainda parece em execucao, sem declarar sucesso.

### `commands.queue`

Canal append-only entre Toug CLI e runner PowerShell.

Formato recomendado: JSON Lines.

Exemplo:

```jsonl
{"id":"cmd_abc123","createdAt":"2026-05-14T18:20:40.000Z","command":"npm run dev","status":"pending"}
```

Regras:

- O Toug CLI apenas adiciona comandos.
- O runner marca progresso em memoria e grava eventos no log.
- Para evitar corrupcao, a task de implementacao deve escolher uma estrategia simples de lock ou escrita atomica.

### `terminal.state.json`

Metadados operacionais.

Campos recomendados:

```json
{
  "sessionId": "session_...",
  "cwdInicial": "C:\\projeto",
  "logPath": "...\\terminal.log",
  "queuePath": "...\\commands.queue",
  "startedAt": "2026-05-14T18:20:31.123Z",
  "lastKnownPid": 1234,
  "lastCommandId": "cmd_abc123",
  "lastObservedLogSize": 2048
}
```

Regras:

- `lastKnownPid` e apenas diagnostico; nao e fonte confiavel absoluta.
- Se o processo antigo nao existir mais, `/terminal` pode abrir outro runner para a mesma sessao.
- Estado vivo nao precisa ser restaurado.

### `runner.ps1`

Arquivo gerado por sessao para evitar depender de instalacao global.

Regras:

- Pode ser recriado a cada abertura para refletir a versao atual do CLI.
- Deve usar paths absolutos para log, fila e cwd inicial.
- Deve registrar qualquer erro fatal no `terminal.log`.

## Tratamento de erros

### Falha ao resolver sessao ativa

Cenario:

- `run_command`, `/terminal` ou `@terminal` e chamado antes de existir uma sessao salva.

Comportamento:

- `sessionManager` deve criar ou materializar uma sessao ativa antes de abrir terminal.
- Se isso falhar, o CLI retorna erro claro:

```text
Output do comando executado:
[TOUG ERROR] Nao foi possivel resolver a sessao ativa para abrir o terminal persistente.
```

### Falha ao abrir PowerShell externo

Cenario:

- Windows bloqueia `Start-Process`;
- PowerShell indisponivel;
- permissao insuficiente.

Comportamento:

- Registrar erro no terminal log se possivel.
- Exibir erro ao usuario.
- Retornar erro ao modelo sem executar comando.
- Nao fazer fallback silencioso para execucao direta antiga, pois isso quebraria o contrato de terminal persistente.

### Runner fechado pelo usuario

Cenario:

- Usuario fecha a janela "Toug-CLI Terminal".

Comportamento:

- O proximo `/terminal` reabre o runner.
- O proximo `run_command` chama `ensureTerminalOpen()` e reabre o runner.
- O log antigo e preservado; novas linhas sao anexadas.
- Estado vivo anterior nao e restaurado.

### Comando rapido com erro

Cenario:

- `npm run dev` retorna `Missing script: "dev"`.

Comportamento:

- O runner registra stderr e fim do comando.
- `executeInTerminal()` retorna o trecho com o erro.
- O historico recebe apenas:

```text
[TOOL RESULT] Output do comando executado:
<log com Missing script>
```

### Comando rapido sem output

Cenario:

- Comando retorna ao prompt sem stdout/stderr, como `Move-Item` bem sucedido.

Comportamento:

- O log ainda deve conter pelo menos:
  - comando;
  - cwd;
  - marcador de fim;
  - exit code quando disponivel.
- O CLI nao deve dizer "sucesso sem output"; deve devolver o log.

Exemplo:

```text
Output do comando executado:
[COMMAND:cmd_x] PS C:\projeto> Move-Item a b
[END:cmd_x] exitCode=0
```

### Comando longo sem fim observado

Cenario:

- Servidor dev continua rodando.

Comportamento:

- `executeInTerminal()` retorna logs observados apos janela curta.
- Adiciona nota:

```text
[TOUG INFO] Comando ainda nao retornou controle ao terminal; trecho acima e o log observado ate agora.
```

### Comando trava sem output

Cenario:

- comando nao termina nem escreve log.

Comportamento:

- Depois da janela de observacao, retornar:

```text
Output do comando executado:
[COMMAND:cmd_x] PS C:\projeto> <comando>
[TOUG INFO] Nenhum novo output observado ate o limite de observacao. O comando pode ainda estar em execucao no terminal persistente.
```

### Fila corrompida

Cenario:

- `commands.queue` fica parcialmente escrito ou invalido.

Comportamento:

- Runner deve ignorar linha invalida e registrar `[TOUG ERROR]`.
- Toug CLI deve continuar podendo adicionar novos comandos.
- Implementacao deve preferir JSON Lines para isolar falhas por linha.

### Log inexistente em `@terminal`

Cenario:

- Usuario menciona `@terminal` antes de abrir terminal ou executar comando.

Comportamento:

```text
(Contexto anexado pelo usuario via @terminal)
--- Terminal log ---
[TOUG INFO] Nenhum log de terminal existe para esta sessao ainda.
```

### Fallback cloud/local

Cenario:

- Gemini atinge quota, erro 429, 503 ou RESOURCE_EXHAUSTED.

Comportamento:

- Tentar proximo modelo Gemini na ordem global.
- Ao esgotar modelos Gemini da key atual, tentar proxima API key.
- Ao esgotar keys Gemini, tentar Qwen via Ollama configurado.
- Se Ollama estiver indisponivel, retornar erro claro e nao esconder falha.

### Limites de tamanho

`@terminal` envia log inteiro por decisao do usuario.

Mesmo assim, para proteger estabilidade do CLI:

- leitura deve ser streaming ou controlada para nao travar arquivos muito grandes;
- `@terminal:N` deve ser o caminho recomendado em logs grandes;
- se o log for grande demais para memoria, o CLI pode retornar erro operacional claro pedindo uso de `@terminal:N`, mas nao deve truncar silenciosamente o log inteiro.

## Validacao

### Validacao estatica

- Confirmar que `toolRunner` nao contem mais mensagens sinteticas:
  - `Comando executado com sucesso (sem output)`;
  - `Comando de servidor iniciado`;
  - deteccao especial por regex de `npm run dev`, `vite` ou `expo start`.
- Confirmar que `modelRegistry` nao possui listas diferentes por agente.
- Confirmar que `@terminal` e tratado antes do parser generico de `@arquivo`.
- Confirmar que `/help` lista todos os comandos existentes.

### Validacao manual obrigatoria

1. Iniciar Toug CLI em uma pasta de teste.
2. Pedir a IA para executar `cd subpasta`.
3. Pedir a IA para executar `Get-Location`.
4. Confirmar que o diretorio persistiu no mesmo terminal.
5. Pedir a IA para executar `npm run dev` em pasta sem script `dev`.
6. Confirmar que a IA recebe `Missing script: "dev"` vindo do log.
7. Executar `/terminal` e confirmar que a janela externa abre.
8. Digitar um comando manual no terminal externo.
9. Usar `@terminal` e confirmar que o log bruto e anexado.
10. Usar `@terminal:10` e confirmar que apenas as ultimas 10 linhas sao anexadas.
11. Fechar a janela externa.
12. Executar novo comando pela IA e confirmar que o terminal reabre e anexa ao mesmo log.
13. Salvar/carregar sessao via `/sessoes`.
14. Confirmar que `@terminal` acessa o log antigo sem abrir terminal automaticamente.
15. Confirmar que `/help` mostra `/exit`, `/menu`, `/config`, `/sessoes`, `/terminal`, `/help`, `?`, `@arquivo`, `@terminal`, `@terminal:N`.

### Validacao de fallback

1. Configurar provider Gemini.
2. Confirmar que o primeiro modelo exibido para qualquer agente e `gemini-3.1-pro-preview`.
3. Simular ou provocar falha de quota em Gemini.
4. Confirmar ordem:
   - `gemini-3.1-pro-preview`;
   - `gemini-3-flash-preview`;
   - `gemini-2.5-pro`;
   - `gemini-3.1-flash-lite`;
   - `gemini-2.5-flash`;
   - `gemini-2.5-flash-lite`;
   - `gemini-2.0-flash`;
   - `gemini-2.0-flash-lite`;
   - `qwen3:14b`;
   - `qwen3:8b`.
5. Confirmar que Qwen usa endpoint Ollama configurado.

## Riscos

### Captura de comandos manuais

PowerShell nao fornece, por padrao, uma API simples para outro processo capturar tudo que o usuario digita manualmente. A implementacao deve avaliar `Start-Transcript`, wrapper de prompt ou outra tecnica PowerShell nativa.

Risco aceito: a primeira implementacao pode capturar outputs observaveis com limitacoes, desde que comandos enviados pela IA sejam registrados de forma confiavel.

### Concorrencia na fila

O Toug CLI e o runner podem acessar `commands.queue` ao mesmo tempo.

Mitigacao:

- usar JSON Lines append-only;
- usar escrita atomica por linha;
- runner ignora linhas invalidas e registra erro.

### Comandos interativos longos

Comandos que entram em modo interativo podem nao devolver marcador de fim.

Mitigacao:

- janela curta de observacao;
- retorno com log parcial;
- nota clara de que o comando segue no terminal persistente.

### Logs grandes

`@terminal` inteiro pode gerar contexto enorme.

Mitigacao:

- `@terminal:N` existe para recortes;
- erro claro se o log for grande demais para leitura segura;
- sem truncamento silencioso.

### Segredos no log

Logs serao enviados brutos por decisao do usuario.

Mitigacao:

- documentar explicitamente no `/help` ou mensagem de `@terminal` que o log e bruto.
- nao implementar redaction nesta fase.

### Portabilidade

Arquitetura e Windows/PowerShell.

Mitigacao:

- isolar runner PowerShell no `terminalSessionManager`;
- futura fase pode adicionar runners por plataforma.

## Divisao recomendada de tasks de implementacao

### Task 028 - Terminal Session Manager e artefatos por sessao

Objetivo:

- expor pasta da sessao ativa no `sessionManager`;
- criar `terminalSessionManager`;
- criar paths e arquivos `terminal/`;
- implementar leitura de log inteiro e tail.

Arquivos esperados:

- `src/data/sessionManager.ts`
- `src/engine/terminalSessionManager.ts`
- `docs/task_028.md`

### Task 029 - Runner PowerShell e execucao via fila

Objetivo:

- gerar `runner.ps1`;
- abrir PowerShell externo;
- implementar `commands.queue`;
- executar comandos da IA no terminal persistente;
- substituir retorno sintetico por `Output do comando executado`.

Arquivos esperados:

- `src/engine/terminalSessionManager.ts`
- `src/engine/toolRunner.ts`
- `src/engine/pipelineEngine.ts`
- `docs/task_029.md`

### Task 030 - `/terminal`, `/help` e `@terminal`

Objetivo:

- adicionar comandos internos `/terminal` e `/help`;
- implementar parser de `@terminal` e `@terminal:N`;
- garantir que mencoes de terminal nao passem pelo parser generico de arquivos.

Arquivos esperados:

- `src/index.ts`
- `src/engine/terminalSessionManager.ts`
- `docs/task_030.md`

### Task 031 - Fallback global de modelos

Objetivo:

- substituir fallback por agente por uma ordem global;
- ajustar `PipelineEngine` para rotas `{ provider, model }`;
- preservar fallback por API key Gemini e fallback final para Ollama.

Arquivos esperados:

- `src/agents/modelRegistry.ts`
- `src/engine/pipelineEngine.ts`
- `docs/task_031.md`

### Task 032 - Validacao integrada e polish

Objetivo:

- executar validacoes manuais e estaticas;
- ajustar mensagens de UX;
- atualizar handoff, status e review.

Arquivos esperados:

- `docs/handoff.md`
- `docs/project_status.md`
- `docs/review_report.md`
- `docs/task_032.md`

## Impacto no sistema

- `toolRunner` deixa de ser executor direto e passa a usar terminal persistente.
- `PipelineEngine` continua dono do fluxo de tool approval e historico.
- `sessionManager` passa a expor metadados da sessao ativa.
- `index.ts` ganha comandos internos e parser especial para terminal.
- `modelRegistry` deixa de variar modelos por agente.

## Decisoes arquiteturais finais

- Terminal e log sao por sessao.
- A fonte de verdade de output e `terminal.log`.
- Comandos da IA entram por fila e rodam no PowerShell persistente.
- O CLI nao declara sucesso sem evidencia no log.
- Logs sao enviados brutos para IA.
- Estado vivo de sessao antiga nao e restaurado.
- Fallback de modelos e global para todos os agentes.
