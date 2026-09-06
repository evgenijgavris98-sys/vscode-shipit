import * as assert from "assert";
import { buildStableContext, buildTaskPrompt } from "../../bioricheBrain/promptContext";

describe("BIORICHE BRAIN prompt context", () => {
  it("creates a deterministic, secret-free cache key", () => {
    const first = buildStableContext("rd_chemist");
    const second = buildStableContext("rd_chemist");
    assert.strictEqual(first.cacheKey, second.cacheKey);
    assert.strictEqual(first.cacheKey.includes("sk-"), false);
    assert.strictEqual(first.cacheKey.includes("OPENAI_API_KEY"), false);
  });

  it("separates stable instructions from task input", () => {
    const context = buildStableContext("orchestrator");
    const prompt = buildTaskPrompt(context, "Investigate task");
    assert.ok(prompt.includes("Coordinate BIORICHE BRAIN"));
    assert.ok(prompt.includes("Investigate task"));
  });
});
