import type { BrainProvider, BrainTask, RoutingDecision } from "./types";
import type { BrainConfig } from "./config";
import { routeTask } from "./modelRouter";
import { evaluateQa } from "./qaGate";
import { createAuditEvent } from "./audit";

export interface BrainExecutionResult {
  output: string;
  routing: RoutingDecision;
  audit: ReturnType<typeof createAuditEvent>[];
}

export async function executeBrainTask(
  task: BrainTask,
  config: BrainConfig,
  provider: BrainProvider,
): Promise<BrainExecutionResult> {
  if (!config.enabled) throw new Error("BIORICHE BRAIN is disabled; set BIORICHE_BRAIN_ENABLED=true to enable it.");
  if (config.provider !== "openai") throw new Error("This entry point requires BIORICHE_BRAIN_PROVIDER=openai.");

  const routing = routeTask(task, config);
  const qa = evaluateQa(task, routing);
  const audit: BrainExecutionResult["audit"] = [];
  const started = Date.now();

  for (const tier of routing.candidates) {
    audit.push(createAuditEvent({ agent: routing.agent, tier, status: "started", reason: routing.reason }));
    try {
      const output = await provider.run(routing.agent, { task, tier });
      audit.push(createAuditEvent({ agent: routing.agent, tier, status: "completed", latencyMs: Date.now() - started }));
      if (qa.required) {
        audit.push(createAuditEvent({ agent: "qa_inspector", tier, status: "blocked", reason: "Result requires a separate QA pass before acceptance." }));
      }
      return { output, routing, audit };
    } catch (error) {
      audit.push(createAuditEvent({
        agent: routing.agent,
        tier,
        status: "failed",
        latencyMs: Date.now() - started,
        reason: error instanceof Error ? error.message : "Unknown provider error",
      }));
    }
  }

  throw new Error("All configured BIORICHE BRAIN model candidates failed.");
}

export { loadBrainConfig } from "./config";
export { routeTask } from "./modelRouter";
export { OpenAIResponsesProvider } from "./openaiProvider";
export { evaluateQa } from "./qaGate";
export { getToolPolicy, isToolAllowed } from "./toolPolicy";
