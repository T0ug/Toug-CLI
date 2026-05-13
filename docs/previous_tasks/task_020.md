# Task

## Identificacao

- ID: 020
- Nome: Fase 13.3 - Resolução de Menções a Arquivos (@file)
- Fase: 13 - Fallback Multi-Modelo, Menções e Sessões
- Agente responsavel: Executor

---

## Objetivo

Implementar a funcionalidade de "Menção de Arquivos" (`@nome_do_arquivo`) diretamente no prompt do usuário. O CLI deve identificar essas menções, ler o conteúdo dos arquivos referenciados localmente usando `fs`, aplicar uma heurística de deduplicação (para não enviar o mesmo arquivo múltiplas vezes se ele já estiver no histórico recente) e apensar o conteúdo de forma silenciosa à mensagem que será enviada à IA.

---

## Contexto

Atualmente, se o usuário precisa que a IA leia um arquivo, ele pede verbalmente e a IA gasta um ciclo de inferência gerando a tool `read_file`. Com o sistema de menções `@`, o usuário pode proativamente incluir o contexto (ex: `analise a funcao neste @src/index.ts`). A carga é feita localmente pela interface do usuário, economizando tokens de round-trip e acelerando drasticamente o tempo de resposta, sem sobrecarregar a janela de contexto caso o usuário repita o `@` numa mesma sessão.

---

## Entradas

- `src/cli/chatInterface.ts` (ou módulo de processamento de input)
- `src/engine/artifactManager.ts` (para utilizar funções seguras de leitura restritas ao CWD)

---

## Escopo

- Em `src/cli/chatInterface.ts` ou novo arquivo de utilidade auxiliar:
  - Criar um parser via Regex (ex: `/@([\w./\\]+)/g`) para extrair os caminhos citados no `userInput`.
  - Para cada caminho válido e encontrado dentro da pasta do projeto, invocar `readArtifact` (ou método similar) para ler o conteúdo.
  - Implementar um mecanismo de **deduplicação**: se a menção `@arquivo_x` já foi substituída e enviada ao motor nas mensagens anteriores do histórico (da mesma sessão), omitir o reenvio do conteúdo (ou enviar apenas um lembrete: `[Arquivo já carregado na memória]`).
  - Anexar o conteúdo extraído no final da mensagem do usuário no formato: 
    ```
    (Contexto anexado pelo usuário via @)
    --- Conteúdo de arquivo_x ---
    [CONTEÚDO]
    ```
  - Exibir um log verde suave no console para o usuário (`[Anexado: arquivo_x]`) antes de enviar para o Engine.

---

## Fora de escopo (CRITICO)

- Menu interativo (`/sessoes`) ou deleção de menções.
- Heurísticas avançadas ou delegação de Agent baseado na menção.
- Modificações no PipelineEngine (a injeção deve ser estritamente resolvida na borda, antes de entrar na esteira da IA).

---

## Saidas esperadas

- O usuário digita `@package.json o que acha?`
- O console avisa que leu `package.json`.
- A IA responde sem precisar acionar a tool `read_file`.

---

## Criterios de aceite

- A leitura deve respeitar a trava de segurança de diretório (`artifactManager`). Tentativas de `@../../../etc/passwd` devem retornar erro de permissão nativo ou serem ignoradas, exibindo um aviso amarelo.
- Arquivos que não existem geram um aviso amigável no CLI e não travam o processo.
- Deduplicação funcionando para evitar estourar o limite de tokens se o usuário mandar o mesmo `@arquivo` 3 vezes.

---

## Estrategia de implementacao

1. Interceptar a string do `promptUser` (ou logo após recebê-la no loop principal).
2. Extrair caminhos, processar e apensar.
3. Passar a `string` final modificada para o `pipeline.processInput()`.

---

## Plano de validacao

- Iniciar o CLI e digitar `@toug.config.json me diga as chaves`.
- O CLI deve responder sobre o conteúdo imediatamente sem logar "Function calling detectado".
- Re-digitar o mesmo comando para testar se o sistema deduplica inteligentemente.

---

## Status

- [ ] Nao iniciada
- [ ] Em andamento
- [x] Concluida
- [ ] Bloqueada
