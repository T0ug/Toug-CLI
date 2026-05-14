# Arquitetura Técnica - Fase 13

## 1. Visão Geral (Estrutura)

A Fase 13 introduz um sistema de resiliência e otimização de custos ao `Toug-CLI`. O diagrama lógico do fluxo de dados passa de linear para um fluxo com interceptadores locais e loops de repetição.

### Princípios da Solução
- **Sem consumo inútil de tokens:** A resolução de arquivos via tags `@` e a filtragem de contexto duplicado ocorre de forma 100% nativa (Node.js `fs`).
- **Resiliência em Camadas:** Modelos caem para modelos inferiores, que caem para novas chaves, que caem para inferência local (Ollama).
- **Separação de Papéis:** O `Provider` cuida apenas de se conectar e reportar erros HTTP precisos. O `PipelineEngine` cuida de gerir as tentativas e alternar as configurações ativas.

---

## 2. Componentes e Responsabilidades

### `InputProcessor` (Novo Componente CLI)
- **Caminho:** `src/cli/inputProcessor.ts`
- **Função:** Interceptar a string bruta digitada pelo usuário antes de salvá-la no histórico oficial da IA. Executa expressões regulares para detectar padrões como `@nome_do_arquivo.ext` e `@/nome_da_pasta`.
- **Comportamento:** Lê o sistema de arquivos recursivamente (com limite de segurança) e anexa os dados no formato `[Dados Locais Injetados: caminho] \n conteudo`. Aciona deduplicação checando se a mesma tag já existe na sessão atual.

### `PipelineEngine` (Roteador e Fallback Manager)
- **Caminho:** `src/engine/pipelineEngine.ts`
- **Função:** Orquestrar o ciclo de vida da geração.
- **Modificações:**
  - Instanciação de um laço `while` robusto ao redor da chamada do `stream`.
  - Captura estruturada de erros para identificar se o erro foi de Rate Limit (`429`) ou Exaustão de Cota (`503`).
  - Lógica de heurística (via função separada) para interceptar o turno: "Se prompt < limite E provedor == Gemini, perguntar ao usuário se quer forçar Ollama".

### `SessionManager` e `ConfigManager`
- **Caminho:** `src/data/...`
- **Função:** Gerir disco local.
- **Modificações:**
  - `TougConfig`: Passa a aceitar Array de Objetos para API Keys (suportando apelidos/nicknames).
  - `sessionManager.ts`: Método `listSessions()` para exibir `/sessoes` com parse leve dos arquivos (apenas metadados), limiar de compressão sobe para 100 mensagens.

### `ModelRegistry`
- **Caminho:** `src/agents/modelRegistry.ts`
- **Modificações:** Retorna rotas ordenadas de fallback. Ordem atual: `gemini-3.1-pro-preview`, `gemini-3-flash-preview`, `gemini-2.5-pro`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `qwen3:14b`, `qwen3:8b`.

### `OllamaClient`
- **Modificações:** Nova requisição `POST /api/generate` passando `{"model": "nome", "keep_alive": 0}` para forçar o unload da memória RAM local.

---

## 3. Fluxo de Dados

1. Usuário digita texto ou `/sessoes`.
2. Se `/sessoes`: loop nativo CLI exibe histórico.
3. Se texto: `InputProcessor` resolve arquivos.
4. Heurística de Roteamento avalia e pode forçar switch para Ollama.
5. Inicia laço de Fallback:
   - Tenta Modelo `0` com Key `0`.
   - Se Erro 429/503: Tenta Modelo `1` com Key `0`.
   - Se acabar modelos Gemini da key atual: tenta a proxima key.
   - Se acabar tudo (Gemini): Tenta Ollama `14b`.
   - Se falhar no Ollama `14b`: Faz unload, tenta `8b`.
6. Stream retornado processa Tool Calls normalmente.

---

## 4. Persistência e Integrações

- **File System:** Uso restrito a `fs` e `path` nativos, sem abstrações pesadas.
- **Docker:** O script `pull_models.bat/.sh` removerá os binários redundantes para otimização de disco, forçando ambiente padronizado.
- **Migrations:** Leitura segura do `toug.config.json` legando chaves nativas para arrays tipados de aliases, sem quebra de experiência.

---

## 5. Tratamento de Erros

- **Erros Fatais (400, 401, 403, 404):** Rompem o ciclo e devolvem alerta visual.
- **Erros Temporários (429, 503):** Absorvidos silenciosamente pelo fallback (com apenas 1 linha de log em amarelo para feedback).
- **Leitura de Arquivo Indisponível/Muito Grande:** Injeção textual do erro direto no prompt do LLM, para que o robô seja ciente de que o usuário errou o caminho ou excedeu os bytes.

---

## 6. Escalabilidade

A arquitetura orientada a arrays iteráveis no `PipelineEngine` permite que um número "N" de novos provedores, modelos ou chaves de cota sejam adicionados sem refatorações lógicas, garantindo resiliência passiva extrema para usuários de tiers gratuitos.
