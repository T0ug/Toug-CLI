"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineEngine = void 0;
const agentLoader_1 = require("../agents/agentLoader");
const ollamaClient_1 = require("./ollamaClient");
const configManager_1 = require("../data/configManager");
const chatInterface_1 = require("../cli/chatInterface");
const toolRunner_1 = require("./toolRunner");
class PipelineEngine {
    state = 'IDLE';
    ollamaClient;
    history = [];
    constructor() {
        this.ollamaClient = new ollamaClient_1.OllamaClient();
    }
    getState() {
        return this.state;
    }
    transition(newState) {
        console.log(`\n[PipelineEngine] State Transition: ${this.state} -> ${newState}`);
        this.state = newState;
    }
    getRoleForState(state) {
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
    getModelForRole(role) {
        const config = (0, configManager_1.loadConfig)();
        return config.models[role] || config.models.orchestrator;
    }
    getActiveConfig() {
        const role = this.getRoleForState(this.state);
        const model = this.getModelForRole(role);
        return { role, model };
    }
    async *processInput(userInput) {
        if (this.state === 'IDLE') {
            this.transition('ORCHESTRATING');
        }
        let keepRunning = true;
        this.history.push({ role: 'user', content: userInput });
        while (keepRunning) {
            keepRunning = false;
            const role = this.getRoleForState(this.state);
            const agent = (0, agentLoader_1.loadAgent)(role);
            const model = this.getModelForRole(role);
            const config = (0, configManager_1.loadConfig)();
            const messages = [
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
                    }
                    else if (tagBuffer.length > 35 && !tagBuffer.includes('<run_command>')) {
                        // Alarme falso. Solte o buffer represado para o dev
                        yield tagBuffer;
                        tagBuffer = '';
                        insideTag = false;
                    }
                }
                else {
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
                    const ans = await (0, chatInterface_1.promptUser)(`\n${chatInterface_1.COLORS.YELLOW}[SYSTEM] A IA solicitou rolar no shell: '${command}'. Permitir? Y/n: ${chatInterface_1.COLORS.RESET}`);
                    if (ans.toLowerCase() !== 'n') {
                        approved = true;
                    }
                }
                if (approved) {
                    yield `\n${chatInterface_1.COLORS.YELLOW}[Executando no Sistema O.S...]\n${chatInterface_1.COLORS.RESET}`;
                    const result = await (0, toolRunner_1.executeShellCommand)(command);
                    this.history.push({ role: 'system', content: `Resultado do comando '${command}':\n${result}` });
                    keepRunning = true; // Auto re-engatilha
                }
                else {
                    this.history.push({ role: 'system', content: `O usuário RECUSOU a execução do comando '${command}'. Lide com a recusa.` });
                    keepRunning = true; // Devolve pra IA saber que falhou e contornar
                }
            }
        }
    }
}
exports.PipelineEngine = PipelineEngine;
