# Decision Log — Toug CLI

## Formato

| # | Data | Decisão | Justificativa | Agent |
|---|------|---------|---------------|-------|

---

## Decisões

| # | Data | Decisão | Justificativa | Agent |
|---|------|---------|---------------|-------|
| 001 | 2026-05-11 | Stack: Node.js / TypeScript | Escala futura para IDE com interface gráfica; bom para CLI no MVP | Discovery |
| 002 | 2026-05-11 | API: Ollama | Runtime padrão para modelos locais, API compatível com OpenAI | Discovery |
| 003 | 2026-05-11 | Pipeline fixa e embutida no CLI | Garantir enforcement total — modelos não podem desviar do fluxo | Discovery |
| 004 | 2026-05-11 | Servidor dedicado na rede local | Separar carga dos modelos do PC de desenvolvimento | Discovery |
| 005 | 2026-05-11 | Streaming de respostas | UX superior — feedback imediato, sem sensação de travamento | Discovery |
| 006 | 2026-05-11 | Aprovação de comandos + auto-approve configurável | Segurança por padrão, flexibilidade quando desejado | Discovery |
| 007 | 2026-05-11 | Persistência de sessões em pasta local | Continuidade entre sessões sem depender só de docs/ | Discovery |
| 008 | 2026-05-11 | Compressão de contexto a ~200k tokens | Modelos locais têm context window limitado; docs/ garante continuidade | Discovery |
| 009 | 2026-05-11 | Distribuição via npm global | Padrão para CLIs TypeScript; facilita instalação e versionamento | Discovery |
| 010 | 2026-05-11 | Sem autenticação no Ollama | MVP em rede local confiável; simplifica implementação | Discovery |
| 011 | 2026-05-11 | Windows only no MVP | Ambiente do criador; simplifica escopo inicial | Discovery |
| 012 | 2026-05-11 | Labels agent+modelo em cada mensagem | Transparência sobre qual IA está respondendo e com qual modelo | Discovery |
