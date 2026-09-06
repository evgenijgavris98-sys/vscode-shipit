import type { AuditEvent, BrainAgent, ModelTier } from "./types";

export function createAuditEvent(input: {
  agent: BrainAgent;
  tier: ModelTier;
  status: AuditEvent["status"];
  latencyMs?: number;
  reason?: string;
}): AuditEvent {
  return {
    timestamp: new Date().toISOString(),
    agent: input.agent,
    tier: input.tier,
    status: input.status,
    latencyMs: input.latencyMs,
    reason: redactReason(input.reason),
  };
}

function redactReason(reason?: string): string | undefined {
  if (!reason) return undefined;
  return reason
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    .slice(0, 500);
}
