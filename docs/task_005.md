# Task

## Identificação

- ID: 005
- Nome: Fase 4 — Interface de Chat Interativa no Terminal (I/O)
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Implementar a interface interativa CLI para que o usuário possa digitar seus inputs nativamente no terminal e receber as respostas renderizadas progressivamente em stream. A renderização deve demonstrar claramente qual agente e modelo estão falando e possuir suporte a colorização e markdown.

---

## Contexto

Temos nosso Client de Streaming e Engine lógicos 100% independentes prontos. Contudo, o projeto ainda roda um teste estático (`index.ts` hardcoded). O usuário do Toug CLI precisa iniciar a aplicação e ter um prompt livre ("REPL") capaz de interagir fluidamente de maneira humana.

---

## Entradas

- Dependências existentes na `package.json` (`commander`, `@inquirer/prompts` e libs de console handling como `chalk` / `marked` se necessárias pra visualização nativa suportada pelo MVP, o que não existia foi adicionado em escopo como sugestão).
- `docs/architecture.md` (Camadas, Pipeline, Formatting).

---

## Escopo

- Substituir o arquivo temporário `src/index.ts` para que ele use `Inquirer`, `Readline` ou CLI inputs puros aguardando texto do usuário em Loop.
- Criar a sub-camada `src/cli/chatInterface.ts` responsável puramente pelas funções visuais (Print de labels coloridas do Agente, rendering parseado, clear screen log).
- Interceptar o Streaming repassando ao `process.stdout` sem quebras grotescas de linha, limpando spinners.
- O formato do log deve constar: `[<NOME_AGENTE> @ <MODELO>] Mensagem streamada...`

---

## Fora de escopo (CRÍTICO)

- NÃO construir o sistema de execução de comandos Bash no computador (ex: auto_approve), isso é a Fase 5 e NÃO está no escopo dessa task visual.
- NÃO invocar escrita profunda de artefatos localmente (apenas chat text).

---

## Saídas esperadas

- Loop contínuo interativo no Terminal do Node. O programa só morre se houver exit `Ctrl+C` ou comando literal de `/exit`.

---

## Critérios de aceite

- O usuário consegue digitar "Olá". O Terminal formata bonito. Aguarda resposta da Ollama (que o pipeline engine conectará). Cobre com as cores/labels e devolve prompt livre de input novamente.

---

## Dependências

- Task 004 (Engine Finalizada).

---

## Restrições

- Manter low-dependency. Recomenda-se libs pequenas nativas do Node18 `readline` ou `chalk` para colorização simples.

---

## Estratégia de implementação

- Instalar `@inquirer/prompts` ou usar `readline`.
- Adaptar o `main` function para um while loop.
- No `pipelineEngine.ts`, precisamos injetar a capacidade de receber todo o contexto de message history nativamente para o Chat de ida e volta lembrar das coisas localmente na RAM, pelo menos. (Context management em RAM, já que DB file era fase 7).

---

## Plano de validação

- Executar `npm run start` localmente e conseguir enviar duas perguntas seguidas via terminal interativo, validando a memória e a visualização no prompt.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
