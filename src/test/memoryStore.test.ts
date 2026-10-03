import * as assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProjectMemoryStore } from "../bioricheBrain/memoryStore";

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
