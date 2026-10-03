import type { BrainAgent } from "./types";
import type { ToolDefinition } from "./toolRegistry";
import type { ApprovalGate, ApprovalRequest } from "./approvalGate";
import * as vscode from "vscode";

export class VscodeApprovalGate implements ApprovalGate {
  public async requestApproval(request: ApprovalRequest): Promise<boolean> {
    const choice = await vscode.window.showWarningMessage(
      `BIORICHEBRAIN: ${request.agent} requests ${request.tool.id}.\n${request.reason}\n${request.inputSummary.slice(0, 700)}`,
      { modal: true },
      "Approve",
      "Deny",
    );
    return choice === "Approve";
  }
}
