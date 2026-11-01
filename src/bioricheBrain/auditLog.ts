import { createHash, randomUUID } from "node:crypto";
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
  /** Stable correlation ID for a single run, when the caller has one. */
  runId?: string;
  /** Identifies the policy/capability decision responsible for this event. */
  capability?: string;
  /** Provenance label; e.g. user_request, model_plan, or resumed_checkpoint. */
  provenance?: string;
}

export interface AuditSink {
  record(event: AuditEvent): Promise<void> | void;
}

/** Redact common credential patterns before any audit data reaches disk. */
export function redactAuditText(value: string, maxLength = 1200): string {
  return value
    .replace(/(api[_-]?key|access[_-]?token|refresh[_-]?token|password|secret|authorization)(\s*[:=]\s*)(["']?)[^\s,"'}]+\3/gi, "$1$2[REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_KEY]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]")
    .slice(0, maxLength);
}

function normalizeEvent(event: AuditEvent): AuditEvent & { eventId: string; inputDigest?: string } {
  const inputSummary = event.inputSummary === undefined
    ? undefined
    : redactAuditText(event.inputSummary);
  const detail = event.detail === undefined ? undefined : redactAuditText(event.detail);
  const inputDigest = event.inputSummary === undefined
    ? undefined
    : createHash("sha256").update(inputSummary ?? "").digest("hex");
  return {
    ...event,
    eventId: randomUUID(),
    inputSummary,
    detail,
    inputDigest,
    timestamp: Number.isNaN(Date.parse(event.timestamp)) ? new Date().toISOString() : event.timestamp,
  };
}

/** In-memory sink retained for unit tests and short-lived runs. */
export class MemoryAuditSink implements AuditSink {
  public readonly events: Array<AuditEvent & { eventId?: string; inputDigest?: string }> = [];

  public record(event: AuditEvent): void {
    this.events.push(normalizeEvent(event));
  }
}

/**
 * Append-only JSONL audit sink. Store it in VS Code's global storage, not the
 * project workspace, so normal project commits do not accidentally publish logs.
 * Writes are serialized within this process; this is not a tamper-proof ledger.
 */
export class JsonlAuditSink implements AuditSink {
  private pending: Promise<void> = Promise.resolve();

  public constructor(private readonly filePath: string) {}

  public record(event: AuditEvent): Promise<void> {
    const normalized = normalizeEvent(event);
    const line = JSON.stringify(normalized) + "\n";
    const write = this.pending.then(async () => {
      await mkdir(dirname(this.filePath), { recursive: true });
      await appendFile(this.filePath, line, { encoding: "utf8", mode: 0o600 });
    });
    // Keep the queue usable after a failed write, while still returning the
    // current write's rejection to its caller (fail closed at the call site).
    this.pending = write.catch(() => undefined);
    return write;
  }
}
