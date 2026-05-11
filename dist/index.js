#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pipelineEngine_1 = require("./engine/pipelineEngine");
const ollamaClient_1 = require("./engine/ollamaClient");
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
    const client = new ollamaClient_1.OllamaClient();
    const healthy = await client.isHealthy();
    if (!healthy) {
        (0, chatInterface_1.printError)("O servidor Ollama não está acessível. Inicializando em MODO DEGRAU (Test/Offline).", null);
        console.log(`   ${chatInterface_1.COLORS.YELLOW}Requisições simuladas vão esbarrar na interrupção do fetch internamente. Isso é seguro.${chatInterface_1.COLORS.RESET}`);
    }
    else {
        console.log(`${chatInterface_1.COLORS.GREEN}✅ Servidor Ollama operante localmente.${chatInterface_1.COLORS.RESET}`);
    }
    const engine = new pipelineEngine_1.PipelineEngine();
    engine.transition('DISCOVERY'); // Inicialização dura no projeto teste. O REPL vai assumir Discovery de cara.
    console.log(`\nBem-vindo ao Toug CLI. Digite ${chatInterface_1.COLORS.YELLOW}'/exit'${chatInterface_1.COLORS.RESET} para sair.\n`);
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
            console.log('\n'); // Quebra de linha da sessão formatada
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
