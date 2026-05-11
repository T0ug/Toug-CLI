import fs from 'fs';
import path from 'path';
import os from 'os';
import { Message } from '../engine/ollamaClient';
import { PipelineState } from '../agents/types';

export interface SessionData {
    id: string;
    cwd: string;
    state: PipelineState;
    history: Message[];
    savedAt: string;
}

const getSessionsDir = (): string => {
    const dir = path.join(os.homedir(), '.toug-cli', 'sessions');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const cwdHash = (cwd: string): string => {
    // Hash simples baseado na string do diretório pra isolar sessões por projeto
    let hash = 0;
    for (let i = 0; i < cwd.length; i++) {
        const char = cwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash).toString(36);
};

export const saveSession = (history: Message[], state: PipelineState, cwd: string): string => {
    const dir = getSessionsDir();
    const now = new Date();
    const id = `session_${now.toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
    const filename = `${cwdHash(cwd)}_${id}.json`;
    const filePath = path.join(dir, filename);

    const data: SessionData = {
        id,
        cwd,
        state,
        history,
        savedAt: now.toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return filePath;
};

export const loadLatestSession = (cwd: string): SessionData | null => {
    const dir = getSessionsDir();
    const prefix = cwdHash(cwd) + '_';

    try {
        const files = fs.readdirSync(dir)
            .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
            .sort()
            .reverse();

        if (files.length === 0) return null;

        const filePath = path.join(dir, files[0]);
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content) as SessionData;
    } catch {
        return null;
    }
};

export const compressHistory = (history: Message[], keepLast: number = 10): Message[] => {
    if (history.length <= keepLast + 5) return history;

    const toCompress = history.slice(0, history.length - keepLast);
    const toKeep = history.slice(history.length - keepLast);

    // Gerar um resumo concatenado das mensagens antigas
    const summaryParts: string[] = [];
    for (const msg of toCompress) {
        if (msg.role === 'system') continue; // Pular system antigos
        summaryParts.push(`[${msg.role}]: ${msg.content.substring(0, 150)}`);
    }

    const compressedMessage: Message = {
        role: 'system',
        content: `[CONTEXTO COMPRIMIDO - ${toCompress.length} mensagens anteriores resumidas]:\n${summaryParts.join('\n')}`
    };

    return [compressedMessage, ...toKeep];
};
