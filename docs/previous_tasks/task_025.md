# Task

## Identificação

- ID: 025
- Nome: Fase 14.3 - Fix Ctrl+C e ToolRunner com stdin interativo
- Fase: 14
- Agente responsável: Executor

---

## Objetivo

Corrigir o bug de Ctrl+C durante streaming e permitir comandos interativos no toolRunner.

---

## Contexto

- Bug: Ctrl+C não interrompe a geração, terminal trava.
- Bug: toolRunner usa `execAsync` que não conecta stdin.
- Decisão 059: spawn com stdio inherit.
- Decisão 060: fix AbortController.
- Decisão 066: trade-off aceito (perder captura de output para ganhar interatividade).

---

## Entradas

- `docs/architecture_fase14.md`
- `src/engine/pipelineEngine.ts`
- `src/engine/toolRunner.ts`
- `src/index.ts` (onde `onInterrupt` é registrado)

---

## Escopo

1. Modificar `src/engine/toolRunner.ts`:
   - Para comandos regulares (não-background): substituir `execAsync` por `spawn` com `stdio: 'inherit'`.
   - O processo filho conecta stdin/stdout/stderr do terminal.
   - Promise resolve quando processo emite `close`.
   - Retornar mensagem de status (sucesso/código de erro) ao invés de output capturado.
   - Manter tratamento de background commands como está.

2. Corrigir Ctrl+C em `src/engine/pipelineEngine.ts`:
   - Garantir que `abortSignal` é passado corretamente ao provider.
   - Adicionar `try/catch` para `AbortError` no `for await` loop.
   - Tratar `AbortError` como interrupção normal (yield mensagem, break).

3. Verificar `src/index.ts`:
   - Garantir que `abortCurrentStream()` é chamado corretamente no handler de SIGINT.
   - Verificar se o readline não conflita com o abort.

---

## Fora de escopo (CRÍTICO)

- Não migrar menus para selectMenu.
- Não alterar providers.
- Não alterar config.

---

## Saídas esperadas

- Ctrl+C interrompe a geração e devolve controle ao prompt "Voce:".
- Comandos interativos (ex: `Read-Host` no PowerShell) funcionam normalmente.

---

## Critérios de aceite

- Ctrl+C durante streaming: mensagem "[Geracao interrompida]" aparece e prompt volta.
- Terminal não trava após Ctrl+C.
- Executar script com `Read-Host`: conseguir digitar e submeter input.
- `npm run build` compila sem erros.

---

## Dependências

- Nenhuma dependência de tasks anteriores (pode ser executada em paralelo com 024).

---

## Restrições

- Não adicionar dependências externas.
- Manter compatibilidade com o sistema de aprovação de comandos.

---

## Impacto no sistema

- `toolRunner.ts`: mudança de comportamento (output não capturado para comandos interativos).
- `pipelineEngine.ts`: fix no handler de abort.
- Modelo receberá mensagem de status ao invés de output completo do comando.

---

## Estratégia de implementação

1. Refatorar toolRunner: spawn com inherit.
2. Fix abort no pipelineEngine.
3. Testar Ctrl+C.
4. Testar comando interativo.
5. Build.

---

## Plano de validação

- `npm run build` sem erros.
- Teste: iniciar CLI, enviar prompt, pressionar Ctrl+C durante resposta.
- Teste: pedir para IA executar um script com Read-Host.

---

## Artefatos a atualizar

- `src/engine/toolRunner.ts`
- `src/engine/pipelineEngine.ts`
- `src/index.ts` (se necessário)

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
- [ ] Bloqueada
