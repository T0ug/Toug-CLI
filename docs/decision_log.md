# Decision Log - Toug CLI
| # | Data | Decisao | Justificativa | Agent |
|---|------|---------|---------------|-------|
| 001 | 2026-05-11 | Stack: Node.js / TypeScript | Escala futura para IDE com interface grafica; bom para CLI no MVP | Discovery |
| 002 | 2026-05-11 | API inicial: Ollama | Runtime padrao para modelos locais | Discovery |
| 003 | 2026-05-11 | Pipeline fixa e embutida no CLI | Garantir enforcement total | Discovery |
| 004 | 2026-05-11 | Servidor dedicado na rede local | Separar carga dos modelos do PC de desenvolvimento | Discovery |
| 005 | 2026-05-11 | Streaming de respostas | Feedback imediato no terminal | Discovery |
| 006 | 2026-05-11 | Aprovacao de comandos + auto-approve configuravel | Seguranca por padrao, flexibilidade quando desejado | Discovery |
| 007 | 2026-05-11 | Persistencia de sessoes em pasta local | Continuidade entre sessoes sem depender so de docs/ | Discovery |
| 008 | 2026-05-11 | Compressao de contexto | Manter sessoes longas operaveis | Architect |
| 009 | 2026-05-11 | Distribuicao via npm global | Padrao para CLIs TypeScript | Discovery |
| 010 | 2026-05-11 | Sem autenticacao no Ollama | MVP em rede local confiavel | Discovery |
| 011 | 2026-05-11 | Labels agent + modelo em cada mensagem | Transparencia sobre qual IA esta respondendo | Discovery |
| 012 | 2026-05-11 | Arquitetura de State Machine | Melhor enforcement da pipeline | Architect |
| 013 | 2026-05-11 | Controle do Docker pelo projeto | Configuracao do Ollama Server versionada junto ao projeto | Orchestrator |
| 014 | 2026-05-11 | Downsizing dos modelos locais | Evitar esgotamento de memoria no servidor | Discovery |
| 015 | 2026-05-12 | Understanding Lock aprovado para suporte inicial a Gemini | Usuario confirmou provedores globais Ollama/Gemini, Gemini via SDK oficial, streaming, function calling, fallback por API key e configuracao global | Discovery |
| 016 | 2026-05-12 | Modelos por agente deixam de ser configuracao do usuario | A verdade dos modelos por agente deve ficar fechada no codigo/regras versionadas do CLI | Discovery |
| 017 | 2026-05-12 | Mapeamento Gemini aprovado por custo-beneficio | `orchestrator`, `discovery` e `project_research` usam `gemini-2.5-flash`; `architect`, `executor` e `reviewer` usam `gemini-2.5-pro` | Discovery |
| 018 | 2026-05-12 | Configuracao especifica por projeto descartada | Nao havera configuracoes por projeto; apenas configuracao global em `~/.toug-cli` | Discovery |
| 019 | 2026-05-12 | Confirmacao obrigatoria antes de gerar artefatos | Novos projetos dependem de Discovery + `clarify-intent`; projetos existentes sem docs dependem de Project Research + `research-existing-project`; ambos exigem resumo confirmado antes de criar `docs/` | Discovery |
| 020 | 2026-05-12 | Arquitetura escolhida: Provider Layer + Tool Dispatcher + Safety Guard | Mantem o `PipelineEngine` como state machine, mas separa providers, tools, seguranca, persistencia e erros para evitar acoplamento excessivo | Architect |
| 021 | 2026-05-12 | Transicao de agentes e privada do PipelineController | O modelo nao deve decidir quando sua fase acabou nem escolher o proximo agente; o CLI valida criterios, artefatos e confirmacoes | Architect |
| 022 | 2026-05-12 | `transition_state` removido das ferramentas publicas do modelo | Gemini deve receber apenas function calls para tools operacionais; transicao de pipeline fica fora do alcance do LLM | Architect |
| 023 | 2026-05-12 | Handoff passa a ser artefato validado por template | Cada fase principal deve produzir handoff valido; transicao e bloqueada se campos minimos ou artefatos obrigatorios estiverem ausentes | Architect |
| 024 | 2026-05-12 | Config v2 separa preferencias de regras versionadas | Config global guarda provider, endpoint, API keys e auto-approve; modelos por agente ficam no `modelRegistry` do CLI | Architect |
| 025 | 2026-05-12 | Providers emitem eventos normalizados | Ollama/XML e Gemini/Function Calling convergem para `ProviderEvent` e `ToolCall`, reduzindo diferencas no `PipelineEngine` | Architect |
| 026 | 2026-05-12 | Task 011 formalizada como primeira execucao da Fase 12 | Orchestrator dividiu a implementacao em uma fundacao executavel: Provider abstraction, Config v2 e Model Registry antes de integrar Gemini real | Orchestrator |
| 027 | 2026-05-12 | Inconsistencia documental corrigida antes da execucao | Reviewer bloqueou o avanco por divergencias entre scope, implementation_plan e handoff; Orchestrator coordenou correcao minima para revalidacao | Orchestrator |
| 028 | 2026-05-12 | Revalidacao documental aprovada para Task 011 | Reviewer confirmou que scope, implementation_plan, handoff, project_status, tasks e decision_log estao alinhados para liberar Executor mediante confirmacao do usuario | Reviewer |
| 029 | 2026-05-12 | Entrega da Task 011 aprovada | Reviewer verificou as evidências no código-fonte, status de compilação e limites de escopo e aprovou a implementação da Fase 12.1. | Reviewer |
| 030 | 2026-05-12 | Task 012 modelada | Orchestrator definiu as regras precisas para fundar o provider do Gemini, focadas em `@google/genai`, Streaming e Tool calling sem impactar a rede ou interfaces legadas | Orchestrator |
| 031 | 2026-05-12 | Entrega da Task 012 aprovada | Reviewer certificou a build TS do provedor implementado com SDK do Gemini e confirmou que atende fielmente o escopo e contrato sem quebrar dependências nativas | Reviewer |
| 032 | 2026-05-12 | Task 013 planejada | Orchestrator definiu a necessidade imediata de atualizar a lógica procedural do Pipeline Engine para executar os eventos FunctionCall que o provedor emite. | Orchestrator |
| 033 | 2026-05-12 | Entrega da Task 013 aprovada | Reviewer atestou incondicionalmente a sintonia segura gerada que converte Function Calls para os matchers regex originais de aprovação interativa. | Reviewer |
| 034 | 2026-05-12 | Task 014 orquestrada | Orchestrator isolou as refatorações de UI e menu `/config` (`index.ts`) para evitar poluição visual de verificações cruas do Ollama atuando no Gemini | Orchestrator |
| 035 | 2026-05-12 | Entrega da Task 014 aprovada | Reviewer verificou as adaptações de interface nativa em `index.ts` que suprimem loggers desnecessários. Código compilado com sucesso. | Reviewer |
| 036 | 2026-05-12 | Task 015 definida e projetada | Orchestrator modelou a estrutura rígida contra crashe silencioso englobando OS command interativo para fatal error no Windows e persistência loop infinita para o contexto | Orchestrator |
| 037 | 2026-05-12 | Entrega da Task 015 aprovada | Reviewer validou a injeção do catch node via fs file-dump. Sessão Cíclica ratificada e sem loops bloqueantes no iterador do engine. | Reviewer |
| 038 | 2026-05-12 | Task 016 orquestrada | Orchestrator delimitou limites de OS para Path Traversal em files nativos e previu o uso de thead lock por evento Ctlr+c | Orchestrator |
| 039 | 2026-05-12 | Entrega da Task 016 aprovada | Reviewer validou estaticamente as seguranças implementáveis pelo Executor para a quebra de instâncias (AbortController vs SIGINT) sem bugs. | Reviewer |
| 040 | 2026-05-12 | Task 017 orquestrada | Orchestrator mapeou a mitigação de early-writes nos agentes de Discovery e decretou fundação terminal para a Fase 12 | Orchestrator |
| 041 | 2026-05-12 | Entrega da Task 017 aprovada e Conclusão da Fase 12 | Reviewer validou os escapes impositivos dentro das injeções puramente textuais de `agentLoader.ts`. Nenhuma colisão estrutural observada, atestando Fase 12 com êxito final | Reviewer |
| 042 | 2026-05-12 | Fallback por modelo antes de fallback por API key | Modelos Gemini free tier esgotam rápido (2.5-pro: 2 RPM/50 RPD). Trocar modelo antes de key multiplica capacidade | Discovery |
| 043 | 2026-05-12 | Modelos Ollama unificados em qwen3 | Descarte de gemma3:4b, deepseek-r1:8b, qwen2.5-coder:7b. Apenas qwen3:14b (primário) e qwen3:8b (fallback) mantidos | Discovery |
| 044 | 2026-05-12 | Ollama como último fallback no modo Gemini | Cadeia: modelos Gemini → troca API key → repete → Ollama. Ollama offline apenas printa aviso | Discovery |
| 045 | 2026-05-12 | Descarregamento explícito de modelo Ollama antes de fallback | Servidor CPU-only 32GB RAM não suporta 2 modelos simultâneos. CLI descarrega via API antes de carregar próximo | Discovery |
| 046 | 2026-05-12 | Divisão multi-modelo por prompt adiada | Complexidade arquitetural incompatível com escopo atual. Registrada como evolução futura | Discovery |
| 047 | 2026-05-12 | gemini-1.5-flash mantido como terceiro fallback Flash | Benchmarks confirmam superioridade sobre qwen3:14b local (HumanEval 74% vs 55-60%) | Discovery |
| 048 | 2026-05-12 | Sistema de menções @ resolvido pelo CLI | Resolução de arquivos/diretórios feita pelo CLI sem consumo de tokens. Deduplicação por sessão | Discovery |
| 049 | 2026-05-12 | Gestão de sessões com /sessoes | Listar, renomear e retomar qualquer sessão anterior, não apenas a mais recente | Discovery |
| 050 | 2026-05-12 | Apelidos obrigatórios para API keys | Nickname no cadastro, exibido no terminal ao lado do modelo para identificação | Discovery |
| 051 | 2026-05-12 | Contexto expandido de 50 para 100 mensagens | Threshold de compressão dobrado. keepLast mantém 10 | Discovery |
| 052 | 2026-05-12 | Routing heurístico com confirmação do usuário | CLI detecta tarefa simples por regras, pergunta se quer desviar para Ollama. Sem automação silenciosa | Discovery |
| 053 | 2026-05-12 | Pré-processamento de menções isolado no CLI | Resolução de arquivos `@` fará injeção de texto direto no prompt em vez de Tool Calling oculto no Gemini. Preserva tokens e isola provider | Architect |
| 054 | 2026-05-12 | Lógica de fallback residente no PipelineEngine | O loop de retentativas ficará no orquestrador global para centralizar o fallback de API keys, modelos e até queda para o Ollama | Architect |
| 055 | 2026-05-12 | Migração de Config nativa | Atualização do tipo array de strings para array de objetos `{key, alias}` com compatibilidade legada silenciosa | Architect |
| 056 | 2026-05-13 | Thinking display em cinza escuro | Raciocínio da IA exibido em `\x1b[90m` antes da resposta final, com toggle no /config | Discovery |
| 057 | 2026-05-13 | Menus interativos com setas do teclado | Substituir todas as seleções Y/N e numéricas por navegação ↑/↓ + Enter via raw stdin nativo | Discovery |
| 058 | 2026-05-13 | Menu principal com 3 opções | Remover análise do diretório visual e prompt de retomar sessão; exibir "Nova conversa / Configurações / Sessões anteriores" | Discovery |
| 059 | 2026-05-13 | ToolRunner com stdin conectado | Usar spawn com stdio inherit para permitir comandos interativos como Read-Host | Discovery |
| 060 | 2026-05-13 | Fix Ctrl+C durante streaming | Corrigir AbortController para interromper geração sem travar terminal | Discovery |
| 061 | 2026-05-13 | Fluxo completo de API keys com apelido | Pedir alias após key com hint dimmed, perguntar se quer adicionar outra | Discovery |
| 062 | 2026-05-13 | Abordagem A: Componentes isolados | selectMenu.ts como módulo reutilizável + thinking_delta como novo ProviderEvent | Architect |
| 063 | 2026-05-13 | thinking_delta separado de text_delta | Não polui o evento de texto, permite toggle sem modificar providers | Architect |
| 064 | 2026-05-13 | Thinking não entra no histórico | Economiza tokens, raciocínio é efêmero e serve apenas para visualização | Architect |
| 065 | 2026-05-13 | Raw mode nativo sem dependência externa | selectMenu simples o suficiente para implementar com process.stdin.setRawMode | Architect |
| 066 | 2026-05-13 | spawn com stdio inherit perde captura de output | Trade-off aceito: interatividade do usuário vale mais que captura de texto para devolver ao modelo | Architect |
| 067 | 2026-05-13 | Estado documental da Task 024 realinhado | `tasks.md` foi atualizado para refletir `project_status.md`, `handoff.md` e `task_024.md`: Task 024 implementada pelo Executor e aguardando validação do Reviewer | Orchestrator |
| 068 | 2026-05-13 | Entrega da Task 024 aprovada com ressalvas | Reviewer validou evidencias em providers, OllamaClient e PipelineEngine; build compilou apos restaurar dependencias. Teste ao vivo com Ollama/Gemini nao foi executado neste ambiente | Reviewer |
| 069 | 2026-05-13 | Entrega da Task 025 aprovada com ressalvas | Reviewer validou ToolRunner com spawn stdio inherit, propagacao de abortSignal e build; testes manuais reais de Ctrl+C e Read-Host ficaram pendentes para ambiente interativo | Reviewer |
| 070 | 2026-05-13 | Ctrl+C da Task 025 validado manualmente | Usuario atestou em ambiente interativo que Ctrl+C durante streaming esta funcionando; ressalva restante fica restrita ao teste real de Read-Host | Reviewer |
| 071 | 2026-05-13 | Entrega da Task 026 aprovada com ressalvas e Fase 14 concluida | Reviewer validou menu principal, migracao de selecoes para selectMenu, fluxo de API keys, aprovacoes de ferramentas e build; testes manuais finais de UX interativa ficam pendentes | Reviewer |
| 072 | 2026-05-13 | Corrigido encerramento imediato do selectMenu no PowerShell | Teste manual mostrou que o menu renderizava e o processo encerrava; `selectMenu.ts` passou a chamar `process.stdin.resume()` apos pausar o readline e ativar raw mode | Executor |
| 073 | 2026-05-13 | Corrigida renderizacao de listas longas em sessoes | Teste manual mostrou sobreposicao visual em `/sessoes`; `selectMenu.ts` passou a paginar menus longos e `/sessoes` passou a selecionar sessao antes da acao carregar/apagar | Executor |
| 074 | 2026-05-13 | Sessao logica passa a ser arquivo ativo da conversa | Teste manual mostrou multiplas entradas com segundos de diferenca; salvamentos agora atualizam o arquivo ativo e `/sessoes` pagina 5 entradas por vez com total e pagina atual | Executor |
| 075 | 2026-05-13 | Persistencia de sessoes passa a usar pastas | Para tornar claro o que conta como sessao no disco, cada sessao passa a viver em `<hash-do-projeto>/<session_id>/session.json`, com migracao best-effort dos JSON legados | Executor |
| 076 | 2026-05-13 | Menu principal acessivel via `/menu` | Usuario solicitou retorno ao menu sem encerrar o CLI; comando volta para o menu principal e nova conversa limpa o historico atual | Executor |
| 077 | 2026-05-13 | Ordem das API Keys Gemini e a prioridade de fallback | Gerenciamento de keys no `/config` passa a permitir renomear, apagar e mover keys; a ordem do array `gemini.apiKeys` define a prioridade usada no fallback | Executor |
| 078 | 2026-05-13 | Gemini thinking depende de partes `thought` no stream | O CLI solicita `includeThoughts` e `thinkingBudget: -1`, mas a exibicao so ocorre se Gemini retornar partes marcadas como pensamento | Executor |
| 079 | 2026-05-13 | Fallback Gemini centralizado no PipelineEngine | Provider Gemini deixa de tentar keys internamente para que a ordem modelo -> key -> Ollama seja controlada e exibida por uma unica camada | Executor |
| 080 | 2026-05-13 | Fallback Gemini troca modelo antes de API key | Usuario confirmou preferencia por esgotar os modelos da key atual antes de trocar para a proxima key, alinhando o codigo a decisao 042 | Executor |
| 081 | 2026-05-13 | Menus preservam blocos informativos ao redesenhar | Navegacao por setas limpava informacoes acima ou acumulava menus; `selectMenu` agora limpa apenas as linhas que ele proprio renderizou | Executor |
| 082 | 2026-05-13 | Handoff da Task 026 realinhado apos validacao | `project_status.md` e `review_report.md` ja registravam Task 026 aprovada com ressalvas; handoff foi atualizado para apontar Orchestrator e validacao manual final como proxima acao | Orchestrator |
| 083 | 2026-05-13 | Validacao manual final da Fase 14 atestada | Usuario confirmou que os testes manuais de UX interativa, sessoes, config, menu, API keys e thinking foram validados; pendencias restantes passam a ser push/publicacao | Orchestrator |
| 084 | 2026-05-13 | Comandos Windows padronizados em PowerShell | `ls` nao e comando nativo universal no Windows; ToolRunner passa a chamar `powershell.exe` explicitamente e prompts orientam uso de cmdlets PowerShell como `Get-ChildItem` | Executor |
| 085 | 2026-05-14 | Inconsistencia documental da Fase 14 corrigida | `docs/tasks.md` mantinha tres itens residuais desmarcados apesar de `project_status.md`, `handoff.md` e tasks formais 023-026 indicarem Fase 14 concluida e validada manualmente | Orchestrator |
| 086 | 2026-05-14 | Fase 15 Discovery confirmada | Usuario confirmou terminal externo persistente por sessao, log persistente bruto, `/terminal`, `@terminal`, `/help` e fallback unico de modelos para todos os agentes | Discovery |
| 087 | 2026-05-14 | Logs de terminal serao enviados brutos para IA | Usuario aceitou que `@terminal` envie log sem redaction automatica, inclusive quando o provider ativo for cloud | Discovery |
| 088 | 2026-05-14 | Fallback unico para todos os agentes | Ordem confirmada: gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash, gemini-2.5-flash-lite, gemini-2.0-flash-lite, qwen3:14b, qwen3:8b | Discovery |
| 089 | 2026-05-14 | Arquitetura Fase 15 usara PowerShell persistente com fila em arquivo | Usuario aprovou a Abordagem A para manter terminal externo persistente por sessao, comando e output em log unico, e execucao via fila observada por runner PowerShell | Architect |
| 090 | 2026-05-14 | Arquitetura da Fase 15 confirmada | Usuario confirmou `docs/architecture_fase15.md`; Task 027 concluida e proximas tasks formais 028-032 foram materializadas para implementacao e validacao | Architect |
| 091 | 2026-05-14 | Task 028 liberada para execucao | Orchestrator validou consistencia entre project_status, handoff, tasks, decision_log, architecture_fase15 e task_028; proxima acao e Executor com implement-task | Orchestrator |
| 092 | 2026-05-14 | Task 028 implementada | Executor adicionou base de sessao ativa e terminalSessionManager para paths, artefatos e leitura de logs por sessao; entrega aguarda Reviewer | Executor |
| 093 | 2026-05-14 | Task 028 aprovada | Reviewer validou codigo, handoff e evidencias; escopo foi cumprido sem implementar PowerShell externo, runner, mencoes, comandos internos ou fallback | Reviewer |
| 094 | 2026-05-14 | Task 029 liberada para execucao | Orchestrator confirmou que Task 028 foi aprovada e que Task 029 possui escopo e dependencias alinhados para Executor com implement-task | Orchestrator |
| 095 | 2026-05-14 | Task 029 implementada | Executor substituiu execucao direta por runner PowerShell com fila JSON Lines, log persistente por sessao e retorno de comando baseado em terminal.log real | Executor |
| 096 | 2026-05-14 | Task 029 aprovada com ressalvas | Reviewer validou fila, log real, build e remocao de sucesso sintetico; ressalva restante e a dependencia ambiental da janela PowerShell visual, a ser observada na Task 030 | Reviewer |
| 097 | 2026-05-14 | Task 030 liberada para execucao | Orchestrator confirmou que Task 029 foi validada e que os comandos `/terminal`, `/help` e mencoes `@terminal` podem ser implementados sobre a base existente | Orchestrator |
| 098 | 2026-05-14 | Task 030 implementada | Executor adicionou `/terminal`, `/help` e parser especial de `@terminal` e `@terminal:N` antes das mencoes genericas de arquivos | Executor |
| 099 | 2026-05-14 | Task 030 aprovada com ressalvas | Reviewer validou comandos e mencoes de terminal; ressalva leve fica para validacao visual manual de `/terminal` | Reviewer |
| 100 | 2026-05-14 | Task 031 liberada para execucao | Orchestrator confirmou que Task 030 foi validada e que a proxima mudanca deve unificar o fallback de modelos para todos os agentes | Orchestrator |
| 101 | 2026-05-14 | Task 031 implementada | Executor substituiu listas por agente por `GLOBAL_FALLBACK_MODELS` e adaptou o PipelineEngine para rotas globais com Gemini Pro primeiro e Qwen via Ollama no final | Executor |
| 102 | 2026-05-14 | Task 031 aprovada com ressalvas | Reviewer validou ordem global, ausencia de listas por agente, build e modelo inicial Gemini Pro para todos os agentes; quota real Gemini nao foi provocada | Reviewer |
| 103 | 2026-05-14 | Task 032 liberada para validacao integrada | Orchestrator confirmou Tasks 028-031 validadas e liberou revisao integrada final da Fase 15 | Orchestrator |
| 104 | 2026-05-14 | Task 032 aprovada com ressalvas e Fase 15 concluida | Reviewer validou build, remocao de sucesso sintetico, log real do terminal, `@terminal`, `/help` e fallback global; validacao visual completa do PowerShell externo e quota real Gemini ficam como ressalvas operacionais | Reviewer |
| 105 | 2026-05-14 | Hotfix de abertura visual do terminal persistente | Usuario confirmou que `/terminal` criava log sem abrir janela; `terminalSessionManager` passou a usar `wt.exe` com fallback `cmd start` e removeu fallback headless silencioso | Executor |
| 106 | 2026-05-14 | Hotfix de leitura concorrente do terminal.log | Teste manual mostrou `EBUSY` ao ler log enquanto o runner escrevia output volumoso; leituras de log agora fazem retry em locks transitorios e `run_command` continua observando ate o timeout | Executor |
| 107 | 2026-05-14 | Hotfix de isolamento do contexto de terminal | Usuario esclareceu que o gatilho de terminal nao deve ser enviado literalmente para IA; CLI remove marcador interno antes do historico e bloqueia ferramentas em rodada de leitura de log | Executor |
| 108 | 2026-05-14 | Hotfix de status e bloqueio de transicao por modelo | Pergunta sobre estado da pipeline provocou transicao indevida e escrita de arquivos; CLI agora responde `/status`/perguntas de estado internamente e bloqueia `transition_state` do modelo | Executor |
| 109 | 2026-05-14 | Fase 15 validada sem ressalvas pelo owner | Owner confirmou a validacao manual final da Fase 15 apos hotfixes de terminal persistente, contexto `@terminal`, leitura de log e bloqueio de transicoes indevidas | Reviewer |
| 110 | 2026-05-14 | README detalhado atualizado para Fase 15 | README passou a documentar visao geral do sistema, estado validado sem ressalvas, uso, comandos, terminal persistente, fallback global, sessoes, seguranca e troubleshooting | Reviewer |
| 111 | 2026-05-14 | Fallback global atualizado para Gemini 3 | Ordem passa a priorizar `gemini-3.1-pro-preview`, `gemini-3-flash-preview` e `gemini-3.1-flash-lite`, mantendo Gemini 2.5/2.0 e Qwen3 como fallback; pacote passa para `1.1.13` | Executor |
| 112 | 2026-05-14 | Fallback informa rota bem-sucedida | Apos uma falha de rota e sucesso em fallback, o CLI imprime provider, modelo e alias da key Gemini usada; pacote passa para `1.1.14` | Executor |
| 113 | 2026-05-14 | Toug prefere Windows Terminal ao iniciar via cmd.exe | Quando iniciado pelo `cmd.exe` classico, o CLI pode relancar no Windows Terminal, instalar via winget com confirmacao e salvar preferencia interna sem expor controle no `/config`; pacote passa para `1.1.15` | Executor |
| 114 | 2026-05-14 | Hotfix da deteccao de console Windows no npm global | `CMDCMDLINE` nao foi confiavel no shim global do npm em Windows 10; deteccao passa a usar console Windows interativo fora de WT e fora de `npm run`; pacote passa para `1.1.16` | Executor |
