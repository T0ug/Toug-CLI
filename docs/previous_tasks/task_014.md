# Task

## Identificacao

- ID: 014
- Nome: Fase 12.4 - Interface de Seleção Global e Gemini Configs
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Atualizar a rotina de inicialização no `index.ts` para introduzir nativamente a escolha entre os Provedores Globais (Ollama vs Gemini) no wizard de primeiro uso e no menu interativo `/config`, além de isolar as verificações de saúde estritas do ambiente base.

---

## Contexto

Após a integração funcional na Task 013 do `PipelineEngine` com o SDK Gemini, o Toug CLI continua iniciando por padrão cego com avisos sobre `Servidor Ollama operante` devido a hardcodes procedurais no script inicial. A pipeline demanda que a seleção de provedor (`lastProvider`) e adição de chaves (`gemini.apiKeys`) ocorra ativamente antes da máquina logar instâncias.

---

## Entradas

- `src/index.ts`
- `docs/tasks.md`

---

## Escopo

- Refatorar `configWizard()` (`src/index.ts`):
  - Interrogar qual provider o usuário quer usar (1=Ollama, 2=Gemini).
  - Se Gemini, convencer por uma chave API passivamente (via `push` a `config.gemini.apiKeys`).
  - Atribuir `lastProvider` ao input detectado.
- Refatorar `editConfig()`:
  - Adicionar as opções no menu interativo via shell prompt: `1=Provider`, `2=Endpoint Ollama`, `3=Add Gemini Key`, `4=Auto-approve`.
- Ajustes condicionais de Health Check no `main()`:
  - Fazer early load de provedor ativo da config. Validar OllamaClient *apenas* se o usuário marcou `ollama`. Para `gemini`, simplesmente printar status das keys locais.

---

## Fora de escopo (CRITICO)

- Nao criar validação de tokens Gemini em nuvem neste momento.
- Nao configurar comandos de Delete (remoção interativa) de keys do JSON para manter UI simples.
- Sem instâncias pesadas ou interrupções de stream (CTRL+C) nesta task.

---

## Saidas esperadas

- UI de `/config` suportando perfeitamente a variação Ollama/Gemini.
- Setup inicial da branch rodando sem erros redundantes em vermelho.
- Compilação estática bem sucedida.

---

## Criterios de aceite

- Prompt perguntará o provider na ausência do conf, sem emitir `Ollama server is not reachable` indiscriminadamente para todos.
- A função `/config` não exibe ambiguidades. O usuário atualiza `configVersion: 2` de fato iterativamente pelo prompt.

---

## Dependencias

- Task 013 concluída e mergeada.

---

## Restricoes

- Nenhuma dependência externa ao stdlib deve ser usada pra prompt. Usar o `promptUser` já disponível.

---

## Estrategia de implementacao

1. Mapeamento de blocos if/elseif na captura do read line promise em `editConfig`.
2. Deslocamento do trecho de instanciação do `OllamaClient` para debaixo de um `if (loadConfig().lastProvider === 'ollama')`.
3. Adicionar condicional else pra printar em verde "Provedor Cloud Gemini alocado."

---

## Plano de validacao

- Validacao estática via build pelo tsc. O revisor conferira os laços condicionais visualmente no index.ts.

---

## Artefatos a atualizar

- `src/index.ts`
- `docs/handoff.md`

---

## Observacoes

N/A

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
