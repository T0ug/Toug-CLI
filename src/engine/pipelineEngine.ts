import { PipelineState, AgentRole } from '../agents/types';
import { loadAgent } from '../agents/agentLoader';
import { OllamaClient, Message } from './ollamaClient';
import { loadConfig } from '../data/configManager';
import { promptUser, COLORS } from '../cli/chatInterface';
import { executeShellCommand } from './toolRunner';

export class PipelineEngine {
    private state: PipelineState = 'IDLE';
    private ollamaClient: OllamaClient;
    private history: Message[] = [];

    constructor() {
        this.ollamaClient = new OllamaClient();
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
        return config.models[role] || config.models.orchestrator;
    }

    public getActiveConfig() {
        const role = this.getRoleForState(this.state);
        const model = this.getModelForRole(role);
        return { role, model };
    }

    public async *processInput(userInput: string): AsyncGenerator<string, void, unknown> {
        if (this.state === 'IDLE') {
            this.transition('ORCHESTRATING');
        }

        let keepRunning = true;
        this.history.push({ role: 'user', content: userInput });

        while (keepRunning) {
            keepRunning = false;

            const role = this.getRoleForState(this.state);
            const agent = loadAgent(role);
            const model = this.getModelForRole(role);
            const config = loadConfig();

            const messages: Message[] = [
                { role: 'system', content: agent.systemPrompt },
                ...this.history
            ];

            const stream = this.ollamaClient.streamChat(model, messages);
            let assistantResponse = '';

            let tagBuffer = '';
            let insideTag = false;

            for await (const chunk of stream) {
                assistantResponse += chunk;

                if (chunk.includes('<') || insideTag) {
                    insideTag = true;
                    tagBuffer += chunk;

                    if (tagBuffer.includes('</run_command>')) {
                        insideTag = false;
                        // Mutar totalmente do stdout da interface o xml secreto
                    } else if (tagBuffer.length > 35 && !tagBuffer.includes('<run_command>')) {
                        // Alarme falso. Solte o buffer represado para o dev
                        yield tagBuffer;
                        tagBuffer = '';
                        insideTag = false;
                    }
                } else {
                    yield chunk;
                }
            }

            this.history.push({ role: 'assistant', content: assistantResponse });

            // Verificar se na string capturada por completo existia algo para o Sistema:
            const match = /<run_command>([\s\S]*?)<\/run_command>/i.exec(assistantResponse);
            if (match) {
                const command = match[1].trim();
                let approved = config.autoApproveMode;

                if (!approved) {
                    const ans = await promptUser(`\n${COLORS.YELLOW}[SYSTEM] A IA solicitou rolar no shell: '${command}'. Permitir? Y/n: ${COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n') {
                        approved = true;
                    }
                }

                if (approved) {
                    yield `\n${COLORS.YELLOW}[Executando no Sistema O.S...]\n${COLORS.RESET}`;
                    const result = await executeShellCommand(command);
                    this.history.push({ role: 'system', content: `Resultado do comando '${command}':\n${result}` });
                    keepRunning = true; // Auto re-engatilha
                } else {
                    this.history.push({ role: 'system', content: `O usuário RECUSOU a execução do comando '${command}'. Lide com a recusa.` });
                    keepRunning = true; // Devolve pra IA saber que falhou e contornar
                }
            }
        }
    }
}
