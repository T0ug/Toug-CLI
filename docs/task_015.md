# Task

## Identificacao

- ID: 015
- Nome: Fase 12.5 - Robustez, Tratamento de Erros e Sessão Cíclica
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Implementar os mecanismos finais de resiliência requisitados na Fase 12: auto-save ininterrupto do chat, tratativas de logs letais para Windows OS, e formatação blindada de falhas operacionais que protejam a pipeline de colapsos não catalogados.

---

## Contexto

Com a interface inicial da CLI refatorada (Task 014) e o Provider assíncrono perfeitamente plugado (Task 013), o Toug CLI precisa garantir que falhas massivas de ambiente em nuvem informem ativamente o usuário gerando um log de debbug e abrindo-o via GUI. Simultaneamente, a recuperação de contexto deve evoluir para salvamentos cíclicos ao invés de salvar apenas ao usar o `/exit`.

---

## Entradas

- `src/index.ts`
- `src/engine/pipelineEngine.ts`
- `src/data/sessionManager.ts`
- `docs/tasks.md`

---

## Escopo

- Ajustar a rotina de stream no `index.ts` e `pipelineEngine.ts` para acionar a função `saveSession` a cada iteração (cada vez que a resposta do Assistant finaliza um bloco e é adicionada ao historico).
- Criar a matriz de erros fatais envolta no bloco catch global: se algum erro estourar, o CLI deve gravar um arquivo log local físico (`toug-fatal-log.txt`) detalhando a stack.
- Utilizar `child_process.exec()` ou via shell local no Node para chamar um `start toug-fatal-log.txt` (via Windows Shell) garantindo que notepad/explorer notifique visualmente o usuário antes do encerramento.
- Consolidar as tratativas para as keys formatando a exibição final do que exatamente desencadeou a rotina fatal.

---

## Fora de escopo (CRITICO)

- Nao implementar limites rígidos arbitrários de pastas ou sanboxing nesta task. 
- Nao implementar captura do evento SIGINT (`Ctrl+C`) nesta task, que exigiria complexidades maiores no listener da stream no momento oportuno. O foco aqui é Erros e Auto-save.

---

## Saidas esperadas

- Aplicação garantindo persistência sem depender do comando safe close.
- App compilete (`npm run build`).

---

## Criterios de aceite

- A inserção da thread call de save ao array garante histórico retido em caso de power loss.
- Ao forçar uma exception global, o arquivo text de report salta na tela via bloco `exec('start...')`.
- Nenhuma falha TS.

---

## Dependencias

- N/A. O provider está imaculado.

---

## Restricoes

- Presumir o ambiente excluso Window10/11 para o OS Command, respeitando o MVP do Toug.

---

## Estrategia de implementacao

1. Mapear o método em `pipelineEngine.ts` (`saveSession` necessita ler path + historico).
2. Na função core, no bloco iterativo logo abaixo do push do `assistantResponse`, acionar salvamento síncrono no state guard (`this.state`).
3. Adicionar try-catch envolvendo a `for await (chunk of stream)` central no `index.ts`. Em caso de catch contendo a mensagem throw, construir buffer.
4. Escrever `fs.writeFileSync(...)`  contendo a Date atual e throw trace. Associar com `require('child_process').execSync(...)` com a string call apropriada (ex: `start ...`). 

---

## Plano de validacao

- Validacao estática via build tsc. O revisor conferira que o export e dependências de fileSytem estarem nativamente importados.

---

## Artefatos a atualizar

- `src/index.ts`
- `src/engine/pipelineEngine.ts`
- `docs/handoff.md`

---

## Observacoes

A chamada de auto-save precisa ser ligeiramente adaptada para não reencerrar arquivos abertamente lentos, mas dadas as pequenas threads locais, gravação de JSON a cada mensagem não irá introduzir latência perceptível frente ao tempo do Request pro Provider.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
