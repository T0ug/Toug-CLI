import { AgentRole, PipelineState } from '../agents/types';

export type ProviderName = 'ollama' | 'gemini';

export interface ProviderMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    toolCallId?: string;
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
}

export type ToolName = 'run_command' | 'read_file' | 'write_file';

export interface ToolCall {
    id: string;
    name: ToolName;
    args: Record<string, unknown>;
    source: 'xml' | 'function_call';
}

export interface ProviderError {
    message: string;
    status?: number;
    code?: string;
    raw?: unknown;
}

export type ProviderEvent =
    | { type: 'text_delta'; text: string }
    | { type: 'tool_call'; call: ToolCall }
    | { type: 'done'; finishReason?: string }
    | { type: 'error'; error: ProviderError };

export interface ProviderHealth {
    ok: boolean;
    message?: string;
}

export interface ProviderRequest {
    provider: ProviderName;
    model: string;
    messages: ProviderMessage[];
    tools: ToolDefinition[];
    abortSignal?: AbortSignal;
    metadata: {
        cwd: string;
        state: PipelineState;
        agentRole: AgentRole;
        apiKeyIndex?: number;
    };
}

export interface AIProvider {
    name: ProviderName;
    stream(request: ProviderRequest): AsyncGenerator<ProviderEvent>;
    isHealthy?(): Promise<ProviderHealth>;
}
