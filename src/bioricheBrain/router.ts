import type { BrainTask, ModelTier } from "./types";

/** Conservative policy: critical work gets Astra; lower risk stays cost-aware. */
export function selectModelTier(task: BrainTask): ModelTier {
  if (task.risk === "critical") return "astra";
  if (task.risk === "high") return "sol";
  if (task.risk === "medium") return "terra";
  return "luna";
}
