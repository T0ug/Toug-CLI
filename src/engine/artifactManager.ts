import fs from 'fs';
import path from 'path';

export const readArtifact = (filePath: string, cwd: string): string => {
    const fullPath = path.resolve(cwd, filePath);
    if (!fs.existsSync(fullPath)) {
        return `[ERRO] Arquivo não encontrado: ${filePath}`;
    }
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.length > 5000) {
            return content.substring(0, 4997) + '...';
        }
        return content;
    } catch (e: any) {
        return `[ERRO] Falha ao ler arquivo: ${e.message}`;
    }
};

export const writeArtifact = (filePath: string, content: string, cwd: string): string => {
    const fullPath = path.resolve(cwd, filePath);
    try {
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(fullPath, content, 'utf8');
        return `Arquivo gravado com sucesso: ${filePath}`;
    } catch (e: any) {
        return `[ERRO] Falha ao gravar arquivo: ${e.message}`;
    }
};

export const listArtifacts = (dirPath: string, cwd: string): string[] => {
    const fullPath = path.resolve(cwd, dirPath);
    if (!fs.existsSync(fullPath)) {
        return [];
    }
    try {
        return fs.readdirSync(fullPath).filter(f => !f.startsWith('.'));
    } catch {
        return [];
    }
};
