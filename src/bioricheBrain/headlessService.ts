import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { loadBrainConfig } from "./config";
import { getAgentDefinition } from "./agentRegistry";
import { TeamOrchestrator } from "./teamOrchestrator";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";
import { JsonlAuditSink } from "./auditLog";

type TaskStatus = "queued" | "running" | "succeeded" | "failed";
interface QueueTask {
  id: string;
  idempotencyKey?: string;
  input: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  result?: string;
  error?: string;
}
const DATA_DIR = process.env.BIORICHEBRAIN_DATA_DIR ?? "/var/lib/biorichebrain";
const TASK_DIR = join(DATA_DIR, "tasks");
const MAX_BODY_BYTES = 32 * 1024;
const MAX_QUEUE = Math.max(1, Math.min(500, Number(process.env.BIORICHEBRAIN_MAX_QUEUE ?? 100)));
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 15_000;

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(payload));
}
function safeError(error: unknown): string {
  return (error instanceof Error ? error.message : String(error))
    .replace(/(api[_-]?key|token|password|secret)\s*[:=]\s*\S+/gi, "$1=[REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_KEY]")
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_GITHUB_TOKEN]")
    .slice(0, 1000);
}
function authOk(req: IncomingMessage, expected: string): boolean {
  const header = req.headers.authorization ?? "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk.toString();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) throw new Error("Request body too large.");
  }
  const parsed: unknown = JSON.parse(raw || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("JSON object required.");
  return parsed as Record<string, unknown>;
}
async function atomicWrite(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const tmp = path + "." + randomUUID() + ".tmp";
  await writeFile(tmp, JSON.stringify(value, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(tmp, path);
}
function publicTask(task: QueueTask): Omit<QueueTask, "input" | "idempotencyKey"> {
  const { input: _input, idempotencyKey: _key, ...safe } = task;
  return safe;
}

/** Minimal tool-free provider for headless mode: agents can reason and delegate,
 * but cannot call workspace tools, MCP servers, or perform external writes. */
class ReadOnlyHeadlessProvider implements BrainProvider {
  public constructor(private readonly modelConfig: ReturnType<typeof loadBrainConfig>) {}
  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    if (!this.modelConfig.apiKey) throw new Error("OPENAI_API_KEY is required.");
    setDefaultOpenAIKey(this.modelConfig.apiKey);
    const definition = getAgentDefinition(agent);
    const worker = new Agent({
      name: "BIORICHEBRAIN — " + definition.name,
      instructions: [
        "You are a specialist agent for BIORICHEBRAIN.",
        "Role: " + definition.purpose,
        "This is a headless read-only runtime. No tools are available. Never claim you read files, browsed the web, checked GitHub, or executed actions.",
        "Distinguish facts, assumptions, hypotheses, and unverified recommendations. Never make medical or regulatory claims without evidence.",
        "Do not ask for or reveal credentials. Any external or irreversible action requires human approval.",
      ].join("\n"),
      model: this.modelConfig.models[request.tier],
      modelSettings: { reasoning: { effort: this.modelConfig.reasoningEffort }, timeoutMs: 120_000, text: { verbosity: "medium" } },
    });
    const result = await run(worker, request.task.input + (request.qaFeedback ? "\n\nReview feedback: " + request.qaFeedback : ""), { maxTurns: 4 });
    if (!result.finalOutput) throw new Error("Agent returned no final output.");
    return result.finalOutput;
  }
}

class DurableQueue {
  private readonly pending: string[] = [];
  private readonly tasks = new Map<string, QueueTask>();
  private readonly dedupe = new Map<string, string>();
  private active = false;
  private stopping = false;
  private readonly team: TeamOrchestrator;
  private readonly audit = new JsonlAuditSink(join(DATA_DIR, "audit.jsonl"));

  public constructor() {
    const config = loadBrainConfig(true);
    this.team = new TeamOrchestrator(new ReadOnlyHeadlessProvider(config));
  }
  public async init(): Promise<void> {
    await mkdir(TASK_DIR, { recursive: true, mode: 0o700 });
    for (const name of (await readdir(TASK_DIR)).filter((x) => x.endsWith(".json")).sort()) {
      try {
        const task = JSON.parse(await readFile(join(TASK_DIR, name), "utf8")) as QueueTask;
        if (!task || typeof task.id !== "string" || typeof task.input !== "string") continue;
        if (task.status === "running") task.status = "queued"; // at-least-once recovery after a crash
        if (task.status === "queued") this.pending.push(task.id);
        this.tasks.set(task.id, task);
        if (task.idempotencyKey) this.dedupe.set(task.idempotencyKey, task.id);
        if (task.status === "running" || task.status === "queued") await this.persist(task);
      } catch { /* Ignore malformed individual records; do not crash the whole service. */ }
    }
    void this.drain();
  }
  public listCount(): number {
    return Array.from(this.tasks.values()).filter((task) => task.status === "queued" || task.status === "running").length;
  }
  public findByKey(key: string): QueueTask | undefined {
    const id = this.dedupe.get(key);
    return id ? this.tasks.get(id) : undefined;
  }
  public async enqueue(input: string, idempotencyKey?: string): Promise<QueueTask> {
    if (idempotencyKey) {
      const existing = this.findByKey(idempotencyKey);
      if (existing) return existing;
    }
    if (this.listCount() >= MAX_QUEUE) throw new Error("Queue capacity reached; retry later.");
    const now = new Date().toISOString();
    const task: QueueTask = { id: randomUUID(), idempotencyKey, input, status: "queued", createdAt: now, updatedAt: now, attempts: 0 };
    this.tasks.set(task.id, task);
    if (idempotencyKey) this.dedupe.set(idempotencyKey, task.id);
    try {
      await this.persist(task);
    } catch (error) {
      this.tasks.delete(task.id);
      if (idempotencyKey) this.dedupe.delete(idempotencyKey);
      throw error;
    }
    this.pending.push(task.id);
    void this.drain();
    return task;
  }
  public get(id: string): QueueTask | undefined { return this.tasks.get(id); }
  public async stop(): Promise<void> { this.stopping = true; }
  private async recordAudit(event: Parameters<JsonlAuditSink["record"]>[0]): Promise<void> {
    try {
      await this.audit.record(event);
    } catch (error) {
      // A logging failure must not strand a durable task in the "running" state.
      process.stderr.write("BIORICHEBRAIN audit write failed: " + safeError(error) + "\\n");
    }
  }
  private async persist(task: QueueTask): Promise<void> {
    task.updatedAt = new Date().toISOString();
    await atomicWrite(join(TASK_DIR, task.id + ".json"), task);
  }
  private async drain(): Promise<void> {
    if (this.active || this.stopping) return;
    this.active = true;
    try {
      while (!this.stopping && this.pending.length) {
        const id = this.pending.shift();
        const task = id ? this.tasks.get(id) : undefined;
        if (!task || task.status !== "queued") continue;
        task.status = "running";
        task.attempts += 1;
        await this.persist(task);
        try {
          const result = await this.team.run(task.input);
          task.result = result.synthesis;
          task.status = "succeeded";
          await this.persist(task);
          await this.recordAudit({ timestamp: new Date().toISOString(), agent: "orchestrator", toolId: "queue.run", outcome: "allowed", runId: task.id, capability: "read_only_team_review", provenance: "durable_queue", inputSummary: "Task completed; input omitted from audit" });
        } catch (error) {
          task.error = safeError(error);
          if (task.attempts < MAX_ATTEMPTS && !this.stopping) {
            task.status = "queued";
            await this.persist(task);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * task.attempts));
            this.pending.push(task.id);
            continue;
          }
          task.status = "failed";
          await this.recordAudit({ timestamp: new Date().toISOString(), agent: "orchestrator", toolId: "queue.run", outcome: "failed", runId: task.id, capability: "read_only_team_review", provenance: "durable_queue", inputSummary: "Task failed; input omitted from audit", detail: task.error });
        }
        await this.persist(task);
      }
    } finally {
      this.active = false;
      if (!this.stopping && this.pending.length) void this.drain();
    }
  }
}

async function main(): Promise<void> {
  const token = process.env.BIORICHEBRAIN_SERVICE_TOKEN;
  if (!token || token.length < 32) throw new Error("Set BIORICHEBRAIN_SERVICE_TOKEN to a random secret of at least 32 characters.");
  if (!process.env.OPENAI_API_KEY) throw new Error("Set OPENAI_API_KEY in the service environment.");
  const host = process.env.BIORICHEBRAIN_HOST ?? "127.0.0.1";
  const port = Number(process.env.BIORICHEBRAIN_PORT ?? 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("BIORICHEBRAIN_PORT must be a valid TCP port.");
  const queue = new DurableQueue();
  await queue.init();
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/health") {
        json(res, 200, { status: "ok" });
        return;
      }
      if (!authOk(req, token)) { json(res, 401, { error: "Unauthorized" }); return; }
      if (req.method === "POST" && url.pathname === "/tasks") {
        const body = await readBody(req);
        if (typeof body.input !== "string" || !body.input.trim() || body.input.length > 12000) {
          json(res, 400, { error: "input must be a non-empty string of at most 12000 characters" }); return;
        }
        const keyHeader = req.headers["idempotency-key"];
        const key = typeof keyHeader === "string" ? keyHeader.slice(0, 200) : undefined;
        const task = await queue.enqueue(body.input.trim(), key);
        json(res, 202, publicTask(task));
        return;
      }
      const match = url.pathname.match(/^\/tasks\/([0-9a-f-]{36})$/i);
      if (req.method === "GET" && match) {
        const task = queue.get(match[1]);
        if (!task) { json(res, 404, { error: "Task not found" }); return; }
        json(res, 200, { ...publicTask(task), ...(task.result ? { result: task.result } : {}), ...(task.error ? { error: task.error } : {}) });
        return;
      }
      if (req.method === "GET" && url.pathname === "/metrics") {
        json(res, 200, { queueDepth: queue.listCount() });
        return;
      }
      json(res, 404, { error: "Not found" });
    } catch (error) {
      const message = safeError(error);
      json(res, message.includes("too large") ? 413 : 400, { error: message });
    }
  });
  server.listen(port, host, () => process.stdout.write("BIORICHEBRAIN headless service listening on " + host + ":" + port + "\n"));
  const shutdown = () => {
    void queue.stop().finally(() => server.close(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
void main().catch((error) => {
  process.stderr.write("BIORICHEBRAIN startup failed: " + safeError(error) + "\n");
  process.exitCode = 1;
});
