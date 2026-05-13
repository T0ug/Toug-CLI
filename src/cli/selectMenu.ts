import { COLORS, rl } from './chatInterface';

export interface SelectMenuOption {
    label: string;
    value: string;
}

export const selectMenu = async (options: SelectMenuOption[], title?: string): Promise<string> => {
    return new Promise((resolve) => {
        // Pausar o readline para evitar conflito com os inputs crus do menu
        rl.pause();

        let selectedIndex = 0;
        const totalOptions = options.length;

        const render = () => {
            // Esconder o cursor
            process.stdout.write('\x1B[?25l');

            if (title) {
                process.stdout.write(`\n${COLORS.CYAN}${title}${COLORS.RESET}\n`);
            } else {
                process.stdout.write('\n');
            }

            options.forEach((opt, idx) => {
                const prefix = idx === selectedIndex ? `${COLORS.CYAN}>` : ' ';
                const color = idx === selectedIndex ? COLORS.CYAN : '';
                const resetColor = idx === selectedIndex ? COLORS.RESET : '';
                process.stdout.write(`${prefix} ${color}${opt.label}${resetColor}\n`);
            });
        };

        const cleanup = (linesToClear: number) => {
            // Mover o cursor para cima as linhas necessárias e limpar a tela a partir dali
            process.stdout.write(`\x1B[${linesToClear}A\x1B[J`);
            // Mostrar cursor novamente
            process.stdout.write('\x1B[?25h');
        };

        const onKeyPress = (chunk: Buffer, key: any) => {
            if (key.name === 'up') {
                selectedIndex = (selectedIndex - 1 + totalOptions) % totalOptions;
            } else if (key.name === 'down') {
                selectedIndex = (selectedIndex + 1) % totalOptions;
            } else if (key.name === 'return' || key.name === 'enter') {
                finalize(options[selectedIndex].value);
                return;
            } else if (key.name === 'c' && key.ctrl) {
                finalize('__cancel__');
                return;
            } else {
                // Teclas irrelevantes ignoradas
                return;
            }

            const linesToClear = totalOptions + (title ? 2 : 1);
            process.stdout.write(`\x1B[${linesToClear}A`);
            
            if (title) {
                process.stdout.write(`\n${COLORS.CYAN}${title}${COLORS.RESET}\n`);
            } else {
                process.stdout.write('\n');
            }
            options.forEach((opt, idx) => {
                const prefix = idx === selectedIndex ? `${COLORS.CYAN}>` : ' ';
                const color = idx === selectedIndex ? COLORS.CYAN : '';
                const resetColor = idx === selectedIndex ? COLORS.RESET : '';
                process.stdout.write(`${prefix} ${color}${opt.label}${resetColor}\n`);
            });
        };

        const finalize = (value: string) => {
            process.stdin.removeListener('keypress', onKeyPress);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }
            
            const linesToClear = totalOptions + (title ? 2 : 1);
            cleanup(linesToClear);
            
            rl.resume();
            resolve(value);
        };

        render();

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        
        // Assegurar que os eventos de keypress sejam emitidos pelo stdin
        const readlineNode = require('readline');
        readlineNode.emitKeypressEvents(process.stdin);
        
        process.stdin.on('keypress', onKeyPress);
    });
};
