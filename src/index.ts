#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { PipelineEngine } from './engine/pipelineEngine';
import { OllamaClient } from './engine/ollamaClient';
import { detectProjectState } from './engine/projectDetector';
import { loadConfig, saveConfig, isFirstRun, getConfigPath } from './data/configManager';
import { saveSession, compressHistory, listSessions, loadSessionFile, deleteSession, startNewSession } from './data/sessionManager';
import { promptUser, printHeader, printError, closeChat, COLORS, onInterrupt } from './cli/chatInterface';
import { selectMenu } from './cli/selectMenu';
import { readArtifact } from './engine/artifactManager';

const CANCEL = '__cancel__';

async function chooseBoolean(title: string, currentValue?: boolean): Promise<boolean | null> {
    const current = typeof currentValue === 'boolean' ? ` atual: ${currentValue ? 'Sim' : 'Nao'}` : '';
    const choice = await selectMenu([
        { label: 'Sim', value: 'yes' },
        { label: 'Nao', value: 'no' },
        { label: 'Voltar', value: CANCEL }
    ], `${title}${current}`);

    if (choice === CANCEL) return null;
    return choice === 'yes';
}

async function addGeminiKeys(config: ReturnType<typeof loadConfig>): Promise<void> {
    while (true) {
        const key = await promptUser(`${COLORS.CYAN}API Key Gemini (ENTER para voltar): ${COLORS.RESET}`);
        if (!key.trim()) return;

        const aliasInput = await promptUser(`${COLORS.CYAN}Apelido da chave ${COLORS.DIM}(Enter para nao incluir apelido a chave API)${COLORS.RESET}: `);
        const alias = aliasInput.trim() || `Key_${config.gemini.apiKeys.length + 1}`;
        config.gemini.apiKeys.push({ key: key.trim(), alias });
        saveConfig(config);
        console.log(`${COLORS.GREEN}Chave adicionada como ${alias}. Total de chaves: ${config.gemini.apiKeys.length}${COLORS.RESET}\n`);

        const next = await selectMenu([
            { label: 'Adicionar outra', value: 'add' },
            { label: 'Voltar', value: 'back' }
        ], 'API Keys Gemini');

        if (next !== 'add') return;
    }
}

async function manageGeminiKeys(config: ReturnType<typeof loadConfig>): Promise<void> {
    while (true) {
        const keys = config.gemini.apiKeys;

        if (keys.length === 0) {
            console.log(`\n${COLORS.YELLOW}Nenhuma API Key Gemini cadastrada.${COLORS.RESET}\n`);
            const choice = await selectMenu([
                { label: 'Adicionar API Key', value: 'add' },
                { label: 'Voltar', value: 'back' }
            ], 'API Keys Gemini');

            if (choice === 'add') {
                await addGeminiKeys(config);
            } else {
                return;
            }
            continue;
        }

        console.log(`\n${COLORS.CYAN}Prioridade atual das API Keys Gemini${COLORS.RESET}`);
        keys.forEach((key, index) => {
            console.log(`${COLORS.YELLOW}  ${index + 1}. ${COLORS.RESET}${key.alias}`);
        });

        const options = keys.map((key, index) => ({
            label: `${index + 1}/${keys.length} - ${key.alias}`,
            value: `${index}`
        }));
        options.push({ label: 'Adicionar API Key', value: 'add' });
        options.push({ label: 'Voltar', value: 'back' });

        const choice = await selectMenu(options, 'Gerenciar API Keys Gemini');
        if (choice === 'back' || choice === CANCEL) return;
        if (choice === 'add') {
            await addGeminiKeys(config);
            continue;
        }

        const index = Number(choice);
        const selected = keys[index];
        if (!selected) {
            console.log(`${COLORS.RED}API Key invalida.${COLORS.RESET}`);
            continue;
        }

        const actionOptions = [
            { label: 'Renomear apelido', value: 'rename' },
            { label: 'Mover prioridade para cima', value: 'up' },
            { label: 'Mover prioridade para baixo', value: 'down' },
            { label: 'Apagar API Key', value: 'delete' },
            { label: 'Voltar', value: 'back' }
        ];

        const action = await selectMenu(actionOptions, `API Key ${index + 1}/${keys.length} - ${selected.alias}`);
        if (action === 'back' || action === CANCEL) continue;

        if (action === 'rename') {
            const newAlias = await promptUser(`${COLORS.CYAN}Novo apelido para ${selected.alias}: ${COLORS.RESET}`);
            if (newAlias.trim()) {
                selected.alias = newAlias.trim();
                saveConfig(config);
                console.log(`${COLORS.GREEN}Apelido atualizado.${COLORS.RESET}\n`);
            }
            continue;
        }

        if (action === 'up') {
            if (index === 0) {
                console.log(`${COLORS.YELLOW}Esta key ja esta na primeira prioridade.${COLORS.RESET}\n`);
                continue;
            }
            [keys[index - 1], keys[index]] = [keys[index], keys[index - 1]];
            saveConfig(config);
            console.log(`${COLORS.GREEN}Prioridade atualizada.${COLORS.RESET}\n`);
            continue;
        }

        if (action === 'down') {
            if (index === keys.length - 1) {
                console.log(`${COLORS.YELLOW}Esta key ja esta na ultima prioridade.${COLORS.RESET}\n`);
                continue;
            }
            [keys[index], keys[index + 1]] = [keys[index + 1], keys[index]];
            saveConfig(config);
            console.log(`${COLORS.GREEN}Prioridade atualizada.${COLORS.RESET}\n`);
            continue;
        }

        if (action === 'delete') {
            const confirm = await selectMenu([
                { label: 'Apagar', value: 'yes' },
                { label: 'Cancelar', value: 'no' }
            ], `Apagar ${selected.alias}?`);

            if (confirm === 'yes') {
                keys.splice(index, 1);
                saveConfig(config);
                console.log(`${COLORS.GREEN}API Key apagada.${COLORS.RESET}\n`);
            }
        }
    }
}

async function configWizard() {
    console.log(`\n${COLORS.CYAN}Configuracao Inicial do Toug CLI${COLORS.RESET}\n`);

    const config = loadConfig();
    const providerChoice = await selectMenu([
        { label: 'Ollama local', value: 'ollama' },
        { label: 'Gemini cloud', value: 'gemini' }
    ], 'Provider padrao');

    if (providerChoice === 'gemini') {
        config.lastProvider = 'gemini';
        await addGeminiKeys(config);
    } else {
        config.lastProvider = 'ollama';
        console.log(`${COLORS.YELLOW}Endpoint Ollama atual: ${COLORS.RESET}${config.ollama.endpoint}`);
        const endpointOk = await chooseBoolean('O endpoint Ollama esta correto?', true);

        if (endpointOk === false) {
            const newEndpoint = await promptUser(`${COLORS.CYAN}Digite o novo endpoint (ex: http://192.168.1.100:11434): ${COLORS.RESET}`);
            if (newEndpoint.trim()) {
                config.ollama.endpoint = newEndpoint.trim();
            }
        }
    }

    saveConfig(config);
    console.log(`${COLORS.GREEN}Configuracao salva em ${getConfigPath()}${COLORS.RESET}\n`);
}

async function editConfig() {
    const config = loadConfig();

    while (true) {
        console.log(`\n${COLORS.CYAN}Configuracao Atual${COLORS.RESET}`);
        console.log(`${COLORS.YELLOW}  Provider:       ${COLORS.RESET}${config.lastProvider}`);
        console.log(`${COLORS.YELLOW}  Endpoint:       ${COLORS.RESET}${config.ollama.endpoint}`);
        console.log(`${COLORS.YELLOW}  Gemini keys:    ${COLORS.RESET}${config.gemini.apiKeys.length}`);
        console.log(`${COLORS.YELLOW}  Auto-approve:   ${COLORS.RESET}${config.autoApproveMode}`);
        console.log(`${COLORS.YELLOW}  Thinking:       ${COLORS.RESET}${config.showThinking}`);
        console.log(`${COLORS.YELLOW}  Arquivo:        ${COLORS.RESET}${getConfigPath()}`);

        const choice = await selectMenu([
            { label: 'Provider', value: 'provider' },
            { label: 'Endpoint Ollama', value: 'endpoint' },
            { label: 'Adicionar API Key Gemini', value: 'gemini_key' },
            { label: 'Gerenciar API Keys Gemini', value: 'manage_gemini_keys' },
            { label: 'Auto-approve', value: 'auto_approve' },
            { label: 'Mostrar pensamento da IA', value: 'show_thinking' },
            { label: 'Voltar', value: 'back' }
        ], 'Alterar configuracao');

        if (choice === 'provider') {
            const providerChoice = await selectMenu([
                { label: 'Ollama', value: 'ollama' },
                { label: 'Gemini', value: 'gemini' },
                { label: 'Voltar', value: CANCEL }
            ], 'Provider');

            if (providerChoice !== CANCEL) {
                config.lastProvider = providerChoice as typeof config.lastProvider;
                saveConfig(config);
                console.log(`${COLORS.GREEN}Provider atualizado para: ${config.lastProvider}${COLORS.RESET}\n`);
            }
        } else if (choice === 'endpoint') {
            const newEndpoint = await promptUser(`${COLORS.CYAN}Novo endpoint: ${COLORS.RESET}`);
            if (newEndpoint.trim()) {
                config.ollama.endpoint = newEndpoint.trim();
                saveConfig(config);
                console.log(`${COLORS.GREEN}Endpoint atualizado para: ${config.ollama.endpoint}${COLORS.RESET}\n`);
            }
        } else if (choice === 'gemini_key') {
            await addGeminiKeys(config);
        } else if (choice === 'manage_gemini_keys') {
            await manageGeminiKeys(config);
        } else if (choice === 'auto_approve') {
            const value = await chooseBoolean('Auto-approve', config.autoApproveMode);
            if (value !== null) {
                config.autoApproveMode = value;
                saveConfig(config);
                console.log(`${COLORS.GREEN}Auto-approve agora: ${config.autoApproveMode}${COLORS.RESET}\n`);
            }
        } else if (choice === 'show_thinking') {
            const value = await chooseBoolean('Mostrar pensamento da IA', config.showThinking);
            if (value !== null) {
                config.showThinking = value;
                saveConfig(config);
                console.log(`${COLORS.GREEN}Mostrar pensamento da IA agora: ${config.showThinking}${COLORS.RESET}\n`);
            }
        } else {
            return;
        }
    }
}

function prepareConversation(engine: PipelineEngine, cwd: string): void {
    startNewSession(cwd);
    const projectState = detectProjectState(cwd);

    if (projectState.isExistingProject && projectState.hasProjectStatus) {
        console.log(`\n${COLORS.GREEN}Projeto existente detectado. Entrando em modo Orchestrator.${COLORS.RESET}`);
        engine.transition('ORCHESTRATING');

        if (projectState.projectStatusContent) {
            engine.injectContext(
                `Estado atual do projeto (lido automaticamente de docs/project_status.md):\n${projectState.projectStatusContent}`
            );
        }
    } else if (projectState.isExistingProject) {
        console.log(`\n${COLORS.YELLOW}Projeto detectado sem documentacao completa. Entrando em modo Project Research.${COLORS.RESET}`);
        engine.transition('PROJECT_RESEARCH');
    } else {
        console.log(`\n${COLORS.MAGENTA}Nenhum projeto detectado. Entrando em modo Discovery para novo projeto.${COLORS.RESET}`);
        engine.transition('DISCOVERY');
    }
}

async function manageSessions(engine: PipelineEngine, cwd: string): Promise<boolean> {
    const pageSize = 5;
    let page = 0;

    while (true) {
        const sessions = listSessions(cwd);
        if (sessions.length === 0) {
            console.log(`\n${COLORS.YELLOW}Nenhuma sessao salva encontrada para este projeto.${COLORS.RESET}\n`);
            return false;
        }

        const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize));
        if (page >= totalPages) page = totalPages - 1;

        const start = page * pageSize;
        const visibleSessions = sessions.slice(start, start + pageSize);
        const options = visibleSessions.map((session, index) => {
            const sessionIndex = start + index;
            const label = `#${sessionIndex + 1}/${sessions.length} - ${session.savedAt.toLocaleString()} (${session.count} mensagens)`;
            return { label, value: `${sessionIndex}` };
        });

        if (page > 0) {
            options.push({ label: 'Pagina anterior', value: 'prev' });
        }

        if (page < totalPages - 1) {
            options.push({ label: 'Proxima pagina', value: 'next' });
        }

        options.push({ label: 'Voltar', value: 'back' });

        const choice = await selectMenu(options, `Sessoes salvas - pagina ${page + 1}/${totalPages} - total ${sessions.length}`);
        if (choice === 'back' || choice === CANCEL) return false;
        if (choice === 'prev') {
            page--;
            continue;
        }
        if (choice === 'next') {
            page++;
            continue;
        }

        const sessionIndex = Number(choice);
        const session = sessions[sessionIndex];
        if (!session) {
            console.log(`${COLORS.RED}Sessao invalida.${COLORS.RESET}`);
            continue;
        }

        const label = `Sessao ${sessionIndex + 1}/${sessions.length} - ${session.savedAt.toLocaleString()} (${session.count} mensagens)`;
        const action = await selectMenu([
            { label: 'Carregar sessao', value: 'load' },
            { label: 'Apagar sessao', value: 'delete' },
            { label: 'Voltar', value: 'back' }
        ], label);

        if (action === 'back' || action === CANCEL) {
            continue;
        }

        if (action === 'delete') {
            if (deleteSession(cwd, session.filename)) {
                console.log(`${COLORS.GREEN}Sessao apagada com sucesso.${COLORS.RESET}`);
            } else {
                console.log(`${COLORS.RED}Falha ao apagar sessao.${COLORS.RESET}`);
            }
            continue;
        }

        const data = loadSessionFile(cwd, session.filename);
        if (data) {
            engine.setHistory(data.history);
            engine.setState(data.state);
            console.log(`${COLORS.GREEN}Sessao restaurada com ${data.history.length} mensagens.${COLORS.RESET}\n`);
            return true;
        }

        console.log(`${COLORS.RED}Falha ao carregar o arquivo da sessao.${COLORS.RESET}`);
    }
}

async function chooseMainAction(engine: PipelineEngine, cwd: string): Promise<void> {
    while (true) {
        const action = await selectMenu([
            { label: 'Iniciar nova conversa', value: 'new' },
            { label: 'Configuracoes', value: 'config' },
            { label: 'Sessoes anteriores', value: 'sessions' }
        ], 'Menu principal');

        if (action === 'new') {
            engine.clearHistory();
            prepareConversation(engine, cwd);
            return;
        }

        if (action === 'config') {
            await editConfig();
            continue;
        }

        if (await manageSessions(engine, cwd)) {
            return;
        }
    }
}

async function main() {
    const logo = `
\x1b[35m████████╗ ██████╗ ██╗   ██╗ ██████╗ \x1b[0m
\x1b[35m╚══██╔══╝██╔═══██╗██║   ██║██╔════╝ \x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║  ███╗\x1b[0m
\x1b[35m   ██║   ██║   ██║██║   ██║██║   ██║\x1b[0m
\x1b[35m   ██║   ╚██████╔╝╚██████╔╝╚██████╔╝\x1b[0m
\x1b[35m   ╚═╝    ╚═════╝  ╚═════╝  ╚═════╝ \x1b[0m
`;
    console.log(logo);

    if (isFirstRun()) {
        await configWizard();
    }

    const config = loadConfig();

    if (config.lastProvider === 'ollama') {
        const client = new OllamaClient();
        const healthy = await client.isHealthy();

        if (!healthy) {
            printError('O servidor Ollama nao esta acessivel. Inicializando em MODO OFFLINE.', null);
            console.log(`   ${COLORS.YELLOW}Requisicoes vao falhar ate que o container Docker esteja rodando.${COLORS.RESET}\n`);
        } else {
            console.log(`${COLORS.GREEN}Servidor Ollama operante.${COLORS.RESET}\n`);
        }
    } else {
        console.log(`${COLORS.GREEN}Provedor Cloud Gemini alocado (Keys registradas: ${config.gemini.apiKeys.length}).${COLORS.RESET}\n`);
    }

    const cwd = process.cwd();
    const engine = new PipelineEngine();

    onInterrupt(() => {
        if (!engine.abortCurrentStream()) {
            console.log(`\n${COLORS.MAGENTA}Sessao Toug encerrada (Ctrl+C).${COLORS.RESET}`);
            process.exit(0);
        }
    });

    await chooseMainAction(engine, cwd);

    const printCommands = () => {
        console.log(`\nComandos: ${COLORS.YELLOW}/exit${COLORS.RESET} (sair) | ${COLORS.YELLOW}/menu${COLORS.RESET} (menu) | ${COLORS.YELLOW}/config${COLORS.RESET} (configuracao) | ${COLORS.YELLOW}/sessoes${COLORS.RESET} (historico)\n`);
    };

    printCommands();

    const mentionedFilesCache: Set<string> = new Set();

    while (true) {
        let input = await promptUser('Voce: ');
        if (!input.trim()) continue;
        if (input.trim() === '/exit') break;

        if (input.trim() === '/menu') {
            await chooseMainAction(engine, cwd);
            printCommands();
            continue;
        }

        if (input.trim() === '/config') {
            await editConfig();
            continue;
        }

        if (input.trim() === '/sessoes') {
            await manageSessions(engine, cwd);
            continue;
        }

        if (input.trim().startsWith('?')) {
            console.log(`\n${COLORS.CYAN}[Heuristica] Tarefa simples detectada. Acionando bypass de roteamento rapido...${COLORS.RESET}`);
            const query = input.trim().substring(1).trim();
            if (!query) {
                console.log(`${COLORS.YELLOW}Por favor digite uma pergunta apos o '?'.${COLORS.RESET}`);
                continue;
            }

            const tempEngine = new PipelineEngine();
            tempEngine.transition('DISCOVERY');
            const activeTemp = tempEngine.getActiveConfig();
            printHeader(activeTemp.role, activeTemp.model, activeTemp.provider);

            try {
                const stream = tempEngine.processInput(query);
                for await (const chunk of stream) {
                    process.stdout.write(chunk);
                }
                console.log('\n');
            } catch (e: any) {
                printError('Falha na execucao Heuristica.', e.message);
            }
            continue;
        }

        const mentionRegex = /@([\w./\-\\]+)/g;
        let match;
        let appendedContext = '';

        while ((match = mentionRegex.exec(input)) !== null) {
            const filepath = match[1];
            if (mentionedFilesCache.has(filepath)) {
                console.log(`${COLORS.YELLOW}[Anexado: ${filepath} (ja na memoria)]${COLORS.RESET}`);
                continue;
            }

            const content = readArtifact(filepath, cwd);
            if (content.startsWith('[ERRO]')) {
                console.log(`${COLORS.YELLOW}[Aviso: Falha ao ler '${filepath}']${COLORS.RESET}`);
            } else {
                mentionedFilesCache.add(filepath);
                console.log(`${COLORS.GREEN}[Anexado: ${filepath}]${COLORS.RESET}`);
                appendedContext += `\n\n--- Conteudo de ${filepath} ---\n${content}\n`;
            }
        }

        if (appendedContext) {
            input += `\n\n(Contexto anexado pelo usuario via @)\n${appendedContext}`;
        }

        const active = engine.getActiveConfig();
        printHeader(active.role, active.model, active.provider);

        try {
            const stream = engine.processInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log('\n');
        } catch (e: any) {
            printError('Falha na execucao do Stream.', e.message);
        }

        const currentHistory = engine.getHistory();
        if (currentHistory.length > 100) {
            const compressed = compressHistory(currentHistory, 20);
            engine.setHistory(compressed);
            console.log(`${COLORS.YELLOW}[SYSTEM] Contexto comprimido: ${currentHistory.length} -> ${compressed.length} mensagens.${COLORS.RESET}\n`);
        }
    }

    saveSession(engine.getHistory(), engine.getState(), cwd);
    console.log(`\n${COLORS.GREEN}Sessao salva automaticamente.${COLORS.RESET}`);

    closeChat();
    console.log(`${COLORS.MAGENTA}Sessao Toug encerrada.${COLORS.RESET}`);
}

main().catch(e => {
    printError('Erro fatal no ambiente Node.', e.message || String(e));
    try {
        const cwd = process.cwd();
        const logPath = path.join(cwd, 'toug-fatal-log.txt');
        const logData = `TOUG CLI FATAL ERROR LOG\nDate: ${new Date().toISOString()}\n\nError:\n${e.stack || e}\n`;
        fs.writeFileSync(logPath, logData, 'utf8');

        if (process.platform === 'win32') {
            execSync(`start "" "${logPath}"`);
        }
    } catch (logErr) {
        console.error('Falha ao gravar erro letal no disco.', logErr);
    }

    closeChat();
    process.exit(1);
});
