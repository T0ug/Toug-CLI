#!/usr/bin/env node
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
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

    // === Health Check ===
    const client = new OllamaClient();
    const healthy = await client.isHealthy();

    if (!healthy) {
        printError("O servidor Ollama não está acessível. Inicializando em MODO OFFLINE.", null);
        console.log(`   ${COLORS.YELLOW}Requisições vão falhar até que o container Docker esteja rodando.${COLORS.RESET}\n`);
    } else {
        console.log(`${COLORS.GREEN}✅ Servidor Ollama operante.${COLORS.RESET}\n`);
    }

    // === Detecção Inteligente de Projeto ===
    const cwd = process.cwd();
    const projectState = detectProjectState(cwd);

    console.log(`${COLORS.CYAN}📂 Análise do diretório: ${cwd}${COLORS.RESET}`);
    console.log(projectState.summary);

    const engine = new PipelineEngine();

    if (projectState.isExistingProject && projectState.hasProjectStatus) {
        console.log(`\n${COLORS.GREEN}🔄 Projeto existente detectado. Entrando em modo Orchestrator.${COLORS.RESET}`);
        engine.transition('ORCHESTRATING');

        // Injetar contexto do project_status no histórico para warm-start
        if (projectState.projectStatusContent) {
            engine.injectContext(
                `Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`
            );
        }
    } else if (projectState.isExistingProject) {
        console.log(`\n${COLORS.YELLOW}🔍 Projeto detectado sem documentação completa. Entrando em modo Project Research.${COLORS.RESET}`);
        engine.transition('PROJECT_RESEARCH');
    } else {
        console.log(`\n${COLORS.MAGENTA}🌱 Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${COLORS.RESET}`);
        engine.transition('DISCOVERY');
    }

    console.log(`\nDigite ${COLORS.YELLOW}'/exit'${COLORS.RESET} para sair.\n`);

    // === REPL Loop ===
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
            console.log('\n');
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
