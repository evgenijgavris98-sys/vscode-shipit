import * as assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CheckpointStore } from "../bioricheBrain/checkpointStore";

suite("CheckpointStore", () => {
  test("persists and restores a checkpoint", async () => {
    const root = await mkdtemp(join(tmpdir(), "biorichebrain-checkpoint-"));
    try {
      const store = new CheckpointStore(root);
      await store.save({
        version: 1,
        id: "run-1",
        createdAt: "2026-10-03T00:00:00.000Z",
        updatedAt: "2026-10-03T00:00:01.000Z",
        agent: "orchestrator",
        task: "test",
        provider: "openai",
        state: "serialized-state",
      });
      const loaded = await store.load("run-1");
      assert.equal(loaded.state, "serialized-state");
      assert.equal((await store.list()).length, 1);
      assert.match(await readFile(join(root, ".biorichebrain", "checkpoints", "run-1.json"), "utf8"), /serialized-state/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
