import type { BrainTask, RoutingDecision } from "./types";

export interface QaDecision {
  required: boolean;
  allowed: boolean;
  reason: string;
}

export function evaluateQa(task: BrainTask, routing: RoutingDecision): QaDecision {
  const required = routing.requiresQa || task.risk === "scientific" || task.risk === "high_impact";
  return {
    required,
    allowed: true,
    reason: required ? "QA is mandatory for scientific or high-impact work." : "QA is optional for routine work.",
  };
}
