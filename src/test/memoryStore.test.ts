import * as assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProjectMemoryStore } from "../bioricheBrain/memoryStore";
import { FileAuditSink } from "../bioricheBrain/auditLog";

test("project memory persists provenance and status records", async () => {
  const root = await mkdtemp(join(tmpdir(), "biorichebrain-"));
  const store = new ProjectMemoryStore(root);
  const created = await store.write({
    status: "hypothesis",
    topic: "Hericium",
    content: "Candidate technical effect requires validation.",
    source: "internal R&D hypothesis",
  });
  assert.equal(created.status, "hypothesis");
  assert.equal((await store.list("Hericium")).length, 1);
  const persisted = JSON.parse(await readFile(join(root, ".biorichebrain", "memory.json"), "utf8"));
  assert.equal(persisted.version, 1);
  assert.equal(persisted.records[0].id, created.id);
});

test("concurrent writes are serialized without losing records", async () => {
  const root = await mkdtemp(join(tmpdir(), "biorichebrain-"));
  const store = new ProjectMemoryStore(root);
  await Promise.all(Array.from({ length: 25 }, (_, index) => store.write({
    status: "fact", topic: "concurrency", content: `record ${index}`,
  })));
  assert.equal((await store.list(undefined, 100)).length, 25);
});

test("corrupt memory fails closed and is not silently replaced", async () => {
  const root = await mkdtemp(join(tmpdir(), "biorichebrain-"));
  const path = join(root, ".biorichebrain", "memory.json");
  const { mkdir } = await import("node:fs/promises");
  await mkdir(join(root, ".biorichebrain"), { recursive: true });
  await writeFile(path, "{broken", "utf8");
  const store = new ProjectMemoryStore(root);
  await assert.rejects(() => store.list(), /BIORICHEBRAIN memory/);
  assert.equal(await readFile(path, "utf8"), "{broken");
});

test("file audit sink appends durable JSONL events", async () => {
  const root = await mkdtemp(join(tmpdir(), "biorichebrain-"));
  const path = join(root, ".biorichebrain", "audit.jsonl");
  const sink = new FileAuditSink(path);
  await Promise.all(Array.from({ length: 10 }, (_, index) => sink.record({
    timestamp: new Date().toISOString(), agent: "qa_inspector", toolId: `tool-${index}`, outcome: "allowed",
  })));
  const lines = (await readFile(path, "utf8")).trim().split("\n");
  assert.equal(lines.length, 10);
  assert.equal(JSON.parse(lines[0]).agent, "qa_inspector");
});
