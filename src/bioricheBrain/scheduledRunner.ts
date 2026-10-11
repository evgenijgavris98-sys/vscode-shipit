import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import type { AuditSink } from "./auditLog";
import type { TeamOrchestrator } from "./teamOrchestrator";

export interface SchedulerState {
  version: 1;
  enabled: boolean;
  intervalHours: number;
  nextRunAt: string;
  lastRunAt?: string;
  lastRunId?: string;
  consecutiveFailures: number;
  lastError?: string;
}

export interface ScheduledRunResult {
  runId: string;
  startedAt: string;
  finishedAt: string;
  outcome: "succeeded" | "failed";
  reportPath?: string;
  error?: string;
}

const MIN_INTERVAL_HOURS = 1;
const MAX_INTERVAL_HOURS = 168;
const TICK_MS = 30_000;
const MAX_RETRY_DELAY_MS = 6 * 60 * 60 * 1000;

function clampInterval(hours: number): number {
  if (!Number.isFinite(hours)) return 24;
  return Math.min(MAX_INTERVAL_HOURS, Math.max(MIN_INTERVAL_HOURS, Math.floor(hours)));
}

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/(api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi, "$1=[REDACTED]").slice(0, 1000);
}

/**
 * Durable, opt-in scheduler for a single team task. It is intentionally hosted
 * by the VS Code extension process: it is not a standalone 24/7 daemon.
 * State writes are atomic and overlapping runs are prevented in-process.
 */
export class ScheduledTeamRunner {
  private readonly statePath: string;
  private readonly reportsPath: string;
  private timer: ReturnType<typeof setInterval> | undefined;
  private running = false;
  private disposed = false;
  private stateLoaded = false;
  private state: SchedulerState;

  public constructor(
    storageRoot: string,
    private readonly workspaceRoot: string,
    private readonly team: TeamOrchestrator,
    private readonly audit: AuditSink,
    intervalHours = 24,
  ) {
    this.statePath = join(storageRoot, "biorichebrain-scheduler.json");
    this.reportsPath = join(workspaceRoot, ".biorichebrain", "scheduled-runs");
    const interval = clampInterval(intervalHours);
    this.state = {
      version: 1,
      enabled: false,
      intervalHours: interval,
      nextRunAt: new Date(Date.now() + interval * 3_600_000).toISOString(),
      consecutiveFailures: 0,
    };
  }

  public async start(): Promise<void> {
    if (this.disposed) throw new Error("Scheduler has been disposed.");
    await this.loadState();
    this.state.enabled = true;
    if (!this.state.lastRunAt && Date.parse(this.state.nextRunAt) < Date.now()) {
      this.state.nextRunAt = new Date().toISOString();
    }
    await this.saveState();
    if (!this.timer) this.timer = setInterval(() => { void this.tick(); }, TICK_MS);
    await this.tick();
  }

  public async stop(): Promise<void> {
    if (!this.stateLoaded) await this.loadState();
    this.state.enabled = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    await this.saveState();
  }

  public async runNow(): Promise<ScheduledRunResult> {
    if (!this.stateLoaded) await this.loadState();
    if (this.running) throw new Error("A BIORICHEBRAIN scheduled run is already in progress.");
    return this.executeRun();
  }

  public getStatus(): Readonly<SchedulerState> {
    return { ...this.state };
  }

  public dispose(): void {
    this.disposed = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  private async tick(): Promise<void> {
    if (this.disposed || !this.state.enabled || this.running) return;
    if (Date.parse(this.state.nextRunAt) > Date.now()) return;
    try {
      await this.executeRun();
    } catch {
      // executeRun persists failure state and audit; timer remains alive for retry.
    }
  }

  private async executeRun(): Promise<ScheduledRunResult> {
    if (this.running) throw new Error("A BIORICHEBRAIN scheduled run is already in progress.");
    this.running = true;
    const runId = randomUUID();
    const startedAt = new Date().toISOString();
    const task = [
      "Run the scheduled BIORICHEBRAIN project review.",
      "Review only information available to you in this run; do not claim web/GitHub checks unless those tools were actually used.",
      "Return a concise operational report with: completed/blocked work, risks, next three actions, and any approvals required.",
      "Do not perform external writes, purchases, deployments, legal submissions, or irreversible actions.",
      "Scheduler run ID: " + runId,
    ].join("\n");

    try {
      const result = await this.team.run(task);
      await fs.mkdir(this.reportsPath, { recursive: true });
      const reportPath = join(this.reportsPath, new Date(startedAt).toISOString().replace(/[:.]/g, "-") + ".md");
      const body = [
        "# BIORICHEBRAIN scheduled review",
        "",
        "- Run ID: " + runId,
        "- Started: " + startedAt,
        "- Finished: " + new Date().toISOString(),
        "- Interval: " + this.state.intervalHours + " hours",
        "",
        "## Delegation plan",
        ...result.plan.tasks.map((item, index) => (index + 1) + ". **" + item.agent + "** (" + item.tier + "): " + item.task),
        "",
        "## Agent results",
        ...result.results.map((item) => "### " + item.agent + "\n" + (item.error ? "ERROR: " + item.error : (item.output ?? "No output"))),
        "",
        "## Synthesis",
        result.synthesis,
        "",
      ].join("\n");
      await fs.writeFile(reportPath, body, { encoding: "utf8", mode: 0o600 });
      const finishedAt = new Date().toISOString();
      this.state.lastRunAt = finishedAt;
      this.state.lastRunId = runId;
      this.state.consecutiveFailures = 0;
      delete this.state.lastError;
      this.state.nextRunAt = new Date(Date.now() + this.state.intervalHours * 3_600_000).toISOString();
      await this.saveState();
      await this.audit.record({
        timestamp: finishedAt, agent: "orchestrator", toolId: "scheduler.team_run",
        outcome: "allowed", runId, capability: "scheduled_team_review",
        provenance: "scheduler", inputSummary: "Scheduled BIORICHEBRAIN team review completed",
      });
      return { runId, startedAt, finishedAt, outcome: "succeeded", reportPath };
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const message = safeError(error);
      this.state.lastRunAt = finishedAt;
      this.state.lastRunId = runId;
      this.state.consecutiveFailures += 1;
      this.state.lastError = message;
      const retryMs = Math.min(MAX_RETRY_DELAY_MS, 60_000 * (2 ** Math.min(8, this.state.consecutiveFailures - 1)));
      this.state.nextRunAt = new Date(Date.now() + retryMs).toISOString();
      await this.saveState();
      await this.audit.record({
        timestamp: finishedAt, agent: "orchestrator", toolId: "scheduler.team_run",
        outcome: "failed", runId, capability: "scheduled_team_review",
        provenance: "scheduler", inputSummary: "Scheduled BIORICHEBRAIN team review failed", detail: message,
      });
      throw error;
    } finally {
      this.running = false;
    }
  }

  private async loadState(): Promise<void> {
    if (this.stateLoaded) return;
    try {
      const parsed = JSON.parse(await fs.readFile(this.statePath, "utf8")) as Partial<SchedulerState>;
      if (parsed.version !== 1 || typeof parsed.enabled !== "boolean" ||
          typeof parsed.nextRunAt !== "string" || !Number.isFinite(Date.parse(parsed.nextRunAt))) {
        throw new Error("Invalid BIORICHEBRAIN scheduler state.");
      }
      this.state = {
        version: 1,
        enabled: parsed.enabled,
        intervalHours: clampInterval(Number(parsed.intervalHours)),
        nextRunAt: parsed.nextRunAt,
        lastRunAt: typeof parsed.lastRunAt === "string" ? parsed.lastRunAt : undefined,
        lastRunId: typeof parsed.lastRunId === "string" ? parsed.lastRunId : undefined,
        consecutiveFailures: Number.isInteger(parsed.consecutiveFailures) && Number(parsed.consecutiveFailures) >= 0
          ? Number(parsed.consecutiveFailures) : 0,
        lastError: typeof parsed.lastError === "string" ? parsed.lastError.slice(0, 1000) : undefined,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") { this.stateLoaded = true; return; }
      throw error;
    }
    this.stateLoaded = true;
  }

  private async saveState(): Promise<void> {
    await fs.mkdir(dirname(this.statePath), { recursive: true });
    const temporary = this.statePath + ".tmp";
    await fs.writeFile(temporary, JSON.stringify(this.state, null, 2), { encoding: "utf8", mode: 0o600 });
    await fs.rename(temporary, this.statePath);
  }
}
