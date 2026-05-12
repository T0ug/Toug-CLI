# Architecture - Toug CLI Provider Evolution

## 1. Visao Geral

O Toug CLI continua sendo uma CLI Node.js/TypeScript com pipeline forcada por state machine, mas passa a separar claramente:

- decisao de pipeline;
- execucao de provider;
- chamadas de ferramentas;
- validacao de artefatos;
- persistencia;
- tratamento de erros.

A arquitetura escolhida e a Abordagem 2: **Provider Layer + Tool Dispatcher + Safety Guard**.

Essa abordagem preserva o codigo atual, mas remove responsabilidades demais do `PipelineEngine`. O modelo nao decide quando trocar de agente; transicoes sao decisao deterministica do CLI.

## 2. Camadas

### CLI Layer

Responsavel por interacao com o usuario:

- perguntar provider ao iniciar;
- tratar `/config`;
- tratar `/stop`;
- tratar `Ctrl+C`;
- renderizar chunks no terminal;
- pedir aprovacoes;
- exibir erros e status.

### Pipeline Layer

Responsavel por orquestracao:

- manter o estado atual da pipeline;
- resolver o agent ativo;
- montar contexto;
- chamar provider ativo;
- gravar historico;
- receber tool calls normalizados;
- acionar validacao de artefatos;
- pedir ao `PipelineController` decisao de avanco.

O `PipelineEngine` nao deve executar shell diretamente nem aceitar transicao arbitraria do modelo.

### Pipeline Controller

Novo componente responsavel por regras deterministicas da pipeline:

- criterios de entrada e saida de cada fase;
- artefatos obrigatorios;
- validacao de `handoff.md`;
- confirmacoes obrigatorias;
- transicao automatica de estado;
- feedback ao mesmo agente quando faltam evidencias.

O modelo nao recebe uma ferramenta publica `transition_state`.

### Provider Layer

Responsavel por falar com modelos:

- `OllamaProvider`;
- `GeminiProvider`;
- `ProviderFactory`;
- contrato comum `AIProvider`;
- streaming;
- cancelamento por `AbortSignal`;
- normalizacao de eventos.

### Agent Rules Layer

Responsavel por verdades versionadas do CLI:

- prompts dos agentes;
- skills embutidas;
- workflows;
- templates de artefatos;
- regras da pipeline;
- criterios de saida;
- mapeamento provider + agent -> modelo.

Projetos de usuario nao devem precisar de `.agents`, `GEMINI.md` ou `PIPELINE_EXAMPLE`.

### Tool Layer

Responsavel por ferramentas reais:

- `run_command`;
- `read_file`;
- `write_file`;
- parsing XML para Ollama;
- function calling para Gemini;
- despacho para executor interno comum.

### Safety Layer

Responsavel por classificacao de risco:

- acesso dentro/fora da pasta do projeto;
- comando PowerShell;
- acao com indicio de admin;
- leitura/escrita externa;
- permissao ou bloqueio de auto-approve;
- explicacao de risco ao usuario.

### Persistence Layer

Responsavel por:

- config global em `~/.toug-cli/toug.config.json`;
- sessoes em `~/.toug-cli/sessions`;
- logs fatais em `~/.toug-cli/fatal-logs`;
- artefatos do projeto em `<project-cwd>/docs`.

### Error Handling Layer

Responsavel por:

- matriz de erros Gemini;
- retry;
- fallback entre API keys;
- reducao de contexto;
- cancelamento de mensagem;
- log fatal;
- encerramento controlado.

## 3. Estrutura De Diretorios Proposta

```text
src/
  cli/
    chatInterface.ts
    configFlow.ts
    providerPrompt.ts
  agents/
    agentLoader.ts
    modelRegistry.ts
    artifactRules.ts
    embedded/
      prompts.ts
      skills.ts
      workflows.ts
      templates.ts
  engine/
    pipelineEngine.ts
    pipelineController.ts
    artifactValidator.ts
    providerFactory.ts
  providers/
    types.ts
    ollamaProvider.ts
    geminiProvider.ts
  tools/
    toolContracts.ts
    toolDispatcher.ts
    xmlToolParser.ts
    safetyGuard.ts
  data/
    configManager.ts
    sessionManager.ts
    fatalLogManager.ts
  errors/
    geminiErrorPolicy.ts
```

## 4. Fluxo De Boot

```text
Usuario roda `toug`
  -> ConfigManager carrega/migra config global
  -> CLI pergunta provider
  -> Enter usa ultimo provider salvo
  -> se Gemini sem API key, abre fluxo de configuracao
  -> ProjectDetector analisa cwd
  -> SessionManager oferece restaurar sessao
  -> PipelineController define estado inicial
  -> CLI entra no prompt `Voce:`
```

Estados iniciais:

- projeto com `docs/` validos: `ORCHESTRATING`;
- projeto com codigo sem `docs/`: `PROJECT_RESEARCH`;
- pasta vazia/novo projeto: `DISCOVERY`.

## 5. Fluxo De Mensagem

```text
Usuario envia mensagem
  -> SessionManager salva mensagem
  -> PipelineEngine identifica estado
  -> PipelineController resolve agent ativo
  -> ModelRegistry resolve modelo
  -> AgentRules monta contexto
  -> Provider ativo inicia streaming
  -> CLI imprime text_delta
  -> ToolDispatcher executa tool_call quando houver
  -> ArtifactValidator valida conclusao de fase
  -> PipelineController decide continuar ou avancar
  -> SessionManager salva cada evento relevante
```

## 6. Provedores

### OllamaProvider

- Usa `/api/chat`.
- Mantem streaming JSONL.
- Mantem XML como compatibilidade.
- Usa `XmlToolParser` para detectar ferramentas.
- Emite eventos normalizados.

### GeminiProvider

- Usa SDK oficial `@google/genai`.
- Usa streaming sempre.
- Declara ferramentas por Function Calling.
- Converte function calls para `ToolCall`.
- Usa `GeminiErrorPolicy` para retry/fallback.

Ferramentas declaradas ao Gemini:

- `run_command`;
- `read_file`;
- `write_file`.

`transition_state` nao e ferramenta publica.

## 7. Transicao De Agentes

Transicoes sao privadas do `PipelineController`.

O modelo pode:

- gerar analise;
- criar/editar artefatos;
- produzir handoff;
- responder perguntas;
- pedir ferramentas permitidas.

O modelo nao pode:

- decidir que terminou a propria fase;
- escolher o proximo agente;
- chamar uma ferramenta publica de transicao.

Cada fase possui:

- agent responsavel;
- artefatos obrigatorios;
- handoff obrigatorio quando aplicavel;
- criterios de saida;
- proximo estado determinado pelo CLI.

## 8. Artefatos E Handoff

Todo agent pode criar artefatos. No fluxo principal, conclusao de fase exige artefatos validos.

`handoff.md` e obrigatorio ao concluir fases principais da pipeline.

Campos minimos do handoff:

- task/fase;
- agente responsavel;
- objetivo;
- escopo executado;
- artefatos afetados;
- evidencia;
- pendencias/bloqueios;
- proxima acao sugerida;
- status.

Se o handoff ou artefato obrigatorio estiver invalido:

```text
PipelineController bloqueia transicao
  -> ArtifactValidator gera feedback
  -> feedback entra no historico como system
  -> mesmo agente continua para corrigir
```

## 9. Configuracao

Arquivo global:

```text
~/.toug-cli/toug.config.json
```

Formato v2:

```json
{
  "configVersion": 2,
  "lastProvider": "ollama",
  "ollama": {
    "endpoint": "http://localhost:11434"
  },
  "gemini": {
    "apiKeys": []
  },
  "autoApproveMode": false
}
```

Config nao guarda:

- modelos por agente;
- pipeline customizada;
- configuracao especifica por projeto.

Config guarda:

- ultimo provider;
- endpoint Ollama;
- API keys Gemini em texto puro;
- auto-approve.

## 10. Model Registry

`src/agents/modelRegistry.ts` define modelos por provider/agente.

Gemini:

```text
orchestrator     -> gemini-2.5-flash
discovery        -> gemini-2.5-flash
project_research -> gemini-2.5-flash
architect        -> gemini-2.5-pro
executor         -> gemini-2.5-pro
reviewer         -> gemini-2.5-pro
```

Ollama deve preservar os modelos locais padrao atuais em codigo versionado.

## 11. Sessoes

Diretorio:

```text
~/.toug-cli/sessions/
```

A sessao deve salvar:

- apos mensagem do usuario;
- apos resposta do modelo;
- apos tool result;
- apos interrupcao;
- apos transicao deterministica;
- ao encerrar.

Metadados minimos:

- cwd;
- state;
- provider;
- agentRole;
- model;
- history;
- savedAt;
- interrupted.

## 12. Cancelamento

`/stop` e `Ctrl+C` usam `AbortController`.

Fluxo:

```text
CLI cria AbortController por geracao
  -> signal chega ao provider
  -> /stop ou Ctrl+C chama abort()
  -> resposta parcial e salva
  -> estado permanece igual
  -> prompt volta para `Voce:`
```

## 13. Segurança De Ferramentas

Todo caminho e resolvido contra `projectRoot`.

Se o caminho resolvido estiver dentro do projeto:

- pode ser considerado baixo risco se a tool nao for sensivel.

Se estiver fora:

- nunca usa auto-approve;
- explica risco;
- pede aprovacao explicita.

Comandos sensiveis:

- comando fora da pasta do projeto;
- PowerShell;
- acao com indicio de admin.

Esses comandos sempre exigem aprovacao humana.

## 14. Erros Gemini

`GeminiErrorPolicy` aplica a matriz aprovada:

- `400 INVALID_ARGUMENT`: log fatal e encerra sessao controladamente.
- `400 FAILED_PRECONDITION`: proxima API key.
- `403 PERMISSION_DENIED`: proxima API key.
- `404 NOT_FOUND`: retry uma vez; se repetir, volta para `Voce:`.
- `429 RESOURCE_EXHAUSTED`: proxima API key.
- `500 INTERNAL`: retry uma vez; se repetir, perguntar reducao de contexto ou cancelar.
- `503 UNAVAILABLE`: retry uma vez; se repetir, proxima API key.
- `504 DEADLINE_EXCEEDED`: avisar e voltar para `Voce:`.
- key vazada/bloqueada: perguntar se remove/desativa da config local.
- safety/recitation: perguntar se remove/desativa da config local.

Se todas as keys falharem, exibir cada API key completa e motivo da falha.

## 15. Logs Fatais

Qualquer erro fatal gera log `.txt`.

Conteudo:

- data/hora;
- versao do CLI;
- provider;
- modelo;
- agent;
- state;
- cwd;
- erro bruto;
- acao tomada;
- historico;
- config relevante;
- API keys completas quando presentes.

No Windows, abrir fluxo para o usuario escolher onde salvar. Se cancelar, manter copia em `~/.toug-cli/fatal-logs`.

## 16. Reducao De Contexto

Niveis:

- leve;
- media;
- agressiva.

Nunca remover:

- estado da pipeline;
- agent ativo;
- regras e criterios da fase;
- templates necessarios;
- artefatos relevantes em `docs/`;
- ultimos tool results;
- ultimo handoff;
- confirmacoes.

## 17. Criterios De Aceite

A Fase 12 esta arquiteturalmente correta quando:

- usuario escolhe provider no start;
- `/config` altera provider/API keys;
- Gemini responde com streaming;
- Gemini usa Function Calling;
- Ollama continua funcionando;
- modelos por agente vem do CLI;
- tool calls passam por seguranca;
- transicoes nao sao decididas pelo modelo;
- handoff e validado antes da transicao;
- sessao salva a cada mensagem;
- `/stop` e `Ctrl+C` interrompem sem encerrar CLI;
- erros Gemini seguem a matriz;
- logs fatais sao gerados;
- pipeline nao exige `.agents`, `GEMINI.md` ou `PIPELINE_EXAMPLE` no projeto.
