# Task

## Identificacao

- ID: 021
- Nome: Fase 13.4 - Gerenciador de Sessões (/sessoes) e Limite de Contexto
- Fase: 13 - Fallback Multi-Modelo, Menções e Sessões
- Agente responsavel: Executor

---

## Objetivo

Fornecer ao usuário uma interface de gerenciamento das sessões salvas no projeto atual através do comando `/sessoes`. Ao mesmo tempo, aumentar a folga do limitador de contexto (compressão) para acompanhar a maior capacidade dos modelos atuais.

---

## Contexto

O `sessionManager.ts` já salva e carrega a "última sessão" baseada na data mais recente. Porém, ao longo do desenvolvimento, um usuário pode querer retomar um contexto mais antigo ou limpar as sessões que não importam mais. O comando `/sessoes` trará essa governança nativa para a linha de comando. Além disso, o gatilho de compressão de contexto que apagava mensagens velhas estava definido para 50, mas com modelos de 1M de tokens (Gemini) e 32k a 128k (Ollama), 50 é muito baixo e corrói contexto valioso precocemente. Expandiremos o threshold para 100 mensagens para garantir memória longa e consistente.

---

## Entradas

- `src/index.ts` (Loop principal e tratamento de input)
- `src/data/sessionManager.ts` (Lógica de arquivos de sessão)

---

## Escopo

- Em `src/data/sessionManager.ts`:
  - Adicionar as funções:
    - `listSessions(cwd: string): { filename: string, savedAt: Date, count: number }[]`
    - `loadSessionFile(cwd: string, filename: string): SessionData | null`
    - `deleteSession(cwd: string, filename: string): boolean`
    - (Opcional, se houver rename) `renameSession(cwd: string, oldName: string, newName: string)` - no momento as sessões são timestamps gerados, mas o ideal é permitir listagem e seleção de qual arquivo JSON carregar.
- Em `src/index.ts`:
  - Interceptar o comando `/sessoes` no `while (true)`.
  - Exibir um menu limpo e numerado com a lista de sessões disponíveis na pasta `.toug-cli/sessions/` do projeto.
  - O usuário pode digitar o número da sessão para retomá-la (substituindo o histórico atual do `PipelineEngine`), ou um comando associado (ex: `rm 1` para deletar, ou `voltar` para sair do menu).
  - Atualizar o threshold de compressão de `if (currentHistory.length > 50)` para `> 100` e a taxa de encolhimento para comprimir deixando 20 (ou outra heurística equilibrada, `compressHistory(currentHistory, 20)`).

---

## Fora de escopo (CRITICO)

- Sincronização em nuvem das sessões.
- Lógica de heurística de roteamento de prompt.

---

## Saidas esperadas

- Ao digitar `/sessoes`, o console lista:
  `[1] 2023-10-10T... (35 mensagens)`
  `[2] 2023-10-11T... (12 mensagens)`
  `Escolha uma sessao para carregar (numero), "rm <num>" para apagar, ou ENTER para cancelar:`
- Ao carregar uma sessão, o estado e as mensagens são sobrepostos na classe `PipelineEngine`.

---

## Criterios de aceite

- O carregamento da sessão durante a conversa não pode travar o motor.
- O formato do menu deve seguir o padrão de cores `COLORS.YELLOW` e `COLORS.CYAN`.
- Limite alterado para 100 com sucesso em `index.ts`.

---

## Estrategia de implementacao

1. Criar `listSessions`, `loadSessionFile` e `deleteSession` manipulando o diretório `./.toug-cli/sessions/`.
2. Adicionar o bloco de `if (input.trim() === '/sessoes') { await manageSessions(engine, cwd); continue; }` no index.ts.

---

## Plano de validacao

- Inicializar e rodar o projeto.
- Digitar `/sessoes`, observar a lista, selecionar uma, apagar outra.
- Escrever mensagens e ver se as novas não são comprimidas precocemente.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
