export type AgentRole = 'discovery' | 'architect' | 'executor' | 'reviewer' | 'orchestrator' | 'project_research';

export type PipelineState = 'IDLE' | 'DISCOVERY' | 'ARCHITECT' | 'EXECUTING' | 'REVIEW' | 'ORCHESTRATING' | 'PROJECT_RESEARCH';

export interface SystemMessage {
    role: 'system';
    content: string;
}

export interface AgentContext {
    role: AgentRole;
    systemPrompt: string;
}
