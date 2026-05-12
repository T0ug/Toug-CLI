# Task

## Identificacao

- ID: 016
- Nome: Fase 12.6 - Controle de Interrupção (SIGINT) e Limites de Segurança (Sandbox)
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Implementar a contenção de escopo para as invocações de sistema (Directory Sandbox) e prover o mecanismo de encerramento brando (`Ctrl+C` ou `/stop`) que aborte a geração contínua do Provider em andamento sem derrubar sumariamente o motor inteiro da CLI Toug.

---

## Contexto

Atualmente o CLI acessa sem barreiras qualquer arquivo lido/escrito no sistema através dos retornos do LM para `write_file`/`read_file`, não retendo a navegação puramente no `CWD`. Outro gargalo remanescente é o bloqueio da Engine em caso de prompt espiral ou indesejado: um usuário não consegue "frear" o robô sem matar o processo Node via hard-kill.

---

## Entradas

- `src/index.ts`
- `src/cli/chatInterface.ts`
- `src/providers/geminiProvider.ts`
- `src/engine/pipelineEngine.ts`
- `src/engine/artifactManager.ts`

---

## Escopo

- Em `artifactManager.ts`:
  - Validar caminhos de diretório garantindo que `path.resolve` de leitura ou gravação seja sempre filho (ou igual) do `cwd()`. Retornar falha na execução da Tool se houver Path Traversal (ex: `../../`).
- Em `index.ts` / `chatInterface.ts`:
  - Capturar o evento iterativo de `SIGINT` vindo do módulo `readline`.
  - Criar variação em `pipelineEngine.ts` associando a um `AbortController`.
  - Se a flag global de state indicar "gerando", um sinal `abort()` amacia a quebra e apenas devolve pra tela `[SYSTEM] Geracao interrompida pelo usuario.`.

---

## Fora de escopo (CRITICO)

- Não bloquear sub-pastas nativas do CWD (como `node_modules` ou `.git`). Somente acessos além do topo do projeto devem ser limitados.
- Não reescrever classes inteiras do GeminiSDK, focar apenas em passar object abort signal se houver, ou quebrar rudemente via iterator break injetado.

---

## Saidas esperadas

- Abort signal perfeitamente linkado à event queue.
- Rejeição clara em path loops restritos.

---

## Criterios de aceite

- Escrita de arquivo via regex local testando `../fora_do_projeto.txt` deve devolver `<error>...`.

---

## Dependencias

- N/A. Modificadores vitais isolados.

---

## Estrategia de implementacao

1. Aplicar importação nativa de `path` em `artifactManager.ts`. Calcular absoluta do diretório atual e barrar o matching da root do CWD.  
2. Adicionar global state let de `abortController = new AbortController();` no loop. Capturar SIGINT no `rl.on('SIGINT')`, dar flush/trigger e dar loop novamente no `Voce: `.

---

## Plano de validacao

- Validacao estática via build e análise visual de código. Reviewer checará limites de namespace e as instâncias de `AbortSignal`.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
