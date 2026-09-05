import type { BrainTask, ModelTier } from "./types";

/** Conservative policy: high-risk work gets the strongest tier. */
export function selectModelTier(task: BrainTask): ModelTier {
  if (task.risk === "high") return "sol";
  if (task.risk === "medium") return "terra";
  return "luna";
}
