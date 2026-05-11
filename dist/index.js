#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pipelineEngine_1 = require("./engine/pipelineEngine");
const ollamaClient_1 = require("./engine/ollamaClient");
const projectDetector_1 = require("./engine/projectDetector");
const chatInterface_1 = require("./cli/chatInterface");
async function main() {
    const logo = `
\x1b[35m████████╗ ██████╗ ██╗   ██╗ ██████╗ \x1b[0m
\x1b[35m╚══██╔══╝██╔═══██╗██║   ██║██╔════╝ \x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║  ███╗\x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║   ██║\x1b[0m
\x1b[35m   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝\x1b[0m
\x1b[35m   ╚═╝░░░░╚═════╝░░╚═════╝░░╚═════╝░\x1b[0m
`;
    console.log(logo);
    // === Health Check ===
    const client = new ollamaClient_1.OllamaClient();
    const healthy = await client.isHealthy();
    if (!healthy) {
        (0, chatInterface_1.printError)("O servidor Ollama não está acessível. Inicializando em MODO OFFLINE.", null);
        console.log(`   ${chatInterface_1.COLORS.YELLOW}Requisições vão falhar até que o container Docker esteja rodando.${chatInterface_1.COLORS.RESET}\n`);
    }
    else {
        console.log(`${chatInterface_1.COLORS.GREEN}✅ Servidor Ollama operante.${chatInterface_1.COLORS.RESET}\n`);
    }
    // === Detecção Inteligente de Projeto ===
    const cwd = process.cwd();
    const projectState = (0, projectDetector_1.detectProjectState)(cwd);
    console.log(`${chatInterface_1.COLORS.CYAN}📂 Análise do diretório: ${cwd}${chatInterface_1.COLORS.RESET}`);
    console.log(projectState.summary);
    const engine = new pipelineEngine_1.PipelineEngine();
    if (projectState.isExistingProject && projectState.hasProjectStatus) {
        console.log(`\n${chatInterface_1.COLORS.GREEN}🔄 Projeto existente detectado. Entrando em modo Orchestrator.${chatInterface_1.COLORS.RESET}`);
        engine.transition('ORCHESTRATING');
        // Injetar contexto do project_status no histórico para warm-start
        if (projectState.projectStatusContent) {
            engine.injectContext(`Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`);
        }
    }
    else if (projectState.isExistingProject) {
        console.log(`\n${chatInterface_1.COLORS.YELLOW}🔍 Projeto detectado sem documentação completa. Entrando em modo Project Research.${chatInterface_1.COLORS.RESET}`);
        engine.transition('PROJECT_RESEARCH');
    }
    else {
        console.log(`\n${chatInterface_1.COLORS.MAGENTA}🌱 Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${chatInterface_1.COLORS.RESET}`);
        engine.transition('DISCOVERY');
    }
    console.log(`\nDigite ${chatInterface_1.COLORS.YELLOW}'/exit'${chatInterface_1.COLORS.RESET} para sair.\n`);
    // === REPL Loop ===
    while (true) {
        const input = await (0, chatInterface_1.promptUser)('Você: ');
        if (!input.trim())
            continue;
        if (input.trim() === '/exit')
            break;
        const active = engine.getActiveConfig();
        (0, chatInterface_1.printHeader)(active.role, active.model);
        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
        }
        catch (e) {
            (0, chatInterface_1.printError)("Falha na execução do Stream.", e.message);
        }
    }
    (0, chatInterface_1.closeChat)();
    console.log(`\n${chatInterface_1.COLORS.MAGENTA}Sessão Toug encerrada.${chatInterface_1.COLORS.RESET}`);
}
main().catch(e => {
    (0, chatInterface_1.printError)("Erro fatal no ambiente Node.", e);
    (0, chatInterface_1.closeChat)();
    process.exit(1);
});
