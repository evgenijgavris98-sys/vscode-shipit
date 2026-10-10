export type CopilotPermissionResult =
  | { kind: "approve-once" }
  | { kind: "reject"; feedback: string };

/** Only the explicit UI choice "Approve once" grants a single operation. */
export function permissionResultForDecision(decision: unknown): CopilotPermissionResult {
  if (decision === "Approve once") return { kind: "approve-once" };
  return {
    kind: "reject",
    feedback: "The user did not explicitly approve this operation. Do not retry it without approval.",
  };
}
