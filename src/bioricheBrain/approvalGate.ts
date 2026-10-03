import type { BrainAgent } from "./types";
import type { ToolDefinition } from "./toolRegistry";

export interface ApprovalRequest {
  agent: BrainAgent;
  tool: ToolDefinition;
  reason: string;
  inputSummary: string;
}

export interface ApprovalGate {
  requestApproval(request: ApprovalRequest): Promise<boolean>;
}

export class DenyByDefaultApprovalGate implements ApprovalGate {
  public async requestApproval(_request: ApprovalRequest): Promise<boolean> {
    return false;
  }
}
