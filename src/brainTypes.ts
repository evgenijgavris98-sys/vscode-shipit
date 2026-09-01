/**
 * DELINA/BIORICHE Brain execution domain.
 * Kept independent from the VS Code UI and ShipIt file format.
 */

export type BrainTaskStage =
    | 'PLANNED'
    | 'ASSIGNED'
    | 'IN_PROGRESS'
    | 'REVIEW'
    | 'RETRY'
    | 'COMPLETE'
    | 'BLOCKED';

export type AgentId = string;

export interface AgentDefinition {
    id: AgentId;
    name: string;
    description: string;
    capabilities: string[];
    requiresReview?: boolean;
}

export interface AgentAssignment {
    agentId: AgentId;
    assignedAt: number;
    reason: string;
}

export interface ReviewGate {
    id: string;
    name: string;
    required: boolean;
}

export interface BrainTask {
    id: string;
    title: string;
    description: string;
    stage: BrainTaskStage;
    assignment?: AgentAssignment;
    reviewGates: ReviewGate[];
    retryCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface AgentResult {
    taskId: string;
    agentId: AgentId;
    status: 'SUCCESS' | 'FAILED' | 'BLOCKED';
    summary: string;
    evidence: string[];
    nextAction?: string;
    completedAt: number;
}

export interface BrainExecutionPolicy {
    maxRetries: number;
    requireReviewBeforeComplete: boolean;
    allowBlockedTaskSkip: boolean;
}

export const DEFAULT_BRAIN_EXECUTION_POLICY: BrainExecutionPolicy = {
    maxRetries: 3,
    requireReviewBeforeComplete: true,
    allowBlockedTaskSkip: false
};
