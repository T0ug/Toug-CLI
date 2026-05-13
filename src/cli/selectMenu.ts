import { COLORS, rl } from './chatInterface';

export interface SelectMenuOption {
    label: string;
    value: string;
}

const CANCEL_VALUE = '__cancel__';

export const selectMenu = async (options: SelectMenuOption[], title?: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.pause();

        let selectedIndex = 0;
        const totalOptions = options.length;
        const pageSize = Math.max(3, Math.min(12, (process.stdout.rows || 18) - 6));
        let lastRenderedLines = 0;

        const visibleWindow = () => {
            const half = Math.floor(pageSize / 2);
            let start = Math.max(0, selectedIndex - half);
            const maxStart = Math.max(0, totalOptions - pageSize);
            start = Math.min(start, maxStart);
            const end = Math.min(totalOptions, start + pageSize);
            return { start, end };
        };

        const render = () => {
            const { start, end } = visibleWindow();

            if (lastRenderedLines > 0) {
                process.stdout.write(`\x1B[${lastRenderedLines}A\r\x1B[J`);
            }

            process.stdout.write('\x1B[?25l');
            let renderedLines = 0;

            if (title) {
                process.stdout.write(`${COLORS.CYAN}${title}${COLORS.RESET}\n`);
                renderedLines += title.split('\n').length;
            }

            if (totalOptions > pageSize) {
                process.stdout.write(`${COLORS.DIM}${selectedIndex + 1}/${totalOptions} - use setas, Enter para selecionar, Ctrl+C para voltar${COLORS.RESET}\n`);
                renderedLines++;
            }

            for (let idx = start; idx < end; idx++) {
                const opt = options[idx];
                const isSelected = idx === selectedIndex;
                const prefix = isSelected ? `${COLORS.CYAN}>` : ' ';
                const color = isSelected ? COLORS.CYAN : '';
                const resetColor = isSelected ? COLORS.RESET : '';
                process.stdout.write(`${prefix} ${color}${opt.label}${resetColor}\n`);
                renderedLines++;
            }

            lastRenderedLines = renderedLines;
        };

        const cleanup = () => {
            process.stdout.write('\x1B[?25h');
            if (lastRenderedLines > 0) {
                process.stdout.write(`\x1B[${lastRenderedLines}A\r\x1B[J`);
                lastRenderedLines = 0;
            }
        };

        const finalize = (value: string) => {
            process.stdin.removeListener('keypress', onKeyPress);
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
            }

            cleanup();
            rl.resume();
            resolve(value);
        };

        const onKeyPress = (_chunk: Buffer, key: any) => {
            if (key.name === 'up') {
                selectedIndex = (selectedIndex - 1 + totalOptions) % totalOptions;
            } else if (key.name === 'down') {
                selectedIndex = (selectedIndex + 1) % totalOptions;
            } else if (key.name === 'pageup') {
                selectedIndex = Math.max(0, selectedIndex - pageSize);
            } else if (key.name === 'pagedown') {
                selectedIndex = Math.min(totalOptions - 1, selectedIndex + pageSize);
            } else if (key.name === 'return' || key.name === 'enter') {
                finalize(options[selectedIndex].value);
                return;
            } else if (key.name === 'c' && key.ctrl) {
                finalize(CANCEL_VALUE);
                return;
            } else {
                return;
            }

            render();
        };

        if (totalOptions === 0) {
            resolve(CANCEL_VALUE);
            return;
        }

        const readlineNode = require('readline');
        readlineNode.emitKeypressEvents(process.stdin);

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        process.stdin.on('keypress', onKeyPress);
        render();
    });
};
