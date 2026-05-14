import { executeInTerminal } from './terminalSessionManager';

export const executeShellCommand = async (command: string, cwd: string = process.cwd()): Promise<string> => {
    try {
        const result = await executeInTerminal(command, cwd);
        return `Output do comando executado:\n${result.logExcerpt}`;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `Output do comando executado:\n[TOUG ERROR] ${message}`;
    }
};
