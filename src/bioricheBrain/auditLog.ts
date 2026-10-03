export type AuditOutcome = "allowed" | "approval_required" | "approved" | "denied" | "failed";

export interface AuditEvent {
  timestamp: string;
  agent: string;
  toolId: string;
  outcome: AuditOutcome;
  inputSummary?: string;
  detail?: string;
}

export interface AuditSink {
  record(event: AuditEvent): Promise<void> | void;
}

export class MemoryAuditSink implements AuditSink {
  public readonly events: AuditEvent[] = [];

  public record(event: AuditEvent): void {
    this.events.push({ ...event });
  }
}
