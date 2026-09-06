import type { BrainTask, BrainAgent, ModelTier, RoutingDecision } from "./types";
import type { BrainConfig } from "./config";

export function routeTask(task: BrainTask, config: BrainConfig): RoutingDecision {
  const agent: BrainAgent = task.risk === "scientific" || task.risk === "high_impact"
    ? "rd_chemist"
    : "orchestrator";

  const requiresQa = task.risk === "high_impact";
  const candidates: ModelTier[] = [];

  if (task.requiresFrontier && config.astraEnabled) candidates.push("astra");
  if (task.risk === "high_impact" || task.risk === "scientific" || task.requiresFrontier) candidates.push("sol");
  if (task.risk === "routine") candidates.push("terra", "luna");
  else candidates.push("terra", "luna");

  return {
    agent,
    candidates: [...new Set(candidates)],
    primary: candidates[0],
    requiresQa,
    reason: task.requiresFrontier && config.astraEnabled
      ? "Frontier work is explicitly enabled; Astra is the primary candidate with Sol fallback."
      : task.risk === "scientific"
        ? "Scientific work uses Sol first, with lower tiers as bounded fallback."
        : task.risk === "high_impact"
          ? "High-impact work uses Sol and requires mandatory QA."
          : "Routine work uses Terra first for the capability/cost balance."
  };
}
