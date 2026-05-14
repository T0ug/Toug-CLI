# Task

## Identificação

- ID: 023
- Nome: Fase 14.1 - Componente selectMenu e Fundação de Config
- Fase: 14
- Agente responsável: Executor

---

## Objetivo

Criar o componente reutilizável `selectMenu.ts` para navegação por setas e adicionar o campo `showThinking` ao config.

---

## Contexto

- É a fundação da Fase 14: todas as outras tasks dependem do `selectMenu`.
- O `configManager.ts` precisa do novo campo antes que providers e UI possam usá-lo.
- Decisão 065: raw mode nativo sem dependência externa.

---

## Entradas

- `docs/architecture_fase14.md` (especificação do selectMenu)
- `src/cli/chatInterface.ts` (exportar `rl` e adicionar `DIM`)
- `src/data/configManager.ts` (adicionar `showThinking`)

---

## Escopo

1. Criar `src/cli/selectMenu.ts`:
   - Interface `SelectMenuOption { label: string; value: string }`.
   - Função `selectMenu(options, title?): Promise<string>`.
   - Implementar raw mode com `process.stdin.setRawMode(true)`.
   - Escutar keypress: ↑ (move cima), ↓ (move baixo), Enter (seleciona), Ctrl+C (cancela retornando `'__cancel__'`).
   - Usar ANSI escape codes para redesenhar o menu sem scroll.
   - Pausar/resumir o readline do chatInterface durante raw mode.

2. Modificar `src/cli/chatInterface.ts`:
   - Adicionar `DIM: '\x1b[90m'` ao objeto `COLORS`.
   - Exportar referência ao `rl` para uso do selectMenu.

3. Modificar `src/data/configManager.ts`:
   - Adicionar `showThinking: boolean` ao `TougConfig` (padrão: `true`).
   - Atualizar `DEFAULT_CONFIG` e `normalizeConfig`.

---

## Fora de escopo (CRÍTICO)

- Não migrar nenhum menu existente do `index.ts` ainda.
- Não alterar providers.
- Não alterar pipelineEngine.

---

## Saídas esperadas

- `src/cli/selectMenu.ts` funcional e exportado.
- `COLORS.DIM` disponível.
- `showThinking` persistindo no config JSON.

---

## Critérios de aceite

- `selectMenu` renderiza opções no terminal com cursor `>`.
- Setas ↑/↓ navegam entre opções.
- Enter retorna o `value` da opção selecionada.
- Ctrl+C retorna `'__cancel__'`.
- Após seleção, o readline volta a funcionar normalmente.
- `npm run build` compila sem erros.

---

## Dependências

- Nenhuma task anterior (é a primeira da Fase 14).

---

## Restrições

- Sem dependências externas (npm).
- Compatível com Windows Terminal e PowerShell.

---

## Impacto no sistema

- `chatInterface.ts`: mudança aditiva (nova cor, export do rl).
- `configManager.ts`: novo campo no config v2.

---

## Estratégia de implementação

1. Criar `selectMenu.ts` com raw mode.
2. Testar manualmente a navegação.
3. Adicionar `DIM` e export `rl` ao chatInterface.
4. Adicionar `showThinking` ao configManager.
5. Build e validação.

---

## Plano de validação

- `npm run build` sem erros.
- Teste manual: importar e chamar `selectMenu` com 3 opções dummy.

---

## Artefatos a atualizar

- `src/cli/selectMenu.ts` (NOVO)
- `src/cli/chatInterface.ts`
- `src/data/configManager.ts`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
- [ ] Bloqueada
