# Task

## Identificação

- ID: 003
- Nome: Fase 2 — Conexão com Ollama API e Configurações (Node.js)
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Implementar o módulo client interno que conecta o Node.js ao Ollama local utilizando requisições HTTP e streams. Criar também o gerenciador do arquivo local de configuração (`toug.config.json`).

---

## Contexto

Com a Docker rodando o LLM nativo e o esqueleto do projeto TypeScript estabelecido, esta task é a fundação para a "voz e ouvidos" do projeto. Aqui gerencia-se configurações do usuário (quais modelos usar, qual porta conectar) e como a Pipeline vai conversar com os Models no futuro.

---

## Entradas

- `docs/architecture.md` (Design do Error Handling e Módulos).
- Caminho da configuração desejado (ex: `%APPDATA%/TougCLI` ou relativo na raiz pra simplificar no MVP).

---

## Escopo

- Criar `src/data/configManager.ts`: Módulo focado em criar/ler o arquivo `toug.config.json`. Deve conter o endpoint do Ollama (padrão: `http://localhost:11434`), lista de agents/modelos (conforme fallback) e flags de inicialização (se faltar arquivo, cria default).
- Criar `src/engine/ollamaClient.ts`: 
  - Usar fetch API embutido do Node ou instalar `undici` se preferível para streams.
  - Implementar método `isHealthy()` que faz um ping em `/api/tags` pra saber se o docker tá up.
  - Implementar método para listar os modelos locais via `/api/tags` e verificar fallback se o sugerido faltar.
  - Implementar `streamChat(...)` consumindo o endpoint `/api/chat` usando [Server-Sent Events] - parseando corretamente o array de JSONL `data.message.content`.

---

## Fora de escopo (CRÍTICO)

- NÃO construir Orchestrators ou Agents (Discovery/Architect). Apenas o provedor puro da rede (Service Abstraction).
- NÃO conectar prompt I/O no terminal do Node; apenas fazer chamadas unitárias simples para validação em `index.ts`.

---

## Saídas esperadas

- Pacote com `configManager` e `ollamaClient` prontos para lidar com o modelo da LLM.
- Uma simulação basilar operando no `index.ts` que faça: healthcheck + envia um "Olá" e dá parse iterativo no stream do chat.

---

## Critérios de aceite

- O ping no servidor levanta logs normais (seja Failed ou Ok).
- Transpilação TS ok (`npm run build`).
- O chunk iterador repassa pedaços do texto conforme a LLM responde sem bloquear aguardando o payload completo.

---

## Dependências

- Task 001 (Node Base) e Task 002 (Ollama Network Exposure).

---

## Restrições

- Padrões de tipo: Manter Strict verdadeiro sem ignorar `any`.
- Manter o "fail graceful": Erro de HTTP deve subir exception normal, mas na engine devemos capturar e relatar sem corromper a execução.

---

## Plano de validação

- Teste manual rodando `npm run start` (configurado pelo index.ts a chamar os métodos).

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
