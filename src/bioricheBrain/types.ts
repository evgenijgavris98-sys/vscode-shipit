export type ModelTier = "luna" | "terra" | "sol" | "astra";

export type BrainAgent = "orchestrator" | "rd_chemist" | "qa_inspector";

export interface AgentTask {
  input: string;
}

export interface AgentRequest {
  tier: ModelTier;
  task: AgentTask;
  qaFeedback?: string;
}

export interface BrainProvider {
  run(agent: BrainAgent, request: AgentRequest): Promise<string>;
}
