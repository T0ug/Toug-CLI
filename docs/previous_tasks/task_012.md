# Task

## Identificacao

- ID: 012
- Nome: Fase 12.2 - Provedor Gemini e Function Calling
- Fase: 12 - Provedores Globais e Gemini
- Agente responsavel: Executor

---

## Objetivo

Implementar a integracao nativa do SDK oficial do Gemini (`@google/genai`), incluindo streaming e Function Calling, integrando-o a nova base de providers desenvolvida na Fase 12.1.

---

## Contexto

A Fase 12 introduz suporte a provedores globais. Na Task 011, a abstracao de Provider, Config v2 e o Model Registry foram entregues. Agora o Toug CLI precisa concretizar a comunicacao com a API do Gemini via rede externa iterando chaves e rotacionando-as, suportar nativamente as tools de sistema via requisicao de função (Function Calling).

---

## Entradas

- `src/providers/types.ts`
- `src/providers/ollamaProvider.ts` (para paridade de contrato)
- `src/engine/providerFactory.ts`
- Documentacao oficial do `@google/genai` (Node.js SDK da Google)
- `docs/tasks.md`
- Array de chaves em `loadConfig().gemini.apiKeys`

---

## Escopo

- Adicionar dependencia `@google/genai`.
- Criar `src/providers/geminiProvider.ts` implementando a interface estrita `AIProvider`.
- Mapear a conversao de `ProviderMessage` (Toug format) para instrucoes do Gemini (diferenciando System Prompt e context historico).
- Traduzir a lista dinamica de tools (`run_command`, `read_file`, `write_file`) para o framework do Function Calling nativo do @google/genai.
- Implementar o loop de stream nativo, emitindo `ProviderEvent` (text_delta, tool_call, error, done).
- Despachar functionCalls identificadas no stream como `{ type: 'tool_call', call: ToolCall }` da pipeline nativa.
- Implementar logica basica de fallback (`try/catch` roteando proxima Key se erro 429 disparar).
- Registrar a viabilidade de instantiate do `GeminiProvider` em `providerFactory.ts`.

---

## Fora de escopo (CRITICO)

- Nao implementar a selecao global no start do CLI ainda.
- Nao implementar logs letais externos e nao introduzir `/stop` ou `Ctrl+C` interrupt.
- Nao alterar ou tentar consertar o Ollama. Apenas expor o Gemini como disponivel internamente no codigo.

---

## Saidas esperadas

- Pacote `@google/genai` integrado e lock atualizado.
- Arquivo `geminiProvider.ts` completo e alinhado aos tipos.
- App compilete (`npm run build`).

---

## Criterios de aceite

- O build roda com sucesso.
- O codigo roteia as respostas corretamente (`text_delta` e `tool_call`) com a interface da google convertida na local.
- Erros do tipo HTTP 429 buscam ativamente outra chave contida em `gemini.apiKeys`.

---

## Dependencias

- Task 011 concluida.
- Conta node ativa para `npm i`.

---

## Restricoes

- SDK OBRIGATORIAMENTE DEVE SER `@google/genai` e NAO a legada (`@google/generative-ai`).
- Proibido ecoar ou logar credenciais na stdout do terminal do cliente.

---

## Impacto no sistema

- Possibilita aos agentes rodarem com IA altissimamente capaz local e remoto misto e transparente.

---

## Estrategia de implementacao

1. Instalar `@google/genai`.
2. Criar pacote do provier.
3. Rastrear o system prompt para extraír das messages do request, afim de passar adequadamente preenchido na request do gemini (systemInstruction).
4. No metodo `stream`, aplicar fallbacks de rotacoes de APIs do provider nativo se ocorrer 429.
5. Injetar a definição estrita da funcao XML nos moldes de config da api tools de tools do gemini.
6. Ajustar Factory.
7. Rodar `npm run build`.

---

## Plano de validacao

- Validacao estatica: O build e tsc passam normalmente.
- O revisor conferira os mapeamentos JSON de function parameter e o array iterado do erro 429.

---

## Artefatos a atualizar

- `package.json`
- `src/providers/geminiProvider.ts`
- `src/engine/providerFactory.ts`
- `docs/handoff.md`

---

## Observacoes

O `system` prompt normalmente eh a role primeira do array no nosso app, logo o Gemini lida com systemInstruction sendo deslocado do array history de messages do context window. Lembre-se disso.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
