/**
 * Renderer Markdown → ANSI para terminal.
 * Compatível com cmd.exe clássico e Windows Terminal.
 *
 * Suporta: **bold**, `inline code`, # headers, * bullets, ``` code blocks, --- hr
 * Itálico (*text*) é renderizado como bold para compatibilidade com cmd.exe.
 */

const ANSI = {
    BOLD: '\x1b[1m',
    BOLD_OFF: '\x1b[22m',
    DIM: '\x1b[90m',
    YELLOW: '\x1b[33m',
    CYAN: '\x1b[36m',
    RESET: '\x1b[0m',
};

export class MarkdownRenderer {
    private buffer = '';
    private inCodeBlock = false;

    /**
     * Alimenta o renderer com um chunk de texto do stream.
     * Retorna o texto renderizado pronto para exibição.
     * Chunks com códigos ANSI (mensagens do sistema) são passados adiante sem alteração.
     */
    feed(chunk: string): string {
        // Chunks que já contêm ANSI (system messages, thinking) passam direto
        if (chunk.includes('\x1b[')) {
            const flushed = this.flush();
            return flushed + chunk;
        }

        this.buffer += chunk;
        let output = '';

        // Processa linhas completas (delimitadas por \n)
        while (this.buffer.includes('\n')) {
            const idx = this.buffer.indexOf('\n');
            const line = this.buffer.substring(0, idx);
            this.buffer = this.buffer.substring(idx + 1);
            output += this.renderLine(line) + '\n';
        }

        return output;
    }

    /** Esvazia o buffer residual (última linha sem \n). */
    flush(): string {
        if (this.buffer) {
            const line = this.buffer;
            this.buffer = '';
            return this.renderLine(line);
        }
        return '';
    }

    private renderLine(line: string): string {
        // Toggle de code block (```)
        if (line.trimStart().startsWith('```')) {
            this.inCodeBlock = !this.inCodeBlock;
            return ANSI.DIM + line + ANSI.RESET;
        }

        // Dentro de code block: dim sem processamento adicional
        if (this.inCodeBlock) {
            return ANSI.DIM + line + ANSI.RESET;
        }

        // Linha vazia
        if (!line.trim()) return line;

        // Horizontal rule (---)
        if (/^-{3,}\s*$/.test(line.trim())) {
            return ANSI.DIM + '────────────────────────────────' + ANSI.RESET;
        }

        // Headers: # ## ###
        const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headerMatch) {
            return '\n' + ANSI.BOLD + ANSI.CYAN + headerMatch[2] + ANSI.RESET;
        }

        // Bullet points: * ou - no início (com indent opcional)
        line = line.replace(/^(\s*)[*\-]\s+/, '$1• ');

        // Formatação inline
        return this.renderInline(line);
    }

    private renderInline(text: string): string {
        // Bold: **text** (processado primeiro para não conflitar com italic)
        text = text.replace(/\*\*([^*]+)\*\*/g, ANSI.BOLD + '$1' + ANSI.BOLD_OFF);

        // Inline code: `text`
        text = text.replace(/`([^`]+)`/g, ANSI.YELLOW + '$1' + ANSI.RESET);

        return text;
    }
}
