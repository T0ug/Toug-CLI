# Task

## Identificação

- ID: 007
- Nome: Fase 6 — Inicialização Inteligente e Detecção de Projeto
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Dotar a aplicação de consciência situacional na inicialização. O Toug CLI deve, ao ligar, inspecionar o diretório de trabalho, detectar se já existe um projeto com artefatos (`docs/`, `package.json`, `.agents/`, etc.) e tomar decisões automáticas sobre qual fluxo iniciar: se Discovery (projeto novo) ou Onboarding/Project Research (projeto existente). Deve exibir no terminal o resumo do estado atual do projeto.

---

## Contexto

Hoje o CLI simplesmente abre num estado fixo genérico (`DISCOVERY`). Na realidade, o Toug deve ser inteligente o suficiente para entender o que tem ao seu redor. Se ele for executado dentro de uma pasta com `docs/project_status.md` preenchido, ele deve saber que já existe um projeto e carregar o contexto. Se não existir nada, ele deve saber que é um projeto novo.

---

## Entradas

- `docs/tasks.md` (Fase 6 — checklist de escopo).
- `docs/architecture.md`.
- `src/data/configManager.ts` (Configs locais).

---

## Escopo

- Criar `src/engine/projectDetector.ts`:
  - Função `detectProjectState(cwd: string)` que inspeciona o filesystem local.
  - Checar existência de `docs/`, `docs/project_status.md`, `docs/tasks.md`, `package.json`, `.agents/`.
  - Retornar um objeto tipado: `{ isExistingProject: boolean, hasDocumentation: boolean, hasAgentsPipeline: boolean, hasTasks: boolean, summary: string }`.
- Modificar `src/index.ts`:
  - Antes do REPL loop, chamar `detectProjectState(process.cwd())`.
  - Se o projeto for existente e tiver docs, exibir um resumo colorido do estado e transitar a Engine automaticamente para `ORCHESTRATING`.
  - Se o projeto for novo, transitar para `DISCOVERY` e imprimir uma mensagem de boas-vindas adequada.
- A Engine deve carregar no histórico (como mensagem `system`) o conteúdo do `project_status.md` se existir, para que a LLM tenha contexto imediato do estado atual.

---

## Fora de escopo (CRÍTICO)

- NÃO implementar persistência de sessões (Fase 7).
- NÃO implementar leitura/escrita profunda de artefatos (Fase 8). Apenas leitura superficial do `project_status.md` para contexto inicial.

---

## Saídas esperadas

- Ao rodar `npm run start` numa pasta com `docs/project_status.md`, o terminal exibe automaticamente o status do projeto e entra em modo Orchestrator.
- Ao rodar numa pasta vazia, entra em modo Discovery com mensagem de boas-vindas para novo projeto.

---

## Critérios de aceite

- A detecção é feita via `fs.existsSync` puro sem dependência extra.
- O resumo colorido no terminal mostra claramente: ✅/❌ para cada artefato detectado.
- A transição de estado ocorre automaticamente sem intervenção do usuário.
- Compilação limpa (`npm run build`).

---

## Dependências

- Task 006.

---

## Restrições

- Manter leitura síncrona (`readFileSync`) para a fase de boot, que é bloquante. Não precisa de async no detector.

---

## Plano de validação

- Rodar `npm run start` de dentro do diretório do projeto Toug CLI (que já possui `docs/`) e verificar que detecta como projeto existente.
- Rodar `npm run start` de um diretório vazio temporário e verificar que detecta como projeto novo.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [ ] Concluída
- [ ] Bloqueada
