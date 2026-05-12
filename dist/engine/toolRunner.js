"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeShellCommand = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = __importDefault(require("node:util"));
const execAsync = node_util_1.default.promisify(node_child_process_1.exec);
const executeShellCommand = async (command) => {
    const isBackgroundCmd = /npm run dev|npm start|vite|expo start/i.test(command);
    if (isBackgroundCmd) {
        return new Promise((resolve) => {
            console.log(`\n\x1b[36m[System]\x1b[0m Iniciando servidor em background...\n`);
            // Usamos shell: true para garantir que comandos complexos do npm funcionem
            const child = (0, node_child_process_1.spawn)(command, { shell: true, stdio: 'pipe' });
            child.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            child.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            child.on('error', (err) => {
                console.error(`\n[Erro Background] ${err.message}\n`);
            });
            // Retorna à IA após 3 segundos para que ela não fique travada aguardando exit 0
            setTimeout(() => {
                resolve(`Comando de servidor "${command}" foi iniciado no terminal do usuário. O processo continuará rodando em background e os logs estão visíveis para o usuário em tempo real.`);
            }, 3000);
        });
    }
    try {
        const { stdout, stderr } = await execAsync(command, { maxBuffer: 2 * 1024 * 1024 }); // 2MB buffer para prevenir max buffer spawn logs
        let result = stdout.trim();
        if (stderr.trim()) {
            result += `\n[STDERR]:\n${stderr.trim()}`;
        }
        result = result.trim() || "Process exited successfully with no string output.";
        if (result.length > 2000) {
            result = result.substring(0, 1997) + '...';
        }
        return result;
    }
    catch (e) {
        let errOutput = e.stderr || e.stdout || e.message || String(e);
        if (typeof errOutput === 'string' && errOutput.length > 2000) {
            errOutput = errOutput.substring(0, 1997) + '...';
        }
        return `[ERROR failed to execute tool command]: ${errOutput}`;
    }
};
exports.executeShellCommand = executeShellCommand;
