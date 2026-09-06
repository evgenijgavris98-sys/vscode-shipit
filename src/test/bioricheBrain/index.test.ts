import * as assert from "assert";
import { executeBrainTask } from "../../bioricheBrain/index";
import type { BrainConfig } from "../../bioricheBrain/config";
import type { BrainProvider } from "../../bioricheBrain/types";

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

describe("BIORICHE BRAIN entry point", () => {
  it("falls back from Astra to Sol when the first provider call fails", async () => {
    const calls: string[] = [];
    const provider: BrainProvider = {
      async run(_agent, request) {
        calls.push(request.tier);
        if (request.tier === "astra") throw new Error("temporary failure");
        return "sol-result";
      },
    };

    const result = await executeBrainTask(
      { input: "research", risk: "scientific", requiresFrontier: true },
      config,
      provider,
    );
    assert.deepStrictEqual(calls, ["astra", "sol"]);
    assert.strictEqual(result.output, "sol-result");
  });

  it("refuses execution when Brain is disabled", async () => {
    await assert.rejects(
      executeBrainTask({ input: "x", risk: "routine" }, { ...config, enabled: false }, {
        run: async () => "never",
      }),
      /disabled/,
    );
  });
});
