# Task

## Identificacao

- ID: 011
- Nome: Fase 12.1 - Base de Providers, Config v2 e Model Registry
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Criar a base estrutural para que o Toug CLI deixe de depender de modelos definidos no arquivo de configuracao do usuario e passe a operar com providers globais, config v2 e mapeamento de modelos versionado no CLI.

Esta task prepara o terreno para Gemini, mas nao precisa implementar chamadas reais ao SDK Gemini ainda.

---

## Contexto

Discovery aprovou a Fase 12 para suportar provedores globais Ollama/local e Gemini.

Architect definiu a Abordagem 2: Provider Layer + Tool Dispatcher + Safety Guard.

A arquitetura exige que:

- modelos por agente fiquem no codigo do CLI;
- config global guarde apenas provider, endpoint, API keys e auto-approve;
- `PipelineEngine` use uma abstracao comum de provider;
- transicao de agentes nao seja ferramenta publica do modelo;
- Gemini futuramente use Function Calling apenas para ferramentas operacionais.

---

## Entradas

- `docs/architecture.md`
- `docs/api_contracts.md`
- `docs/scope.md`
- `docs/decision_log.md`
- `docs/tasks.md`
- Codigo atual em `src/engine/pipelineEngine.ts`
- Codigo atual em `src/engine/ollamaClient.ts`
- Codigo atual em `src/data/configManager.ts`
- Codigo atual em `src/agents/agentLoader.ts`
- Codigo atual em `src/agents/types.ts`

---

## Escopo

- Criar tipos base de provider conforme `docs/api_contracts.md`.
- Criar `src/agents/modelRegistry.ts` com mapeamento fixo de modelos por provider/agente.
- Migrar `configManager` para formato v2:
  - `configVersion`;
  - `lastProvider`;
  - `ollama.endpoint`;
  - `gemini.apiKeys`;
  - `autoApproveMode`.
- Implementar migracao da config antiga para v2.
- Criar base de `ProviderFactory`.
- Adaptar o fluxo atual para continuar usando Ollama por meio da nova abstracao, preservando comportamento existente.
- Garantir que modelos nao sejam mais lidos da config do usuario.
- Atualizar os tipos necessarios para provider/model registry.
- Manter build TypeScript funcionando.

---

## Fora de escopo (CRITICO)

- Nao implementar SDK Gemini nesta task.
- Nao implementar Function Calling Gemini nesta task.
- Nao implementar fallback entre API keys nesta task.
- Nao implementar `/stop` ou `Ctrl+C` nesta task.
- Nao implementar `PipelineController` completo nesta task.
- Nao implementar validacao de `handoff.md` nesta task.
- Nao alterar a pipeline de transicao alem do necessario para preservar comportamento atual.
- Nao criar configuracao por projeto.
- Nao permitir modelos por agente configuraveis pelo usuario.

---

## Saidas esperadas

- Provider abstraction criada.
- Ollama funcionando por meio da nova camada de provider.
- Config v2 criada/migrada sem quebrar config antiga.
- Modelos por agente definidos em `modelRegistry`.
- `PipelineEngine` sem dependencia direta de modelos vindos da config do usuario.
- Projeto compilando com `npm run build`.
- `docs/handoff.md` atualizado ao final da execucao.

---

## Criterios de aceite

- `npm run build` executa sem erros.
- Config antiga com `ollamaEndpoint`, `models` e `autoApproveMode` e migrada para config v2.
- `models` deixa de ser fonte de verdade para escolha de modelo.
- `getActiveConfig()` ou equivalente mostra provider, agent e modelo vindos do registry.
- Ollama/local continua sendo provider funcional.
- Nenhum codigo permite configurar modelos por agente via `~/.toug-cli/toug.config.json`.
- Nenhuma ferramenta publica `transition_state` e adicionada ao contrato de provider.
- Handoff da task contem objetivo, escopo executado, arquivos alterados, evidencias, pendencias e status.

---

## Dependencias

- Discovery da Fase 12 aprovado.
- Arquitetura da Fase 12 aprovada.
- `docs/api_contracts.md` criado.
- Decisoes 020 a 025 registradas em `docs/decision_log.md`.

---

## Restricoes

- Manter Node.js/TypeScript.
- Manter Windows-only nesta etapa.
- Usar ASCII em novos arquivos.
- Nao adicionar dependencia Gemini ainda.
- Nao alterar comportamento de seguranca fora do escopo desta task.
- Nao tocar em `.agents/` como artefato de projeto.

---

## Impacto no sistema

Partes afetadas:

- configuracao global;
- resolucao de modelos;
- inicializacao do provider;
- chamada de streaming atual;
- cabecalho agent/modelo exibido na CLI.

Possiveis efeitos colaterais:

- usuarios com modelos customizados na config deixam de ter esse controle;
- config antiga sera regravada no formato v2;
- `PipelineEngine` pode precisar de adaptacao para receber provider ativo.

---

## Estrategia de implementacao

1. Criar contratos TypeScript de provider.
2. Criar `modelRegistry` com mapeamentos Ollama e Gemini.
3. Migrar `configManager` para config v2 com compatibilidade de leitura v1.
4. Criar `OllamaProvider` envolvendo a logica atual do `OllamaClient`.
5. Criar `ProviderFactory` para instanciar provider ativo.
6. Adaptar `PipelineEngine` para consultar `modelRegistry` e provider abstraction.
7. Preservar comportamento atual do streaming Ollama.
8. Rodar build.
9. Atualizar `docs/handoff.md`.

---

## Plano de validacao

- Rodar `npm run build`.
- Verificar que o TypeScript compila.
- Verificar manualmente que `modelRegistry` contem mapeamentos para Ollama e Gemini.
- Verificar que `configManager` nao expoe mais `models` como configuracao ativa.
- Verificar que uma config antiga pode ser carregada sem erro.
- Verificar que o provider default continua sendo Ollama quando nao houver escolha salva.

---

## Artefatos a atualizar

- `src/providers/types.ts`
- `src/providers/ollamaProvider.ts`
- `src/engine/providerFactory.ts`
- `src/agents/modelRegistry.ts`
- `src/data/configManager.ts`
- `src/engine/pipelineEngine.ts`
- `src/engine/ollamaClient.ts` se necessario
- `src/index.ts` se necessario
- `docs/handoff.md`
- `docs/project_status.md` se necessario

---

## Observacoes

Esta task e intencionalmente uma fundacao. A integracao real com Gemini deve ser task posterior, depois que provider abstraction, config v2 e model registry estiverem estaveis.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
