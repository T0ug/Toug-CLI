#!/usr/bin/env node
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { promptUser, printHeader, printError, closeChat, COLORS } from './cli/chatInterface';

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

    const client = new OllamaClient();
    const healthy = await client.isHealthy();

    if (!healthy) {
        printError("O servidor Ollama não está acessível. Inicializando em MODO DEGRAU (Test/Offline).", null);
        console.log(`   ${COLORS.YELLOW}Requisições simuladas vão esbarrar na interrupção do fetch internamente. Isso é seguro.${COLORS.RESET}`);
    } else {
        console.log(`${COLORS.GREEN}✅ Servidor Ollama operante localmente.${COLORS.RESET}`);
    }

    const engine = new PipelineEngine();
    engine.transition('DISCOVERY'); // Inicialização dura no projeto teste. O REPL vai assumir Discovery de cara.

    console.log(`\nBem-vindo ao Toug CLI. Digite ${COLORS.YELLOW}'/exit'${COLORS.RESET} para sair.\n`);

    while (true) {
        const input = await promptUser('Você: ');
        if (!input.trim()) continue;
        if (input.trim() === '/exit') break;

        const active = engine.getActiveConfig();
        printHeader(active.role, active.model);

        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n'); // Quebra de linha da sessão formatada
        } catch (e: any) {
            printError("Falha na execução do Stream.", e.message);
        }
    }

    closeChat();
    console.log(`\n${COLORS.MAGENTA}Sessão Toug encerrada.${COLORS.RESET}`);
}

main().catch(e => {
    printError("Erro fatal no ambiente Node.", e);
    closeChat();
    process.exit(1);
});
