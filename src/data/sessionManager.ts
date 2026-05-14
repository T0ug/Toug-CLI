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

export interface ActiveSessionInfo {
    id: string;
    filePath: string;
    sessionDir: string;
    cwd: string;
}

const activeSessionFiles = new Map<string, string>();
const SESSION_DATA_FILE = 'session.json';

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

const getProjectSessionsDir = (cwd: string): string => {
    const dir = getSessionsDir();
    const projectDir = path.join(dir, cwdHash(cwd));
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }
    return projectDir;
};

const createSessionPath = (cwd: string, now: Date): { id: string, filePath: string } => {
    const id = `session_${now.toISOString().replace(/[:.]/g, '-').slice(0, 19)}`;
    const sessionDir = path.join(getProjectSessionsDir(cwd), id);
    fs.mkdirSync(sessionDir, { recursive: true });
    return { id, filePath: path.join(sessionDir, SESSION_DATA_FILE) };
};

const getSessionIdFromFilePath = (filePath: string): string => {
    if (path.basename(filePath) === SESSION_DATA_FILE) {
        return path.basename(path.dirname(filePath));
    }

    return path.basename(filePath, path.extname(filePath));
};

const getSessionRefFromPath = (cwd: string, filePath: string): string => {
    const projectHash = cwdHash(cwd);
    const projectDir = path.join(getSessionsDir(), projectHash);

    if (filePath.startsWith(projectDir)) {
        return path.relative(getSessionsDir(), path.dirname(filePath));
    }

    return path.basename(filePath);
};

const getSessionFilePath = (cwd: string, sessionRef: string): string | null => {
    const dir = getSessionsDir();
    const projectHash = cwdHash(cwd);
    const prefix = projectHash + '_';

    if (sessionRef.includes('/') || sessionRef.includes('\\')) {
        const normalizedRef = path.normalize(sessionRef);
        const filePath = path.join(dir, normalizedRef, SESSION_DATA_FILE);
        const projectDir = path.join(dir, projectHash);
        if (!filePath.startsWith(projectDir)) return null;
        return filePath;
    }

    if (!sessionRef.startsWith(prefix)) return null;
    return path.join(dir, sessionRef);
};

const migrateLegacySessions = (cwd: string): void => {
    const dir = getSessionsDir();
    const projectHash = cwdHash(cwd);
    const prefix = projectHash + '_';

    try {
        const files = fs.readdirSync(dir)
            .filter(f => f.startsWith(prefix) && f.endsWith('.json'));

        for (const file of files) {
            const id = file.slice(prefix.length, -'.json'.length);
            const sessionDir = path.join(getProjectSessionsDir(cwd), id);
            const from = path.join(dir, file);
            const to = path.join(sessionDir, SESSION_DATA_FILE);

            if (fs.existsSync(to)) continue;
            fs.mkdirSync(sessionDir, { recursive: true });
            fs.renameSync(from, to);
        }
    } catch {
        // Legacy migration is best-effort; loading still supports flat files.
    }
};

export const startNewSession = (cwd: string): void => {
    activeSessionFiles.delete(cwd);
};

export const getActiveSessionInfo = (cwd: string): ActiveSessionInfo => {
    migrateLegacySessions(cwd);

    const now = new Date();
    let filePath = activeSessionFiles.get(cwd);
    let id: string | null = null;

    if (filePath && fs.existsSync(filePath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Partial<SessionData>;
            id = typeof existing.id === 'string' ? existing.id : null;
        } catch {
            id = null;
        }
    } else {
        filePath = undefined;
    }

    if (!filePath) {
        const created = createSessionPath(cwd, now);
        id = created.id;
        filePath = created.filePath;

        const data: SessionData = {
            id,
            cwd,
            state: 'IDLE',
            history: [],
            savedAt: now.toISOString()
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        activeSessionFiles.set(cwd, filePath);
    }

    if (!id) {
        id = getSessionIdFromFilePath(filePath);
    }

    return {
        id,
        filePath,
        sessionDir: path.dirname(filePath),
        cwd
    };
};

export const saveSession = (history: Message[], state: PipelineState, cwd: string): string => {
    migrateLegacySessions(cwd);
    const now = new Date();
    let filePath = activeSessionFiles.get(cwd);
    let id: string | null = null;

    if (filePath && fs.existsSync(filePath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Partial<SessionData>;
            id = typeof existing.id === 'string' ? existing.id : null;
        } catch {
            id = null;
        }
    } else {
        filePath = undefined;
    }

    if (!filePath) {
        const created = createSessionPath(cwd, now);
        id = created.id;
        filePath = created.filePath;
        activeSessionFiles.set(cwd, filePath);
    }

    const data: SessionData = {
        id: id ?? getSessionIdFromFilePath(filePath),
        cwd,
        state,
        history,
        savedAt: now.toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    activeSessionFiles.set(cwd, filePath);
    return filePath;
};

export const loadLatestSession = (cwd: string): SessionData | null => {
    migrateLegacySessions(cwd);

    try {
        const sessions = listSessions(cwd);

        if (sessions.length === 0) return null;

        const filePath = getSessionFilePath(cwd, sessions[0].filename);
        if (!filePath) return null;
        const content = fs.readFileSync(filePath, 'utf8');
        activeSessionFiles.set(cwd, filePath);
        return JSON.parse(content) as SessionData;
    } catch {
        return null;
    }
};

export const listSessions = (cwd: string): { filename: string, savedAt: Date, count: number }[] => {
    const dir = getSessionsDir();
    const projectHash = cwdHash(cwd);
    const prefix = projectHash + '_';
    const result: { filename: string, savedAt: Date, count: number }[] = [];

    try {
        migrateLegacySessions(cwd);

        const projectDir = getProjectSessionsDir(cwd);
        const sessionDirs = fs.readdirSync(projectDir, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => path.join(projectDir, entry.name, SESSION_DATA_FILE))
            .filter(filePath => fs.existsSync(filePath));

        const legacyFiles = fs.readdirSync(dir)
            .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
            .map(file => path.join(dir, file));

        for (const filePath of [...sessionDirs, ...legacyFiles]) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content) as SessionData;
                result.push({
                    filename: getSessionRefFromPath(cwd, filePath),
                    savedAt: new Date(data.savedAt),
                    count: data.history.length
                });
            } catch {
                continue;
            }
        }
    } catch {
        // ignore
    }

    return result.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
};

export const loadSessionFile = (cwd: string, filename: string): SessionData | null => {
    migrateLegacySessions(cwd);

    try {
        const filePath = getSessionFilePath(cwd, filename);
        if (!filePath) return null;
        if (!fs.existsSync(filePath)) return null;
        const content = fs.readFileSync(filePath, 'utf8');
        activeSessionFiles.set(cwd, filePath);
        return JSON.parse(content) as SessionData;
    } catch {
        return null;
    }
};

export const deleteSession = (cwd: string, filename: string): boolean => {
    migrateLegacySessions(cwd);

    try {
        const filePath = getSessionFilePath(cwd, filename);
        if (!filePath) return false;
        if (fs.existsSync(filePath)) {
            if (path.basename(filePath) === SESSION_DATA_FILE) {
                fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
            } else {
                fs.unlinkSync(filePath);
            }
            if (activeSessionFiles.get(cwd) === filePath) {
                activeSessionFiles.delete(cwd);
            }
            return true;
        }
        return false;
    } catch {
        return false;
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
