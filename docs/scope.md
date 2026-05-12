# Scope - Toug CLI

## MVP atual concluido

O Toug CLI ja possui:

- CLI em Node.js/TypeScript.
- Pipeline forcada por agentes.
- Integracao local com Ollama/Docker.
- Streaming no terminal.
- Ferramentas por XML para comando, leitura, escrita e transicao de estado.
- Aprovacao humana para comandos.
- Persistencia de sessoes.
- Gestao de artefatos em `docs/`.
- Deteccao de projeto novo/existente.

## Proxima evolucao incluida no escopo

### 1. Provedores globais de IA

- Ao iniciar o CLI, perguntar sempre qual provedor usar.
- Manter Ollama/local como provedor disponivel.
- Adicionar Gemini como provedor disponivel.
- Enter no prompt inicial usa o ultimo provedor salvo.
- Permitir alterar provedor e API keys Gemini pelo comando `/config`.
- Configuracao somente global em `~/.toug-cli`, sem configuracao por projeto.
- Salvar API keys Gemini em texto puro.
- Permitir multiplas API keys Gemini com fallback automatico.

### 2. Modelos por agente definidos pelo CLI

- Remover o arquivo de configuracao do usuario como fonte da verdade para modelo por agente.
- Manter o mapeamento de modelos no codigo/regras versionadas do CLI.
- Usar os modelos Gemini aprovados:
  - `orchestrator`: `gemini-2.5-flash`
  - `discovery`: `gemini-2.5-flash`
  - `project_research`: `gemini-2.5-flash`
  - `architect`: `gemini-2.5-pro`
  - `executor`: `gemini-2.5-pro`
  - `reviewer`: `gemini-2.5-pro`

### 3. Gemini com streaming e function calling

- Usar SDK oficial `@google/genai`.
- Streaming sempre.
- Gemini deve usar Function Calling nativo para ferramentas.
- Ollama/local pode manter XML como compatibilidade.
- Normalizar ambos os transportes para as mesmas ferramentas internas:
  - `run_command`
  - `read_file`
  - `write_file`
- `transition_state` nao e ferramenta publica do modelo; transicoes sao decisao privada do `PipelineController`.

### 4. Seguranca de ferramentas

- Agents operam por padrao somente na pasta onde o CLI foi iniciado.
- Acesso fora da pasta do projeto exige aprovacao explicita, mesmo com auto-approve.
- Se o modelo tentar acessar fora do projeto sem pedido explicito anterior, pedir aprovacao explicando o risco.
- `autoApproveMode` tambem vale para Gemini, mas apenas para acoes nao sensiveis.
- Comandos sensiveis nunca passam por auto-approve:
  - comando fora da pasta do projeto;
  - comandos PowerShell;
  - qualquer acao que exija permissao de administrador.

### 5. Tratamento de erros Gemini

- `400 INVALID_ARGUMENT`: avisar, encerrar sessao de forma controlada, voltar ao terminal Windows, gerar log `.txt` e abrir dialogo/Explorer para salvar.
- `400 FAILED_PRECONDITION`: tentar proxima API key.
- `403 PERMISSION_DENIED`: tentar proxima API key.
- `404 NOT_FOUND`: tentar uma vez novamente; se repetir, avisar e voltar para `Voce:`.
- `429 RESOURCE_EXHAUSTED`: tentar proxima API key.
- `500 INTERNAL`: tentar novamente; se repetir, perguntar se quer reduzir contexto ou cancelar a mensagem anterior.
- `503 UNAVAILABLE`: tentar novamente; se repetir, tentar proxima API key.
- `504 DEADLINE_EXCEEDED`: avisar e voltar para `Voce:`.
- Key vazada/bloqueada: perguntar se remove/desativa da configuracao local.
- Safety/recitation: perguntar se remove/desativa da configuracao local.
- Se todas as API keys falharem, exibir cada API key completa com o motivo da falha.

### 6. Logs fatais e persistencia

- Qualquer erro fatal deve gerar log `.txt`.
- No Windows, abrir dialogo/Explorer para o usuario escolher onde salvar.
- Log fatal inclui historico/contexto da sessao.
- Log fatal pode conter API keys completas.
- Sessao deve ser salva a cada mensagem, nao apenas ao encerrar.

### 7. Interrupcao de geracao

- Suportar `/stop`.
- Suportar `Ctrl+C` para parar apenas a geracao atual.
- Nao encerrar o CLI ao interromper uma geracao.
- Salvar resposta parcial no historico.
- Voltar ao prompt `Voce:` mantendo o mesmo estado da pipeline.

### 8. Pipeline embutida no CLI

- Projetos de usuario nao devem precisar de `.agents/`, `GEMINI.md` ou `PIPELINE_EXAMPLE`.
- Agents, skills, regras, workflows, templates e artefatos-base devem estar embutidos/versionados no CLI.
- Projeto novo cria `docs/` somente apos Discovery + `clarify-intent` e confirmacao explicita.
- Projeto existente com codigo mas sem docs cria `docs/` somente apos Project Research + `research-existing-project` e confirmacao explicita.
- A confirmacao explicita deve ser registrada em `docs/decision_log.md`.

## Restricoes tecnicas

- Linguagem: Node.js / TypeScript.
- OS: Windows apenas nesta etapa.
- Gemini via SDK oficial `@google/genai`.
- Ollama/local continua suportado.
- Configuracao global em `~/.toug-cli`.
- Provedor ativo e global para a sessao inteira.
