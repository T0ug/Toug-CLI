import { exec } from 'node:child_process';
import util from 'node:util';

const execAsync = util.promisify(exec);

export const executeShellCommand = async (command: string): Promise<string> => {
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
    } catch (e: any) {
        let errOutput = e.stderr || e.stdout || e.message || String(e);
        if (typeof errOutput === 'string' && errOutput.length > 2000) {
            errOutput = errOutput.substring(0, 1997) + '...';
        }
        return `[ERROR failed to execute tool command]: ${errOutput}`;
    }
};
