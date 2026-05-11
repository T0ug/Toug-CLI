import * as readline from 'readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const COLORS = {
    RESET: '\x1b[0m',
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    MAGENTA: '\x1b[35m'
};

export const promptUser = async (text: string): Promise<string> => {
    return await rl.question(`${COLORS.CYAN}${text}${COLORS.RESET}`);
};

export const printHeader = (agent: string, model: string) => {
    process.stdout.write(`\n${COLORS.GREEN}>> [${agent.toUpperCase()} @ ${model}]${COLORS.RESET}\n`);
};

export const printError = (msg: string, err: any) => {
    if (err) {
        console.error(`\n${COLORS.RED}❌ ${msg}${COLORS.RESET}`, err);
    } else {
        console.error(`\n${COLORS.RED}❌ ${msg}${COLORS.RESET}`);
    }
};

export const closeChat = () => {
    rl.close();
};
