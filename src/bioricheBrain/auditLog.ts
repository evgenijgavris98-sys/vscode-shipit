import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

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

/** In-memory sink for tests and explicitly ephemeral sessions only. */
export class MemoryAuditSink implements AuditSink {
  public readonly events: AuditEvent[] = [];

  public record(event: AuditEvent): void {
    this.events.push({ ...event });
  }
}

/**
 * Append-only JSONL audit sink for durable local records.
 * Callers must provide redacted summaries; secrets and raw tool payloads must never be logged.
 */
export class FileAuditSink implements AuditSink {
  private writeQueue: Promise<void> = Promise.resolve();

  public constructor(private readonly filePath: string) {}

  public record(event: AuditEvent): Promise<void> {
    const operation = this.writeQueue.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      await appendFile(this.filePath, JSON.stringify(event) + "\n", { encoding: "utf8", mode: 0o600 });
    });
    this.writeQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }
}
