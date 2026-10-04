import type { ApprovalGate } from "./approvalGate";
import type { AuditSink } from "./auditLog";
import { authorizeToolInvocation } from "./toolRegistry";
import type { BrainAgent } from "./types";

export type PipelineStage = "sandbox" | "qa" | "pull_request" | "ci" | "merge";
export interface PipelineResult {
  status: "completed" | "blocked" | "failed";
  completedStages: PipelineStage[];
  blockedAt?: PipelineStage;
  pullRequestUrl?: string;
  detail: string;
}
export interface DevopsPipelineAdapter {
  runSandbox(task: string): Promise<{ output: string; success: boolean }>;
  runQa(task: string, sandboxOutput: string): Promise<{ passed: boolean; report: string }>;
  createPullRequest(task: string, qaReport: string): Promise<{ url: string; id: string }>;
  waitForCi(pullRequestId: string): Promise<{ passed: boolean; report: string }>;
  mergePullRequest(pullRequestId: string): Promise<void>;
}
const stageTool: Record<PipelineStage, string> = {
  sandbox: "shell.execute", qa: "project.read", pull_request: "github.write", ci: "github.read", merge: "deployment.execute",
};
export class DevopsPipeline {
  constructor(
    private readonly adapter: DevopsPipelineAdapter,
    private readonly approval: ApprovalGate,
    private readonly audit: AuditSink,
  ) {}

  private async authorize(stage: PipelineStage, summary: string): Promise<boolean> {
    const toolId = stageTool[stage];
    const agent: BrainAgent = "devops";
    const tool = authorizeToolInvocation({ toolId, agent, input: summary });
    if (!tool.requiresApproval) {
      await this.audit.record({ timestamp: new Date().toISOString(), agent, toolId, outcome: "allowed", inputSummary: summary });
      return true;
    }
    await this.audit.record({ timestamp: new Date().toISOString(), agent, toolId, outcome: "approval_required", inputSummary: summary });
    const approved = await this.approval.requestApproval({ agent, tool, reason: `Authorize BIORICHEBRAIN pipeline stage: ${stage}`, inputSummary: summary });
    await this.audit.record({ timestamp: new Date().toISOString(), agent, toolId, outcome: approved ? "approved" : "denied", inputSummary: summary });
    return approved;
  }

  async run(task: string): Promise<PipelineResult> {
    const completedStages: PipelineStage[] = [];
    const cleanTask = task.trim();
    if (!cleanTask) return { status: "failed", completedStages, detail: "Task must not be empty." };
    try {
      if (!(await this.authorize("sandbox", cleanTask))) return { status: "blocked", completedStages, blockedAt: "sandbox", detail: "Sandbox execution was not approved." };
      const sandbox = await this.adapter.runSandbox(cleanTask);
      if (!sandbox.success) return { status: "failed", completedStages, blockedAt: "sandbox", detail: sandbox.output };
      completedStages.push("sandbox");

      const qa = await this.adapter.runQa(cleanTask, sandbox.output);
      if (!qa.passed) return { status: "blocked", completedStages, blockedAt: "qa", detail: qa.report };
      completedStages.push("qa");

      const prSummary = `Create a pull request for: ${cleanTask}\nQA: ${qa.report}`;
      if (!(await this.authorize("pull_request", prSummary))) return { status: "blocked", completedStages, blockedAt: "pull_request", detail: "Pull request creation was not approved." };
      const pr = await this.adapter.createPullRequest(cleanTask, qa.report);
      completedStages.push("pull_request");

      const ci = await this.adapter.waitForCi(pr.id);
      if (!ci.passed) return { status: "blocked", completedStages, blockedAt: "ci", pullRequestUrl: pr.url, detail: ci.report };
      completedStages.push("ci");

      if (!(await this.authorize("merge", `Merge reviewed PR ${pr.id} (${pr.url}) after passing CI.`))) {
        return { status: "blocked", completedStages, blockedAt: "merge", pullRequestUrl: pr.url, detail: "CI passed; merge requires explicit human approval." };
      }
      await this.adapter.mergePullRequest(pr.id);
      completedStages.push("merge");
      return { status: "completed", completedStages, pullRequestUrl: pr.url, detail: "Pipeline completed; CI passed and merge was approved." };
    } catch (error) {
      return { status: "failed", completedStages, detail: error instanceof Error ? error.message : String(error) };
    }
  }
}
