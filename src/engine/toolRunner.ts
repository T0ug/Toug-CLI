import { spawn } from 'node:child_process';

export const executeShellCommand = async (command: string): Promise<string> => {
    const isBackgroundCmd = /npm run dev|npm start|vite|expo start/i.test(command);
    if (isBackgroundCmd) {
        return new Promise((resolve) => {
            console.log(`\n\x1b[36m[System]\x1b[0m Iniciando servidor em background...\n`);
            
            // Usamos shell: true para garantir que comandos complexos do npm funcionem
            const child = spawn(command, { shell: true, stdio: 'pipe' });
            
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
        const child = spawn(command, { shell: true, stdio: 'inherit' });

        child.on('error', (err) => {
            resolve(`[ERROR failed to execute tool command]: ${err.message}`);
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve('Comando executado com sucesso.');
                return;
            }

            resolve(`Comando finalizado com codigo ${code}.`);
        });
    });
};
