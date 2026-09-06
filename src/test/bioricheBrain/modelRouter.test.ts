import * as assert from "assert";
import { routeTask } from "../../bioricheBrain/modelRouter";
import type { BrainConfig } from "../../bioricheBrain/config";
import type { BrainTask } from "../../bioricheBrain/types";

const config: BrainConfig = {
  enabled: true,
  provider: "openai",
  models: { luna: "luna", terra: "terra", sol: "sol", astra: "astra" },
  astraEnabled: false,
  maxQaRetries: 1,
  maxProviderRetries: 2,
  maxConcurrency: 2,
  parallelToolCalls: true,
};

function task(risk: BrainTask["risk"], requiresFrontier = false): BrainTask {
  return { input: "test", risk, requiresFrontier };
}

describe("BIORICHE BRAIN model router", () => {
  it("uses Terra then Luna for routine work", () => {
    const decision = routeTask(task("routine"), config);
    assert.deepStrictEqual(decision.candidates, ["terra", "luna"]);
    assert.strictEqual(decision.primary, "terra");
    assert.strictEqual(decision.requiresQa, false);
  });

  it("uses Sol for scientific work", () => {
    const decision = routeTask(task("scientific"), config);
    assert.deepStrictEqual(decision.candidates, ["sol", "terra", "luna"]);
  });

  it("does not select Astra while disabled", () => {
    const decision = routeTask(task("scientific", true), config);
    assert.strictEqual(decision.candidates.includes("astra"), false);
  });

  it("selects Astra first only when explicitly enabled", () => {
    const decision = routeTask(task("scientific", true), { ...config, astraEnabled: true });
    assert.deepStrictEqual(decision.candidates, ["astra", "sol", "terra", "luna"]);
  });

  it("marks high-impact work for mandatory QA", () => {
    const decision = routeTask(task("high_impact"), config);
    assert.strictEqual(decision.requiresQa, true);
  });
});
