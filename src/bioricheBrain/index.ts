import type { BrainProvider, BrainTask, RoutingDecision } from "./types";
import type { BrainConfig } from "./config";
import { routeTask } from "./modelRouter";
import { evaluateQa } from "./qaGate";
import { createAuditEvent } from "./audit";

export interface BrainExecutionResult {
  output: string;
  routing: RoutingDecision;
  audit: ReturnType<typeof createAuditEvent>[];
  qaOutput?: string;
}

export async function executeBrainTask(task: BrainTask, config: BrainConfig, provider: BrainProvider): Promise<BrainExecutionResult> {
  if (!config.enabled) throw new Error("BIORICHE BRAIN is disabled; set BIORICHE_BRAIN_ENABLED=true to enable it.");
  if (config.provider !== "openai") throw new Error("This entry point requires BIORICHE_BRAIN_PROVIDER=openai.");

  const routing = routeTask(task, config);
  const qa = evaluateQa(task, routing);
  const audit: BrainExecutionResult["audit"] = [];

  for (const tier of routing.candidates) {
    const started = Date.now();
    audit.push(createAuditEvent({ agent: routing.agent, tier, status: "started", reason: routing.reason }));
    try {
      const output = await provider.run(routing.agent, { task, tier });
      audit.push(createAuditEvent({ agent: routing.agent, tier, status: "completed", latencyMs: Date.now() - started }));
      if (!qa.required) return { output, routing, audit };

      let qaOutput = "";
      for (let attempt = 0; attempt <= config.maxQaRetries; attempt += 1) {
        qaOutput = await provider.run("qa_inspector", {
          task: { ...task, input: `Review this proposed result for the BIORICHE BRAIN task:\n${output}` },
          tier,
          qaFeedback: attempt > 0 ? qaOutput : undefined,
        });
        if (/^PASS\b/i.test(qaOutput.trim())) {
          audit.push(createAuditEvent({ agent: "qa_inspector", tier, status: "completed", latencyMs: Date.now() - started, reason: "Mandatory QA passed." }));
          return { output, routing, audit, qaOutput };
        }
      }
      audit.push(createAuditEvent({ agent: "qa_inspector", tier, status: "blocked", latencyMs: Date.now() - started, reason: "Mandatory QA did not return PASS." }));
    } catch (error) {
      audit.push(createAuditEvent({ agent: routing.agent, tier, status: "failed", latencyMs: Date.now() - started, reason: error instanceof Error ? error.message : "Unknown provider error" }));
    }
  }

  throw new Error("All configured BIORICHE BRAIN model candidates failed or were blocked by QA.");
}

export { loadBrainConfig } from "./config";
export { routeTask } from "./modelRouter";
export { OpenAIResponsesProvider } from "./openaiProvider";
export { evaluateQa } from "./qaGate";
export { getToolPolicy, isToolAllowed } from "./toolPolicy";
