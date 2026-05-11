# Task

## Identificação

- ID: 009
- Nome: Fase 8 — Gestão de Artefatos (Leitura/Escrita de docs/)
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Habilitar os Agents da Pipeline a ler e escrever artefatos do projeto (`docs/`) através de tags semânticas XML, da mesma forma que o `<run_command>` funciona. Com isso, a LLM poderá criar/atualizar `tasks.md`, `handoff.md`, `project_status.md`, etc., diretamente.

---

## Contexto

Hoje a IA só pode executar comandos shell. Para um pipeline de desenvolvimento real, ela precisa manipular artefatos de texto diretamente — criar tasks, atualizar status, escrever handoffs. Isso fecha o ciclo de automação onde o Toug CLI pode operar a pipeline quase autonomamente.

---

## Escopo

- Criar `src/engine/artifactManager.ts`:
  - `readArtifact(filePath: string): string` — Lê um arquivo relativo ao CWD.
  - `writeArtifact(filePath: string, content: string): void` — Escreve/sobrescreve um arquivo relativo ao CWD, criando diretórios intermediários se necessário.
  - `listArtifacts(dirPath: string): string[]` — Lista arquivos de um diretório.
- Modificar `src/engine/pipelineEngine.ts`:
  - Adicionar detecção de tags `<read_file>path</read_file>` e `<write_file path="path">content</write_file>`.
  - Para `read_file`: ler o conteúdo e injetar no histórico como mensagem system sem precisar de aprovação.
  - Para `write_file`: exibir preview do conteúdo e pedir aprovação (mesma lógica do Approval Gate do `run_command`), exceto em `autoApproveMode`.
- Atualizar os System Prompts em `agentLoader.ts` para informar aos LLMs sobre as novas ferramentas disponíveis (`<read_file>`, `<write_file>`, `<run_command>`).

---

## Fora de escopo (CRÍTICO)

- NÃO implementar edição parcial de arquivos (diff/patch). Apenas sobrescrita completa.
- NÃO implementar leitura de binários. Apenas texto UTF-8.

---

## Critérios de aceite

- Se a IA emitir `<read_file>docs/tasks.md</read_file>`, o conteúdo do arquivo é lido e devolvido ao contexto automaticamente.
- Se a IA emitir `<write_file path="docs/handoff.md">conteúdo</write_file>`, o CLI pede aprovação e grava o arquivo.
- Compilação limpa (`npm run build`).

---

## Dependências

- Task 008.

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [ ] Concluída
- [ ] Bloqueada
