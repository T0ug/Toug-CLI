import { spawn } from 'node:child_process';

const MAX_OUTPUT_CHARS = 8000;

const getShellCommand = (command: string): { command: string; args: string[]; shell: boolean } => {
    if (process.platform !== 'win32') {
        return { command, args: [], shell: true };
    }

    const utf8Prefix = '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; ';
    return {
        command: 'powershell.exe',
        args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', utf8Prefix + command],
        shell: false
    };
};

export const executeShellCommand = async (command: string): Promise<string> => {
    const isBackgroundCmd = /npm run dev|npm start|vite|expo start/i.test(command);
    if (isBackgroundCmd) {
        return new Promise((resolve) => {
            console.log(`\n\x1b[36m[System]\x1b[0m Iniciando servidor em background...\n`);

            const shellCommand = getShellCommand(command);
            const child = spawn(shellCommand.command, shellCommand.args, { shell: shellCommand.shell, stdio: 'pipe' });

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

    return new Promise((resolve) => {
        const shellCommand = getShellCommand(command);
        const child = spawn(shellCommand.command, shellCommand.args, {
            shell: shellCommand.shell,
            stdio: ['inherit', 'pipe', 'pipe']
        });

        let output = '';

        child.stdout.on('data', (data) => {
            const text = data.toString('utf-8');
            process.stdout.write(data);
            output += text;
        });

        child.stderr.on('data', (data) => {
            const text = data.toString('utf-8');
            process.stderr.write(data);
            output += text;
        });

        child.on('error', (err) => {
            resolve(`[ERROR failed to execute tool command]: ${err.message}`);
        });

        child.on('close', (code) => {
            let trimmed = output.trim();
            if (trimmed.length > MAX_OUTPUT_CHARS) {
                trimmed = trimmed.substring(0, MAX_OUTPUT_CHARS) + '\n...[output truncado em ' + MAX_OUTPUT_CHARS + ' caracteres]';
            }
            if (code === 0) {
                resolve(trimmed || 'Comando executado com sucesso (sem output).');
                return;
            }
            resolve(trimmed ? `Comando finalizado com codigo ${code}.\n${trimmed}` : `Comando finalizado com codigo ${code}.`);
        });
    });
};
