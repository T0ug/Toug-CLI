# Task

## Identificacao

- ID: 019
- Nome: Fase 13.2 - Lógica de Fallback Multi-Modelo e API Keys no PipelineEngine
- Fase: 13 - Fallback Multi-Modelo, Menções e Sessões
- Agente responsavel: Executor

---

## Objetivo

Implementar a resiliência operacional no motor principal (`PipelineEngine`). O sistema deve ser capaz de interceptar falhas de limite de uso (rate limit / esgotamento) do Gemini, alternar chaves de API, alternar para modelos mais leves e, em último caso, recorrer à inferência local via Ollama. Também exige o controle de memória RAM do Ollama via chamada de descarregamento (unload).

---

## Contexto

Atualmente, se o `GeminiProvider` encontra uma falha de API (como cota esgotada), o fluxo quebra e retorna erro para o usuário. Com a tipagem preparada na `task_018`, agora temos acesso a um array ordenado de modelos de fallback e um array de API keys. Precisamos envolver a chamada do provider em um laço de repetição defensivo, que itera pelas keys disponíveis e depois pelos modelos. Se o Provider selecionado for o `gemini` e todas as tentativas falharem, o sistema deve trocar silenciosamente o provider para `ollama` para garantir a geração. Além disso, como rodar modelos locais na máquina do usuário tem alto custo de RAM, o fallback do `qwen3:14b` para o `qwen3:8b` deve ser antecedido por um "unload" forçado.

---

## Entradas

- `src/engine/pipelineEngine.ts`
- `src/engine/ollamaClient.ts`
- `docs/architecture.md` (Para as regras de tratamento de erros 429/503 e fallback)

---

## Escopo

- Em `src/engine/ollamaClient.ts`:
  - Implementar método `unloadModel(model: string): Promise<boolean>` que faz um `POST` no endpoint `/api/generate` passando `{"model": model, "keep_alive": 0}` para forçar o descarregamento da RAM.
- Em `src/engine/pipelineEngine.ts`:
  - Modificar `processInput` (ou isolar a lógica num método `executeWithFallback`).
  - Implementar o laço: para cada modelo retornado de `getModelsForProviderRole`, tentar com cada API Key configurada.
  - Se `stream` falhar com indício de limite (`429`, `503` ou string contendo `quota`/`exhausted`), capturar o erro, exibir um aviso amarelo no console de que está trocando de rota, e tentar a próxima.
  - Se todas as combinações do Gemini falharem e o Provider inicial era Gemini, instanciar o `OllamaProvider` e tentar os modelos Ollama.
  - Se o Ollama falhar com timeout/conexão no modelo principal, invocar `unloadModel` e tentar o modelo secundário de fallback.

---

## Fora de escopo (CRITICO)

- Implementação do Routing Heurístico (detecção de tarefas simples no prompt). Isso será feito em uma task futura separada.
- Resolução nativa de arquivos do sistema (`@file.txt`).
- Criação do comando `/sessoes`.

---

## Saidas esperadas

- O `PipelineEngine` lida transparentemente com chaves revogadas/esgotadas sem interrupção abrupta.
- OllamaClient possui capacidade de gestão de memória (`keep_alive`).

---

## Criterios de aceite

- Nenhuma importação de biblioteca externa pesada (fetch nativo / got atual mantidos).
- O loop evita ciclos infinitos, possuindo controle de quebra quando a lista é esgotada.
- Códigos `400` ou `403` continuam quebrando a execução imediatamente.

---

## Estrategia de implementacao

1. Adicionar o `unloadModel` no `ollamaClient.ts`.
2. Refatorar a criação do stream no `pipelineEngine.ts` colocando um `for...of` sobre os arrays de keys e modelos.

---

## Plano de validacao

- Forçar uma key inválida no `toug.config.json` para emular um erro `403` e garantir que o loop não esconda o erro.
- Executar `npm run build` para garantir sanidade.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
