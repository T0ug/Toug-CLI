# Arquitetura - Fase 14: Thinking Display, UX Interativa e Correções

## Estrutura geral

A Fase 14 introduz 1 módulo novo e modifica 8 módulos existentes. Nenhuma dependência externa é adicionada.

### Módulo novo

#### `src/cli/selectMenu.ts`
Componente reutilizável de menu interativo com setas.

**Interface pública:**
```typescript
interface SelectMenuOption {
    label: string;
    value: string;
}

function selectMenu(options: SelectMenuOption[], title?: string): Promise<string>;
```

**Comportamento:**
- Ativa `process.stdin.setRawMode(true)` temporariamente.
- Renderiza opções com cursor `>` na opção ativa.
- Escuta keypress: `↑` move para cima, `↓` move para baixo, `Enter` seleciona, `Ctrl+C` cancela.
- Após seleção, restaura `setRawMode(false)` e retorna o `value` da opção selecionada.
- Usa ANSI escape codes para limpar/redesenhar as linhas do menu sem scroll.

---

## Componentes modificados

### 1. `src/providers/types.ts`

Adicionar novo tipo de evento ao `ProviderEvent`:

```typescript
export type ProviderEvent =
    | { type: 'text_delta'; text: string }
    | { type: 'thinking_delta'; text: string }   // NOVO
    | { type: 'tool_call'; call: ToolCall }
    | { type: 'done'; finishReason?: string }
    | { type: 'error'; error: ProviderError };
```

---

### 2. `src/engine/ollamaClient.ts`

**Mudanças:**
- Aceitar parâmetro `think: boolean` no método `streamChat`.
- Enviar `think: true` no body da request quando ativado.
- No parser de JSONL, verificar `parsed.message.thinking` além de `parsed.message.content`.
- Yield de um objeto diferenciado para distinguir thinking de content.

**Nova interface de retorno (interna):**
```typescript
interface OllamaStreamChunk {
    type: 'thinking' | 'content';
    text: string;
}
```

O método `streamChat` passará a retornar `AsyncGenerator<OllamaStreamChunk>`.

---

### 3. `src/providers/ollamaProvider.ts`

**Mudanças:**
- Ler `showThinking` do config para decidir se envia `think: true`.
- Mapear `OllamaStreamChunk.type === 'thinking'` para `{ type: 'thinking_delta' }`.
- Mapear `OllamaStreamChunk.type === 'content'` para `{ type: 'text_delta' }`.

---

### 4. `src/providers/geminiProvider.ts`

**Mudanças:**
- Adicionar `thinkingConfig: { includeThoughts: true }` ao config da request quando `showThinking` está ativo.
- No loop de streaming, verificar se o chunk contém thought parts e emitir `thinking_delta`.
- Manter `text_delta` para conteúdo normal.

---

### 5. `src/engine/pipelineEngine.ts`

**Mudanças:**

#### Thinking display
- No loop `for await (const event of stream)`, tratar `event.type === 'thinking_delta'`:
  - Se `showThinking` está ligado: yield `\x1b[90m${event.text}\x1b[0m` (cinza escuro).
  - Se desligado: ignorar silenciosamente.
- Não incluir conteúdo de thinking no `assistantResponse` (não poluir histórico).

#### Fix Ctrl+C
- Diagnóstico: o `onInterrupt` registra no `rl` do readline, mas o `AbortController.abort()` pode não estar propagando corretamente para o `fetch` interno do provider.
- Solução: garantir que o `abortSignal` é passado ao provider e que o `for await` faz `break` imediato ao detectar `aborted`.
- Adicionar `try/catch` em torno do `for await` para capturar `AbortError` e tratá-lo como interrupção normal.

---

### 6. `src/engine/toolRunner.ts`

**Mudanças:**
- Substituir `execAsync` (que não conecta stdin) por `spawn` com `stdio: 'inherit'` para comandos regulares.
- Manter o tratamento especial de background commands (`npm run dev`, etc.) como está.
- O `spawn` com `stdio: 'inherit'` conecta stdin/stdout/stderr do terminal ao processo filho, permitindo interação.
- Retorno: resolver a Promise quando o processo filho emitir `close`, capturando o exit code.

```typescript
// Novo fluxo para comandos regulares
const child = spawn(command, { shell: true, stdio: 'inherit' });
return new Promise((resolve) => {
    child.on('close', (code) => {
        resolve(code === 0
            ? 'Comando executado com sucesso.'
            : `Comando finalizado com código ${code}.`);
    });
});
```

**Impacto:** O output do comando não será mais capturado como string para devolver ao modelo. O modelo receberá apenas o status de execução. Isso é um trade-off aceito para permitir interatividade.

---

### 7. `src/data/configManager.ts`

**Mudanças:**
- Adicionar `showThinking: boolean` ao `TougConfig` (padrão: `true`).
- Atualizar `DEFAULT_CONFIG` e `normalizeConfig` para incluir o novo campo.

---

### 8. `src/cli/chatInterface.ts`

**Mudanças:**
- Adicionar cor `DIM: '\x1b[90m'` ao objeto `COLORS`.
- Exportar referência ao `rl` (readline interface) para que o `selectMenu` possa pausar/resumir o readline durante raw mode.

---

### 9. `src/index.ts`

**Mudanças maiores:**

#### Menu principal (pós-config)
- Após o logo TOUG, se config já existe, exibir menu com setas:
  - "Iniciar nova conversa" → detecção silenciosa de projeto, transition para estado correto, loop REPL.
  - "Configurações" → `editConfig()` com menus por setas.
  - "Sessões anteriores" → `manageSessions()`.
- Remover chamada ao `projectState.summary` (análise visual ✅/❌).
- Remover prompt "Retomar sessão anterior? (Y/n)".
- A detecção interna de projeto (`detectProjectState`) continua funcionando silenciosamente para decidir o estado da pipeline.

#### editConfig com menus por setas
- Substituir o prompt `"Alterar: 1=Provider, 2=Endpoint..."` por `selectMenu` com opções legíveis.
- Dentro de cada opção (Provider, Auto-approve), usar `selectMenu` ao invés de digitar 1/2.

#### Fluxo de API keys
- Após digitar a key: pedir apelido com hint dimmed `\x1b[90m(Enter para não incluir apelido)\x1b[0m`.
- Se apelido vazio: auto-gerar `Key_N`.
- Após concluir: `selectMenu` com "Adicionar outra" / "Voltar".

#### Config toggle showThinking
- Nova opção no `/config`: "Mostrar pensamento da IA" (Sim/Não via selectMenu).

#### Aprovação de comandos
- Substituir `"Permitir? Y/n"` por `selectMenu` com "Sim" / "Não".

---

## Fluxo de dados do Thinking

```
User input
    ↓
PipelineEngine.processInput()
    ↓
Provider.stream() ──→ { type: 'thinking_delta', text: '...' }  ← raciocínio
                  ──→ { type: 'text_delta', text: '...' }      ← resposta
    ↓
PipelineEngine renderiza:
    thinking_delta → \x1b[90m (cinza escuro, se showThinking=true)
    text_delta     → normal (sem cor especial)
    ↓
Terminal do usuário
```

---

## Fluxo do selectMenu

```
selectMenu(options) chamado
    ↓
rl.pause()  ← pausa o readline para evitar conflito
    ↓
stdin.setRawMode(true)
stdin.resume()
    ↓
Renderiza opções com ANSI escape codes
Escuta keypress (↑↓ Enter Ctrl+C)
    ↓
Usuário seleciona
    ↓
stdin.setRawMode(false)
rl.resume()  ← retorna controle ao readline
    ↓
Retorna value selecionado
```

---

## Tratamento de erro

### Ctrl+C durante streaming
- O `AbortController` emite `abort`.
- O provider deve capturar `AbortError` no fetch e encerrar o generator.
- O `pipelineEngine` deve capturar `AbortError` no `for await` e fazer yield da mensagem de interrupção.
- O readline continua funcional após a interrupção.

### selectMenu + Ctrl+C
- Se Ctrl+C pressionado no menu, retornar valor especial `'__cancel__'` que o chamador trata como "voltar".

### ToolRunner com stdio inherit
- Se o processo filho falhar (`exit code !== 0`), retornar mensagem de erro ao modelo.
- Se o processo filho travar (timeout), não há tratamento automático — o usuário controla via Ctrl+C no terminal.

---

## Decisões técnicas

| Decisão | Justificativa |
|---------|---------------|
| Raw mode nativo sem lib externa | Evita dependência, selectMenu é simples o suficiente |
| `thinking_delta` como evento separado | Não polui `text_delta`, permite toggle sem mudar providers |
| Thinking não entra no histórico | Economiza tokens, pensamento é efêmero |
| `spawn` com `stdio: inherit` | Única forma de conectar stdin ao processo filho |
| Output de comando não capturado com inherit | Trade-off aceito: interatividade > captura de output |

---

## Estrutura de diretórios (mudanças)

```
src/
├── cli/
│   ├── chatInterface.ts     ← adicionar DIM, exportar rl
│   └── selectMenu.ts        ← NOVO
├── data/
│   └── configManager.ts     ← adicionar showThinking
├── engine/
│   ├── ollamaClient.ts      ← think param, OllamaStreamChunk
│   ├── pipelineEngine.ts    ← thinking_delta handler, fix Ctrl+C
│   └── toolRunner.ts        ← spawn com stdio inherit
├── providers/
│   ├── types.ts             ← thinking_delta event
│   ├── ollamaProvider.ts    ← mapear thinking chunks
│   └── geminiProvider.ts    ← thinkingConfig
└── index.ts                 ← menu principal, selectMenu everywhere
```
