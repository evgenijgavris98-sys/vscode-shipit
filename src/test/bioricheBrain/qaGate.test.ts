import * as assert from "assert";
import { evaluateQa } from "../../bioricheBrain/qaGate";
import { routeTask } from "../../bioricheBrain/modelRouter";
import type { BrainConfig } from "../../bioricheBrain/config";

const config: BrainConfig = {
  enabled: true,
  provider: "openai",
  models: { luna: "luna", terra: "terra", sol: "sol", astra: "astra" },
  astraEnabled: true,
  maxQaRetries: 1,
  maxProviderRetries: 2,
  maxConcurrency: 2,
  parallelToolCalls: true,
};

describe("BIORICHE BRAIN QA gate", () => {
  it("requires QA for scientific and high-impact tasks", () => {
    for (const risk of ["scientific", "high_impact"] as const) {
      const task = { input: "test", risk };
      const decision = evaluateQa(task, routeTask(task, config));
      assert.strictEqual(decision.required, true);
    }
  });

  it("does not require QA for routine work", () => {
    const task = { input: "test", risk: "routine" as const };
    assert.strictEqual(evaluateQa(task, routeTask(task, config)).required, false);
  });
});
