# API Contracts - Toug CLI Provider Evolution

## Provider

```ts
type ProviderName = 'ollama' | 'gemini';

interface AIProvider {
  name: ProviderName;
  stream(request: ProviderRequest): AsyncGenerator<ProviderEvent>;
  isHealthy?(): Promise<ProviderHealth>;
}
```

```ts
interface ProviderRequest {
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
```

```ts
interface ProviderMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
}
```

```ts
type ProviderEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call'; call: ToolCall }
  | { type: 'done'; finishReason?: string }
  | { type: 'error'; error: ProviderError };
```

## Tools

```ts
type ToolName = 'run_command' | 'read_file' | 'write_file';

interface ToolCall {
  id: string;
  name: ToolName;
  args: Record<string, unknown>;
  source: 'xml' | 'function_call';
}
```

```ts
interface ToolResult {
  callId: string;
  name: ToolName;
  ok: boolean;
  content: string;
  risk?: SafetyDecision;
}
```

## Tool Args

```ts
interface RunCommandArgs {
  command: string;
  cwd?: string;
}

interface ReadFileArgs {
  path: string;
}

interface WriteFileArgs {
  path: string;
  content: string;
}
```

## Safety

```ts
interface SafetyDecision {
  allowedByAutoApprove: boolean;
  requiresApproval: boolean;
  reason: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

## Pipeline Rules

```ts
interface PipelinePhaseRule {
  state: PipelineState;
  agentRole: AgentRole;
  requiredArtifacts: string[];
  requiredHandoff: boolean;
  exitCriteria: ExitCriterion[];
  nextState: PipelineState | ((context: PipelineContext) => PipelineState);
}
```

## Artifact Validation

```ts
interface ArtifactValidationResult {
  ok: boolean;
  missingArtifacts: string[];
  invalidArtifacts: Array<{
    path: string;
    reason: string;
  }>;
  feedbackForAgent: string;
}
```

## Gemini Error Policy

```ts
type GeminiErrorAction =
  | 'retry_same_key'
  | 'try_next_key'
  | 'ask_reduce_context'
  | 'cancel_message'
  | 'return_to_prompt'
  | 'fatal_log_and_end'
  | 'ask_remove_key';
```

## Config V2

```ts
interface TougConfigV2 {
  configVersion: 2;
  lastProvider: 'ollama' | 'gemini';
  ollama: {
    endpoint: string;
  };
  gemini: {
    apiKeys: string[];
  };
  autoApproveMode: boolean;
}
```
