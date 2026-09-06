import type { BrainAgent, RiskLevel } from "./types";

export interface ToolPolicy {
  allowedTools: string[];
  maxCalls: number;
  parallel: boolean;
}

const ALLOWLIST: Record<BrainAgent, string[]> = {
  orchestrator: ["delegate", "read_project"],
  rd_chemist: ["read_project", "web_search", "file_search"],
  qa_inspector: ["read_project", "web_search", "file_search"],
};

export function getToolPolicy(agent: BrainAgent, risk: RiskLevel, maxConcurrency: number, parallel: boolean): ToolPolicy {
  const maxCalls = risk === "high_impact" ? Math.min(4, maxConcurrency) : Math.min(8, maxConcurrency * 2);
  return { allowedTools: [...ALLOWLIST[agent]], maxCalls, parallel };
}

export function isToolAllowed(agent: BrainAgent, toolName: string): boolean {
  return ALLOWLIST[agent].includes(toolName);
}
