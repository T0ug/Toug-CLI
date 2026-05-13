# Task

## Identificação

- ID: 002
- Nome: Fase 2 — Setup do Ambiente Docker (Ollama)
- Fase: Execução
- Agente responsável: Executor

---

## Objetivo

Gerar a infraestrutura de deployment/containerização para rodar o Ollama de forma padronizada. 

---

## Contexto

A validação prévia ("Assumption 1") assumia que o Ollama já estava rodando na máquina isolada magicamente. O usuário corrigiu isso: a criação desse blueprint (docker-compose) precisa nascer junto com este projeto. Sem isso, não há como testar a API.

---

## Entradas

- Lista de modelos aprovados no `docs/scope.md`.
- Conhecimento padrão de infra Docker para Ollama (suporte a portas `11434` e volumes).

---

## Escopo

- Criar a pasta `docker/` na raiz do repositório (para não sujar a raiz principal).
- Criar o arquivo `docker/docker-compose.yml` expondo o container do Ollama na porta `11434` e mapeando um volume `ollama_data` para persistência dos modelos.
- Criar um script `docker/pull_models.sh` (ou um equivalente `.bat` / Script JS multiplataforma se preferir) para automatizar o comando `ollama run <modelo>` para os 6 modelos mapeados. Alternativamente, usar ENTRYPOINT do Docker para automatizar isso (ou apenas deixar documentado em script bash).

---

## Fora de escopo (CRÍTICO)

- NÃO codificar a integração em `Node.js` (O client). Redirecionaremos isso para a Task 003.

---

## Saídas esperadas

- Pasta `docker/` com arquivos YAML e script shell de setup.

---

## Critérios de aceite

- O `docker-compose.yml` está bem estruturado.
- O script `pull_models.sh`/`pull_models.bat` contém pull de *todos* os modelos exatos que o CLI precisará usar conforme `scope.md`.

---

## Restrições

- O compose deve suportar Nvidia GPU mode opcional (`deploy: resources: reservations: devices: - capabilities: [gpu]`) já que os modelos somados são dezenas de bilhões de parâmetros, mas mantendo *graceful degradation* pra CPU se faltar.

---

## Artefatos a atualizar

- `docs/project_status.md`

---

## Status

- [ ] Não iniciada
- [ ] Em andamento
- [x] Concluída
