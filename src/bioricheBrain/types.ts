export type ModelTier = "luna" | "terra" | "sol" | "astra";
export type BrainAgent = "orchestrator" | "rd_chemist" | "qa_inspector";
export type RiskLevel = "routine" | "scientific" | "high_impact";

export interface BrainTask {
  input: string;
  risk: RiskLevel;
  needsTools?: boolean;
  requiresFrontier?: boolean;
}

export interface AgentRequest {
  task: BrainTask;
  tier: ModelTier;
  qaFeedback?: string;
  reasoningEffort?: "low" | "medium" | "high" | "xhigh" | "max";
}

export interface RoutingDecision {
  agent: BrainAgent;
  candidates: ModelTier[];
  primary: ModelTier;
  requiresQa: boolean;
  reason: string;
}

export interface BrainProvider {
  run(agent: BrainAgent, request: AgentRequest): Promise<string>;
}

export interface AuditEvent {
  timestamp: string;
  agent: BrainAgent;
  tier: ModelTier;
  status: "started" | "completed" | "failed" | "blocked";
  latencyMs?: number;
  reason?: string;
}
