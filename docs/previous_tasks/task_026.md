# Task

## Identificação

- ID: 026
- Nome: Fase 14.4 - Menu Principal, Migração UX e Fluxo de API Keys
- Fase: 14
- Agente responsável: Executor

---

## Objetivo

Refatorar o `index.ts` para usar selectMenu em todos os pontos de interação, implementar o menu principal e completar o fluxo de API keys.

---

## Contexto

- Decisão 057: menus com setas em todos os lugares.
- Decisão 058: menu principal com 3 opções.
- Decisão 061: fluxo de API keys com apelido e loop.
- Esta é a task final da Fase 14 que consolida toda a UX.

---

## Entradas

- `docs/architecture_fase14.md`
- `src/cli/selectMenu.ts` (Task 023)
- `src/data/configManager.ts` (Task 023)
- `src/index.ts`

---

## Escopo

1. Menu principal no `src/index.ts`:
   - Após logo TOUG (quando config existe), exibir selectMenu:
     - "Iniciar nova conversa" → detecção silenciosa de projeto, start REPL.
     - "Configurações" → `editConfig()`.
     - "Sessões anteriores" → `manageSessions()`.
   - Remover chamada ao `projectState.summary` (análise ✅/❌).
   - Remover prompt "Retomar sessão anterior? (Y/n)".
   - Manter `detectProjectState()` funcionando silenciosamente.

2. Migrar `/config` para selectMenu:
   - Substituir `"Alterar: 1=Provider, 2=Endpoint..."` por selectMenu com opções legíveis.
   - Provider: selectMenu com "Ollama" / "Gemini".
   - Auto-approve: selectMenu com "Sim" / "Não".
   - Nova opção: "Mostrar pensamento da IA" (Sim/Não).
   - Endpoint: manter input de texto (não é seleção).

3. Fluxo de API Keys:
   - Após digitar a key: pedir apelido com hint `\x1b[90m(Enter para não incluir apelido à chave API)\x1b[0m`.
   - Se apelido vazio: auto-gerar `Key_N`.
   - Após concluir: selectMenu com "Adicionar outra" / "Voltar".

4. Migrar aprovação de comandos:
   - Substituir `"Permitir? Y/n"` por selectMenu com "Sim" / "Não".
   - Substituir aprovação de gravação de arquivo por selectMenu.

5. Migrar `/sessoes` para selectMenu:
   - Substituir seleção por número por selectMenu com nomes das sessões.

---

## Fora de escopo (CRÍTICO)

- Não alterar providers.
- Não alterar pipelineEngine (exceto aprovações de tool).
- Não alterar lógica de fallback.

---

## Saídas esperadas

- CLI inicia com menu de 3 opções navegável por setas.
- Todas as seleções do CLI usam setas ao invés de Y/N ou números.
- Fluxo de API keys pede apelido e oferece loop.
- Toggle de thinking visível no /config.

---

## Critérios de aceite

- Menu principal aparece após logo com 3 opções funcionais.
- Seleção por setas funciona em Windows Terminal.
- Não há mais prompts Y/N no fluxo padrão.
- API key + apelido salva corretamente no config JSON.
- Toggle showThinking aparece no /config e persiste.
- `npm run build` compila sem erros.

---

## Dependências

- Task 023 (selectMenu.ts, COLORS.DIM, showThinking no config).
- Task 024 (showThinking funcional nos providers — para que o toggle tenha efeito).
- Task 025 (fix Ctrl+C — para que aprovações não travem).

---

## Restrições

- Não adicionar dependências externas.
- Manter compatibilidade com config v2.
- SelectMenu deve funcionar em Windows Terminal e PowerShell.

---

## Impacto no sistema

- `index.ts`: refatoração significativa do fluxo de inicialização e config.
- `pipelineEngine.ts`: aprovação de ferramentas migrada para selectMenu.

---

## Estratégia de implementação

1. Refatorar inicialização do index.ts (menu principal).
2. Refatorar editConfig com selectMenu.
3. Implementar fluxo de API keys completo.
4. Migrar aprovações de ferramentas no pipelineEngine.
5. Migrar /sessoes para selectMenu.
6. Build e teste completo.

---

## Plano de validação

- `npm run build` sem erros.
- Teste manual completo: iniciar CLI, navegar menu, configurar, adicionar key com alias, iniciar conversa, aprovar comando por setas.

---

## Artefatos a atualizar

- `src/index.ts`
- `src/engine/pipelineEngine.ts` (aprovações)

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
- [ ] Bloqueada
