import { run } from "@openai/agents";
import { Capabilities, Manifest, SandboxAgent } from "@openai/agents/sandbox";
import { UnixLocalSandboxClient } from "@openai/agents/sandbox/local";
import { localDir } from "@openai/agents/sandbox";
import type { BrainConfig } from "./config";
import type { ApprovalGate } from "./approvalGate";
import type { AuditSink } from "./auditLog";

export interface SandboxRunResult {
  output: string;
  backend: "unix-local";
}

export async function runDevopsSandbox(
  config: BrainConfig,
  workspaceRoot: string,
  task: string,
  approvalGate: ApprovalGate,
  audit: AuditSink,
): Promise<SandboxRunResult> {
  if (!config.apiKey) throw new Error("Sandbox execution requires OPENAI_API_KEY.");
  const approved = await approvalGate.requestApproval({
    agent: "devops",
    tool: {
      id: "shell.execute",
      description: "Execute commands inside an isolated approved workspace.",
      risk: "write",
      requiresApproval: true,
      allowedAgents: ["devops", "data_scientist", "ocr_agent"],
    },
    reason: "BIORICHEBRAIN DEVOPS sandbox execution",
    inputSummary: task.slice(0, 1000),
  });
  audit.record({
    timestamp: new Date().toISOString(),
    agent: "devops",
    toolId: "shell.execute",
    outcome: approved ? "approved" : "approval_required",
    inputSummary: task.slice(0, 1000),
  });
  if (!approved) throw new Error("Sandbox execution denied until explicit human approval.");

  process.env.OPENAI_API_KEY = config.apiKey;
  const manifest = new Manifest({ entries: { repo: localDir({ src: workspaceRoot }) } });
  const agent = new SandboxAgent({
    name: "BIORICHEBRAIN — DEVOPS sandbox",
    model: config.models.sol,
    instructions: "Work only inside repo/. Inspect before editing. Run only task-relevant verification. Do not access secrets or perform deployments, purchases, legal submissions, or external irreversible actions.",
    defaultManifest: manifest,
    capabilities: Capabilities.default(),
  });
  const result = await run(agent, task, {
    sandbox: { client: new UnixLocalSandboxClient({ inheritHostEnvironment: false }) },
    maxTurns: 12,
  });
  if (!result.finalOutput) throw new Error("Sandbox returned no final output.");
  return { output: result.finalOutput, backend: "unix-local" };
}
