import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'node:child_process';
import { getActiveSessionInfo } from '../data/sessionManager';

export interface TerminalPaths {
    sessionDir: string;
    terminalDir: string;
    logPath: string;
    queuePath: string;
    statePath: string;
    runnerPath: string;
}

export interface TerminalSessionInfo {
    sessionId: string;
    cwdInicial: string;
    terminalDir: string;
    logPath: string;
    isOpenKnown: boolean;
}

export interface TerminalCommandResult {
    command: string;
    startedAt: string;
    finishedObservationAt: string;
    logExcerpt: string;
}

export interface ReadTerminalLogOptions {
    tailLines?: number;
}

interface TerminalState {
    sessionId: string;
    cwdInicial: string;
    logPath: string;
    queuePath: string;
    startedAt: string;
    lastKnownPid?: number;
    lastOpenedAt?: string;
    visibleWindow?: boolean;
    processedCommandIds?: string[];
}

const TERMINAL_DIR = 'terminal';
const TERMINAL_LOG_FILE = 'terminal.log';
const COMMANDS_QUEUE_FILE = 'commands.queue';
const TERMINAL_STATE_FILE = 'terminal.state.json';
const RUNNER_FILE = 'runner.ps1';
const EMPTY_TERMINAL_LOG_MESSAGE = '[TOUG INFO] Nenhum log de terminal existe para esta sessao ainda.';
const OBSERVATION_TIMEOUT_MS = 8000;
const OBSERVATION_INTERVAL_MS = 250;
const MAX_LOG_EXCERPT_CHARS = 12000;
const FILE_LOCK_RETRY_COUNT = 20;
const FILE_LOCK_RETRY_DELAY_MS = 50;

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const sleepSync = (ms: number): void => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

const normalizeTailLines = (tailLines?: number): number | undefined => {
    if (typeof tailLines !== 'number') return undefined;
    if (!Number.isFinite(tailLines)) return undefined;

    const normalized = Math.floor(tailLines);
    return normalized > 0 ? normalized : undefined;
};

const tailLog = (content: string, tailLines: number): string => {
    const lines = content.replace(/\r?\n$/, '').split(/\r?\n/);
    return lines.slice(-tailLines).join('\n');
};

const quotePowerShell = (value: string): string => `'${value.replace(/'/g, "''")}'`;
const quoteCmd = (value: string): string => `"${value.replace(/"/g, '""')}"`;

const createCommandId = (): string => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const random = Math.random().toString(36).slice(2, 8);
    return `cmd_${timestamp}_${random}`;
};

const isProcessRunning = (pid?: number): boolean => {
    if (!pid) return false;

    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
};

const isTransientFileLock = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    const code = (error as NodeJS.ErrnoException).code;
    return code === 'EBUSY' || code === 'EPERM' || code === 'EACCES';
};

const readFileBufferWithRetry = (filePath: string): Buffer => {
    let lastError: unknown;

    for (let attempt = 0; attempt < FILE_LOCK_RETRY_COUNT; attempt++) {
        try {
            return fs.readFileSync(filePath);
        } catch (error) {
            if (!isTransientFileLock(error)) {
                throw error;
            }
            lastError = error;
            sleepSync(FILE_LOCK_RETRY_DELAY_MS);
        }
    }

    throw lastError;
};

const readFileTextWithRetry = (filePath: string): string => readFileBufferWithRetry(filePath).toString('utf8');

const getFileSizeWithRetry = (filePath: string): number => {
    let lastError: unknown;

    for (let attempt = 0; attempt < FILE_LOCK_RETRY_COUNT; attempt++) {
        try {
            return fs.statSync(filePath).size;
        } catch (error) {
            if (!isTransientFileLock(error)) {
                throw error;
            }
            lastError = error;
            sleepSync(FILE_LOCK_RETRY_DELAY_MS);
        }
    }

    throw lastError;
};

const hasVisibleWindow = (pid?: number): boolean => {
    if (!pid || process.platform !== 'win32') return false;

    try {
        const result = spawnSync('powershell.exe', [
            '-NoProfile',
            '-ExecutionPolicy',
            'Bypass',
            '-Command',
            `$process = Get-Process -Id ${pid} -ErrorAction SilentlyContinue; if ($process -and $process.MainWindowHandle -ne 0) { 'true' } else { 'false' }`
        ], {
            encoding: 'utf8',
            windowsHide: true
        });
        return result.stdout.trim().toLowerCase() === 'true';
    } catch {
        return false;
    }
};

const truncateExcerpt = (content: string): string => {
    if (content.length <= MAX_LOG_EXCERPT_CHARS) return content;

    const trimmed = content.slice(content.length - MAX_LOG_EXCERPT_CHARS);
    return `[TOUG INFO] Trecho inicial omitido; exibindo os ultimos ${MAX_LOG_EXCERPT_CHARS} caracteres observados.\n${trimmed}`;
};

const readTerminalState = (paths: TerminalPaths): TerminalState | null => {
    if (!fs.existsSync(paths.statePath)) return null;

    try {
        const content = readFileTextWithRetry(paths.statePath).replace(/^\uFEFF/, '');
        return JSON.parse(content) as TerminalState;
    } catch {
        return null;
    }
};

const writeTerminalState = (paths: TerminalPaths, state: TerminalState): void => {
    fs.writeFileSync(paths.statePath, JSON.stringify(state, null, 2), 'utf8');
};

const readLogFromOffset = (logPath: string, offset: number): string => {
    if (!fs.existsSync(logPath)) return '';

    const buffer = readFileBufferWithRetry(logPath);
    if (offset >= buffer.length) return '';
    return buffer.subarray(offset).toString('utf8');
};

const getLogSize = (logPath: string): number => {
    if (!fs.existsSync(logPath)) return 0;
    return getFileSizeWithRetry(logPath);
};

const findExecutable = (name: string): string | null => {
    const result = spawnSync('where.exe', [name], {
        encoding: 'utf8',
        windowsHide: true
    });

    if (result.status !== 0) return null;
    return result.stdout.split(/\r?\n/).map(line => line.trim()).find(Boolean) ?? null;
};

const appendCommandToQueue = (paths: TerminalPaths, commandId: string, command: string, createdAt: string): void => {
    const payload = {
        id: commandId,
        createdAt,
        command,
        status: 'pending'
    };
    fs.appendFileSync(paths.queuePath, `${JSON.stringify(payload)}\n`, 'utf8');
};

const buildRunnerScript = (paths: TerminalPaths, sessionId: string, cwdInicial: string): string => {
    const logPath = quotePowerShell(paths.logPath);
    const queuePath = quotePowerShell(paths.queuePath);
    const statePath = quotePowerShell(paths.statePath);
    const cwd = quotePowerShell(cwdInicial);

    return `# Auto-generated by Toug CLI. Do not edit by hand.
$ErrorActionPreference = 'Continue'
$OutputEncoding = [System.Text.Encoding]::UTF8
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}
try {
    $Host.UI.RawUI.WindowTitle = 'Toug-CLI Terminal'
} catch {}

$TougSessionId = ${quotePowerShell(sessionId)}
$TougLogPath = ${logPath}
$TougQueuePath = ${queuePath}
$TougStatePath = ${statePath}
$TougInitialCwd = ${cwd}
$TougProcessed = @{}

function Get-TougTimestamp {
    return (Get-Date).ToUniversalTime().ToString('o')
}

function Write-TougLog {
    param(
        [string]$Tag,
        [string]$Message
    )

    $line = '[' + (Get-TougTimestamp) + '] [' + $Tag + '] ' + $Message
    Add-Content -LiteralPath $TougLogPath -Value $line -Encoding utf8
}

function Save-TougState {
    $state = [ordered]@{
        sessionId = $TougSessionId
        cwdInicial = $TougInitialCwd
        logPath = $TougLogPath
        queuePath = $TougQueuePath
        startedAt = $script:TougStartedAt
        lastKnownPid = $PID
        visibleWindow = $true
        processedCommandIds = @($TougProcessed.Keys)
    }
    $state | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $TougStatePath -Encoding utf8
}

function Restore-TougProcessed {
    if (-not (Test-Path -LiteralPath $TougStatePath)) {
        return
    }

    try {
        $existing = Get-Content -LiteralPath $TougStatePath -Raw -Encoding utf8 | ConvertFrom-Json
        foreach ($processedId in @($existing.processedCommandIds)) {
            if (-not [string]::IsNullOrWhiteSpace([string]$processedId)) {
                $TougProcessed[[string]$processedId] = $true
            }
        }
    } catch {
        Write-TougLog 'TOUG ERROR' ('Falha ao restaurar comandos processados: ' + $_.Exception.Message)
    }
}

function Invoke-TougLoggedCommand {
    param(
        [string]$Id,
        [string]$Command,
        [string]$Source
    )

    $TougProcessed[$Id] = $true
    Save-TougState
    Write-TougLog ($Source + ':' + $Id) ('PS ' + (Get-Location).Path + '> ' + $Command)

    try {
        $global:LASTEXITCODE = $null
        Invoke-Expression ($Command + ' 2>&1') | ForEach-Object {
            $line = $_ | Out-String
            $line = $line.TrimEnd()
            if ($line.Length -gt 0) {
                Write-Host $line
                foreach ($part in ($line -split "\\r?\\n")) {
                    Write-TougLog ('OUTPUT:' + $Id) $part
                }
            }
        }
        $exitCode = if ($null -ne $global:LASTEXITCODE) { $global:LASTEXITCODE } else { 0 }
    } catch {
        Write-TougLog ('ERROR:' + $Id) $_.Exception.Message
        $exitCode = 1
    }

    Write-TougLog ('END:' + $Id) ('exitCode=' + $exitCode)
    Save-TougState
}

function Process-TougQueue {
    if (-not (Test-Path -LiteralPath $TougQueuePath)) {
        New-Item -ItemType File -Path $TougQueuePath -Force | Out-Null
        return
    }

    $lines = Get-Content -LiteralPath $TougQueuePath -Encoding utf8 -ErrorAction SilentlyContinue
    foreach ($line in $lines) {
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }

        try {
            $item = $line | ConvertFrom-Json
            if (-not $item.id -or -not $item.command) {
                continue
            }

            $id = [string]$item.id
            if ($TougProcessed.ContainsKey($id)) {
                continue
            }

            Invoke-TougLoggedCommand -Id $id -Command ([string]$item.command) -Source 'COMMAND'
        } catch {
            Write-TougLog 'TOUG ERROR' ('Linha invalida em commands.queue: ' + $_.Exception.Message)
        }
    }
}

function Read-TougInteractiveCommand {
    $buffer = ''
    Write-Host -NoNewline ('PS ' + (Get-Location).Path + '> ')

    while ($true) {
        Process-TougQueue
        Start-Sleep -Milliseconds 100

        try {
            $hasKey = [Console]::KeyAvailable
        } catch {
            $hasKey = $false
        }

        if (-not $hasKey) {
            continue
        }

        try {
            $key = [Console]::ReadKey($true)
        } catch {
            continue
        }
        if ($key.Key -eq [ConsoleKey]::Enter) {
            Write-Host ''
            return $buffer
        }

        if ($key.Key -eq [ConsoleKey]::Backspace) {
            if ($buffer.Length -gt 0) {
                $buffer = $buffer.Substring(0, $buffer.Length - 1)
                Write-Host -NoNewline "\`b \`b"
            }
            continue
        }

        if ($key.KeyChar -and -not [char]::IsControl($key.KeyChar)) {
            $buffer += $key.KeyChar
            Write-Host -NoNewline $key.KeyChar
        }
    }
}

New-Item -ItemType Directory -Path (Split-Path -Parent $TougLogPath) -Force | Out-Null
if (-not (Test-Path -LiteralPath $TougLogPath)) {
    New-Item -ItemType File -Path $TougLogPath -Force | Out-Null
}
if (-not (Test-Path -LiteralPath $TougQueuePath)) {
    New-Item -ItemType File -Path $TougQueuePath -Force | Out-Null
}

$script:TougStartedAt = (Get-TougTimestamp)
Set-Location -LiteralPath $TougInitialCwd
Restore-TougProcessed
Write-TougLog 'SESSION' ('Toug CLI terminal iniciado. pid=' + $PID)
Write-TougLog 'CWD' (Get-Location).Path
Save-TougState

while ($true) {
    $manualCommand = Read-TougInteractiveCommand
    if (-not [string]::IsNullOrWhiteSpace($manualCommand)) {
        $manualId = 'manual_' + ((Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff'))
        Invoke-TougLoggedCommand -Id $manualId -Command $manualCommand -Source 'MANUAL'
    }
}
`;
};

const writeRunner = (paths: TerminalPaths, sessionId: string, cwdInicial: string): void => {
    fs.writeFileSync(paths.runnerPath, buildRunnerScript(paths, sessionId, cwdInicial), 'utf8');
};

const waitForCommandLog = async (paths: TerminalPaths, commandId: string, offset: number): Promise<{ excerpt: string; finished: boolean }> => {
    const deadline = Date.now() + OBSERVATION_TIMEOUT_MS;
    let latest = '';

    while (Date.now() <= deadline) {
        try {
            latest = readLogFromOffset(paths.logPath, offset);
        } catch (error) {
            if (isTransientFileLock(error)) {
                await delay(OBSERVATION_INTERVAL_MS);
                continue;
            }
            throw error;
        }

        if (latest.includes(`[END:${commandId}]`)) {
            return { excerpt: truncateExcerpt(latest.trim()), finished: true };
        }
        await delay(OBSERVATION_INTERVAL_MS);
    }

    try {
        latest = readLogFromOffset(paths.logPath, offset).trim();
    } catch (error) {
        if (isTransientFileLock(error)) {
            latest = '';
        } else {
            throw error;
        }
    }
    const info = latest
        ? '\n[TOUG INFO] Comando ainda nao retornou controle ao terminal; trecho acima e o log observado ate agora.'
        : `[TOUG INFO] Nenhum novo output observado ate o limite de observacao. O comando pode ainda estar em execucao no terminal persistente. commandId=${commandId}`;

    return { excerpt: truncateExcerpt(`${latest}${info}`.trim()), finished: false };
};

const waitForTerminalReady = async (paths: TerminalPaths, initialLogSize: number): Promise<void> => {
    const deadline = Date.now() + 4000;

    while (Date.now() <= deadline) {
        if (getLogSize(paths.logPath) > initialLogSize) {
            return;
        }
        await delay(OBSERVATION_INTERVAL_MS);
    }
};

const launchWithWindowsTerminal = (paths: TerminalPaths, cwd: string, powershellPath: string): boolean => {
    const wtPath = findExecutable('wt.exe');
    if (!wtPath) return false;

    const child = spawn(wtPath, [
        '-w',
        'new',
        'nt',
        '--title',
        'Toug-CLI Terminal',
        '-d',
        cwd,
        powershellPath,
        '-NoExit',
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        paths.runnerPath
    ], {
        cwd,
        detached: true,
        stdio: 'ignore',
        windowsHide: false
    });
    child.unref();
    return true;
};

const launchWithCmdStart = (paths: TerminalPaths, cwd: string, powershellPath: string): void => {
    const startCommand = [
        'start',
        quoteCmd('Toug-CLI Terminal'),
        '/D',
        quoteCmd(cwd),
        quoteCmd(powershellPath),
        '-NoExit',
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        quoteCmd(paths.runnerPath)
    ].join(' ');

    const child = spawn('cmd.exe', ['/d', '/c', startCommand], {
        cwd,
        detached: true,
        stdio: 'ignore',
        windowsHide: true
    });
    child.unref();
};

export const getTerminalPaths = (cwd: string): TerminalPaths => {
    const session = getActiveSessionInfo(cwd);
    const terminalDir = path.join(session.sessionDir, TERMINAL_DIR);

    return {
        sessionDir: session.sessionDir,
        terminalDir,
        logPath: path.join(terminalDir, TERMINAL_LOG_FILE),
        queuePath: path.join(terminalDir, COMMANDS_QUEUE_FILE),
        statePath: path.join(terminalDir, TERMINAL_STATE_FILE),
        runnerPath: path.join(terminalDir, RUNNER_FILE)
    };
};

export const ensureTerminalArtifacts = (cwd: string): TerminalPaths => {
    const paths = getTerminalPaths(cwd);
    fs.mkdirSync(paths.terminalDir, { recursive: true });
    if (!fs.existsSync(paths.queuePath)) {
        fs.writeFileSync(paths.queuePath, '', 'utf8');
    }
    return paths;
};

export const openTerminal = async (cwd: string): Promise<TerminalSessionInfo> => {
    if (process.platform !== 'win32') {
        throw new Error('Terminal persistente externo esta disponivel apenas em Windows/PowerShell nesta fase.');
    }

    const session = getActiveSessionInfo(cwd);
    const paths = ensureTerminalArtifacts(cwd);
    const previousState = readTerminalState(paths);
    const now = new Date().toISOString();
    const state: TerminalState = {
        sessionId: session.id,
        cwdInicial: session.cwd,
        logPath: paths.logPath,
        queuePath: paths.queuePath,
        startedAt: previousState?.startedAt ?? now,
        lastKnownPid: previousState?.lastKnownPid,
        lastOpenedAt: now,
        visibleWindow: previousState?.visibleWindow,
        processedCommandIds: previousState?.processedCommandIds
    };

    writeRunner(paths, session.id, session.cwd);
    writeTerminalState(paths, state);

    const previousVisibleRunnerIsAlive =
        isProcessRunning(previousState?.lastKnownPid) &&
        previousState?.visibleWindow === true &&
        fs.existsSync(paths.logPath) &&
        getLogSize(paths.logPath) > 0;

    if (previousVisibleRunnerIsAlive) {
        return {
            sessionId: session.id,
            cwdInicial: session.cwd,
            terminalDir: paths.terminalDir,
            logPath: paths.logPath,
            isOpenKnown: true
        };
    }

    if (isProcessRunning(previousState?.lastKnownPid) && previousState?.visibleWindow !== true && !hasVisibleWindow(previousState?.lastKnownPid)) {
        try {
            process.kill(previousState!.lastKnownPid!);
        } catch {
            // Best effort cleanup for hidden runners created by older versions.
        }
    }

    const initialLogSize = getLogSize(paths.logPath);
    const powershellPath = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    if (!launchWithWindowsTerminal(paths, session.cwd, powershellPath)) {
        launchWithCmdStart(paths, session.cwd, powershellPath);
    }

    await waitForTerminalReady(paths, initialLogSize);

    if (getLogSize(paths.logPath) <= initialLogSize) {
        throw new Error(
            `Nao foi possivel confirmar a abertura da janela PowerShell do Toug CLI. ` +
            `Verifique se uma janela externa apareceu e consulte o log em: ${paths.logPath}`
        );
    }

    return {
        sessionId: session.id,
        cwdInicial: session.cwd,
        terminalDir: paths.terminalDir,
        logPath: paths.logPath,
        isOpenKnown: true
    };
};

export const ensureTerminalOpen = async (cwd: string): Promise<TerminalSessionInfo> => openTerminal(cwd);

export const executeInTerminal = async (command: string, cwd: string): Promise<TerminalCommandResult> => {
    const startedAt = new Date().toISOString();
    await ensureTerminalOpen(cwd);

    const paths = ensureTerminalArtifacts(cwd);
    const commandId = createCommandId();
    const offset = getLogSize(paths.logPath);
    appendCommandToQueue(paths, commandId, command, startedAt);

    const observed = await waitForCommandLog(paths, commandId, offset);

    return {
        command,
        startedAt,
        finishedObservationAt: new Date().toISOString(),
        logExcerpt: observed.excerpt
    };
};

export const readTerminalLog = (cwd: string, options: ReadTerminalLogOptions = {}): string => {
    const paths = ensureTerminalArtifacts(cwd);

    if (!fs.existsSync(paths.logPath)) {
        return EMPTY_TERMINAL_LOG_MESSAGE;
    }

    let content: string;
    try {
        content = readFileTextWithRetry(paths.logPath);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `[TOUG INFO] O terminal.log esta ocupado no momento e nao pode ser lido. Tente novamente em alguns segundos. Detalhe: ${message}`;
    }

    if (!content) {
        return EMPTY_TERMINAL_LOG_MESSAGE;
    }

    const tailLines = normalizeTailLines(options.tailLines);
    if (!tailLines) {
        return content;
    }

    return tailLog(content, tailLines);
};
