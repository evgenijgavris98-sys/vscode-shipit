export type BrainAgent = "orchestrator" | "rd_chemist" | "qa_inspector";
export type ModelTier = "luna" | "terra" | "sol" | "astra";

export interface BrainTask {
  id: string;
  input: string;
  risk: "low" | "medium" | "high" | "critical";
}

export interface AgentRequest {
  task: BrainTask;
  tier: ModelTier;
  qaFeedback?: string;
}

export interface AgentResult {
  agent: BrainAgent;
  tier: ModelTier;
  output: string;
  passed: boolean;
  retryCount: number;
}

export interface BrainProvider {
  run(agent: BrainAgent, request: AgentRequest): Promise<string>;
}
