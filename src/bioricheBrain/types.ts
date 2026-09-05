export type BrainAgent = "orchestrator" | "rd_chemist" | "qa_inspector";
export type ModelTier = "luna" | "terra" | "sol";

export interface BrainTask {
  id: string;
  input: string;
  risk: "low" | "medium" | "high";
}

export interface AgentRequest {
  task: BrainTask;
  tier: ModelTier;
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
