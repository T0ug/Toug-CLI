import { PipelineState, AgentRole } from '../agents/types';
import { loadAgent } from '../agents/agentLoader';
import { Message } from './ollamaClient';
import { loadConfig } from '../data/configManager';
import { COLORS } from '../cli/chatInterface';
import { selectMenu } from '../cli/selectMenu';
import { executeShellCommand } from './toolRunner';
import { readArtifact, writeArtifact } from './artifactManager';
import { getModelsForProviderRole } from '../agents/modelRegistry';
import { createProvider } from './providerFactory';
import { AIProvider, ProviderMessage } from '../providers/types';
import { saveSession } from '../data/sessionManager';

export class PipelineEngine {
    private state: PipelineState = 'IDLE';
    private provider: AIProvider;
    private history: Message[] = [];
    public isGenerating: boolean = false;
    private currentAbortController: AbortController | null = null;

    public abortCurrentStream(): boolean {
        if (this.isGenerating && this.currentAbortController) {
            this.currentAbortController.abort();
            return true;
        }
        return false;
    }

    constructor() {
        this.provider = createProvider();
    }

    public getState(): PipelineState {
        return this.state;
    }

    public transition(newState: PipelineState): void {
        console.log(`\n[PipelineEngine] State Transition: ${this.state} -> ${newState}`);
        this.state = newState;
    }

    private getRoleForState(state: PipelineState): AgentRole {
        switch (state) {
            case 'DISCOVERY': return 'discovery';
            case 'ARCHITECT': return 'architect';
            case 'EXECUTING': return 'executor';
            case 'REVIEW': return 'reviewer';
            case 'ORCHESTRATING': return 'orchestrator';
            case 'PROJECT_RESEARCH': return 'project_research';
            default: return 'orchestrator';
        }
    }

    private getModelForRole(role: AgentRole): string {
        const config = loadConfig();
        return getModelsForProviderRole(config.lastProvider, role)[0];
    }

    public injectContext(content: string): void {
        this.history.push({ role: 'system', content });
    }

    public getHistory(): Message[] {
        return this.history;
    }

    public setHistory(history: Message[]): void {
        this.history = history;
    }

    public clearHistory(): void {
        this.history = [];
    }

    public setState(state: PipelineState): void {
        this.state = state;
    }

    public getActiveConfig() {
        const role = this.getRoleForState(this.state);
        const config = loadConfig();
        const provider = config.lastProvider;
        const model = this.getModelForRole(role);
        const keyAlias = provider === 'gemini' && config.gemini?.apiKeys?.length > 0 ? config.gemini.apiKeys[0].alias : undefined;
        return { provider, role, model, keyAlias };
    }

    public async *processInput(userInput: string): AsyncGenerator<string, void, unknown> {
        if (this.state === 'IDLE') {
            this.transition('ORCHESTRATING');
        }

        let keepRunning = true;
        this.history.push({ role: 'user', content: userInput });
        saveSession(this.history, this.state, process.cwd());

        try {
            while (keepRunning) {
                keepRunning = false;
                this.isGenerating = true;
                this.currentAbortController = new AbortController();

                const role = this.getRoleForState(this.state);
                const agent = loadAgent(role);
                const config = loadConfig();

                const messages: ProviderMessage[] = [
                    { role: 'system', content: agent.systemPrompt },
                    ...this.history
                ];

                let assistantResponse = '';
                let generationSuccessful = false;

                // Controle de Fallback
                let currentProvider = config.lastProvider;
                let modelsToTry = getModelsForProviderRole(currentProvider, role);
                let currentModelIndex = 0;
                let currentKeyIndex = 0;

                while (!generationSuccessful && !this.currentAbortController?.signal.aborted) {
                    this.provider = createProvider(currentProvider);
                    const model = modelsToTry[currentModelIndex];

                    try {
                        const stream = this.provider.stream({
                            provider: currentProvider,
                            model,
                            messages,
                            tools: [],
                            abortSignal: this.currentAbortController.signal,
                            metadata: {
                                cwd: process.cwd(),
                                state: this.state,
                                agentRole: role,
                                apiKeyIndex: currentKeyIndex
                            }
                        });

                        assistantResponse = '';
                        let tagBuffer = '';
                        let insideTag = false;

                        for await (const event of stream) {
                            if (this.currentAbortController?.signal.aborted) {
                                yield `\n${COLORS.YELLOW}[SYSTEM] Geracao interrompida pelo usuario.${COLORS.RESET}\n`;
                                keepRunning = false;
                                break;
                            }

                            if (event.type === 'error') {
                                if (this.currentAbortController?.signal.aborted) {
                                    yield `\n${COLORS.YELLOW}[SYSTEM] Geracao interrompida pelo usuario.${COLORS.RESET}\n`;
                                    keepRunning = false;
                                    break;
                                }
                                throw new Error(event.error.message);
                            }

                            if (event.type === 'done') {
                                generationSuccessful = true;
                                break;
                            }

                            if (event.type === 'tool_call') {
                                const { name, args } = event.call;
                                yield `\n${COLORS.MAGENTA}[Function Calling nativo detectado: ${name}]${COLORS.RESET}\n`;

                                if (name === 'run_command') {
                                    assistantResponse += `<run_command>\n${args.command || ''}\n</run_command>`;
                                } else if (name === 'read_file') {
                                    assistantResponse += `<read_file>\n${args.path || ''}\n</read_file>`;
                                } else if (name === 'write_file') {
                                    assistantResponse += `<write_file path="${args.path || ''}">\n${args.content || ''}\n</write_file>`;
                                }
                                generationSuccessful = true;
                                break;
                            }

                            if (event.type === 'thinking_delta') {
                                if (config.showThinking) {
                                    yield `${COLORS.DIM}${event.text}${COLORS.RESET}`;
                                }
                                continue;
                            }

                            if (event.type !== 'text_delta') {
                                continue;
                            }

                            const chunk = event.text;
                            assistantResponse += chunk;

                            if (chunk.includes('<') || insideTag) {
                                if (!insideTag) {
                                    insideTag = true;
                                    const splitIdx = chunk.indexOf('<');
                                    if (splitIdx > 0) {
                                        yield chunk.substring(0, splitIdx);
                                        tagBuffer += chunk.substring(splitIdx);
                                    } else {
                                        tagBuffer += chunk;
                                    }
                                } else {
                                    tagBuffer += chunk;
                                }

                                const isOpening = /<(run_command|read_file|write_file|transition_state)/.test(tagBuffer);
                                const isClosing = /<\/(run_command|read_file|write_file|transition_state)>/.test(tagBuffer);

                                if (isClosing) {
                                    insideTag = false;
                                    yield `\n${COLORS.MAGENTA}[Ferramenta detectada. Interceptando e executando...]${COLORS.RESET}\n`;
                                    generationSuccessful = true;
                                    break;
                                } else if (tagBuffer.length > 35 && !isOpening) {
                                    yield tagBuffer;
                                    tagBuffer = '';
                                    insideTag = false;
                                }
                            } else {
                                yield chunk;
                            }
                        }

                        if (this.currentAbortController?.signal.aborted) {
                            break;
                        }

                    } catch (error: any) {
                        if (this.currentAbortController?.signal.aborted || error?.name === 'AbortError') {
                            yield `\n${COLORS.YELLOW}[SYSTEM] Geracao interrompida pelo usuario.${COLORS.RESET}\n`;
                            keepRunning = false;
                            break;
                        }

                        const errMsg = error.message.toLowerCase();
                        const isExhausted = errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('resource');

                        if (currentProvider === 'gemini') {
                            if (isExhausted) {
                                const keyAlias = config.gemini.apiKeys[currentKeyIndex]?.alias || `Chave ${currentKeyIndex}`;
                                yield `\n${COLORS.YELLOW}[Fallback] Limite atingido no Gemini (Model: ${model}, Key: ${keyAlias}). Tentando proxima rota...${COLORS.RESET}\n`;

                                currentModelIndex++;

                                if (currentModelIndex >= modelsToTry.length) {
                                    currentModelIndex = 0;
                                    currentKeyIndex++;

                                    const maxKeys = config.gemini.apiKeys.length || 1;
                                    if (currentKeyIndex >= maxKeys) {
                                        yield `\n${COLORS.YELLOW}[Fallback] Todas as rotas Gemini esgotadas. Trocando para Ollama local...${COLORS.RESET}\n`;
                                        currentProvider = 'ollama';
                                        modelsToTry = getModelsForProviderRole('ollama', role);
                                        currentModelIndex = 0;
                                    }
                                }
                                continue;
                            } else {
                                throw error; // Fatais
                            }
                        } else if (currentProvider === 'ollama') {
                            yield `\n${COLORS.YELLOW}[Fallback] Erro no Ollama (Model: ${model}). Tentando proximo modelo...${COLORS.RESET}\n`;
                            currentModelIndex++;

                            if (currentModelIndex >= modelsToTry.length) {
                                throw new Error(`Ollama falhou em todos os modelos de fallback. Ultimo erro: ${error.message}`);
                            }

                            const { OllamaClient } = await import('./ollamaClient');
                            const client = new OllamaClient();
                            yield `\n${COLORS.YELLOW}[SYSTEM] Descarregando modelo ${model} da RAM para liberar espaco...${COLORS.RESET}\n`;
                            await client.unloadModel(model);
                            continue;
                        } else {
                            throw error;
                        }
                    }
                }

                if (!generationSuccessful) {
                    break;
                }

                this.history.push({ role: 'assistant', content: assistantResponse });

                // === TOOL: run_command ===
                const cmdMatch = /<run_command>([\s\S]*?)<\/run_command>/i.exec(assistantResponse);
                if (cmdMatch) {
                    const command = cmdMatch[1].trim();
                    let approved = config.autoApproveMode;
                    if (!approved) {
                        yield `\n${COLORS.YELLOW}[TOOL] Executar comando: '${command}'${COLORS.RESET}\n`;
                        const ans = await selectMenu([
                            { label: 'Sim', value: 'yes' },
                            { label: 'Nao', value: 'no' }
                        ], 'Permitir execucao?');
                        approved = ans === 'yes';
                    }
                    if (approved) {
                        yield `\n${COLORS.YELLOW}[Executando...]${COLORS.RESET}\n`;
                        const result = await executeShellCommand(command);
                        this.history.push({ role: 'user', content: `[TOOL RESULT] Resultado do comando '${command}':\n${result}` });
                    } else {
                        this.history.push({ role: 'user', content: `[TOOL RESULT] Usuário RECUSOU execução de '${command}'.` });
                    }
                    keepRunning = true;
                }

                // === TOOL: read_file ===
                const readMatch = /<read_file>([\s\S]*?)<\/read_file>/i.exec(assistantResponse);
                if (readMatch) {
                    const filePath = readMatch[1].trim();
                    const cwd = process.cwd();
                    const content = readArtifact(filePath, cwd);
                    this.history.push({ role: 'user', content: `[TOOL RESULT] Conteúdo de '${filePath}':\n${content}` });
                    yield `\n${COLORS.CYAN}[Lido: ${filePath}]${COLORS.RESET}\n`;
                    keepRunning = true;
                }

                // === TOOL: write_file ===
                const writeMatch = /<write_file\s+path="([^"]+)">(([\s\S]*?))<\/write_file>/i.exec(assistantResponse);
                if (writeMatch) {
                    const filePath = writeMatch[1].trim();
                    const fileContent = writeMatch[2];
                    let approved = config.autoApproveMode;
                    if (!approved) {
                        const preview = fileContent.length > 200 ? fileContent.substring(0, 200) + '...' : fileContent;
                        yield `\n${COLORS.YELLOW}[TOOL] Gravar arquivo: '${filePath}'\nPreview: ${preview}${COLORS.RESET}\n`;
                        const ans = await selectMenu([
                            { label: 'Sim', value: 'yes' },
                            { label: 'Nao', value: 'no' }
                        ], 'Permitir gravacao?');
                        approved = ans === 'yes';
                    }
                    if (approved) {
                        const cwd = process.cwd();
                        const result = writeArtifact(filePath, fileContent, cwd);
                        this.history.push({ role: 'user', content: `[TOOL RESULT] ${result}` });
                        yield `\n${COLORS.GREEN}[Gravado: ${filePath}]${COLORS.RESET}\n`;
                    } else {
                        this.history.push({ role: 'user', content: `[TOOL RESULT] Usuário RECUSOU gravação de '${filePath}'.` });
                    }
                    keepRunning = true;
                }

                // === TOOL: transition_state ===
                const transMatch = /<transition_state>([\s\S]*?)<\/transition_state>/i.exec(assistantResponse);
                if (transMatch) {
                    const newState = transMatch[1].trim().toUpperCase() as PipelineState;
                    this.transition(newState);
                    this.history.push({ role: 'system', content: `[SYSTEM] Transição efetuada com sucesso para o estado: ${newState}. O novo agente agora assume o controle da conversa.` });
                    yield `\n${COLORS.CYAN}[Estado alterado para: ${newState}]${COLORS.RESET}\n`;
                    keepRunning = true;
                }

                saveSession(this.history, this.state, process.cwd());
            }
        } finally {
            this.isGenerating = false;
            this.currentAbortController = null;
        }
    }
}
