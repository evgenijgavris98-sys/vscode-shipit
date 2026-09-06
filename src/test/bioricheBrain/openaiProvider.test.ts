import * as assert from "assert";
import { OpenAIResponsesProvider } from "../../bioricheBrain/openaiProvider";
import type { BrainConfig } from "../../bioricheBrain/config";

const config: BrainConfig = {
  enabled: true,
  provider: "openai",
  apiKey: "test-key",
  models: { luna: "gpt-5.6-luna", terra: "gpt-5.6-terra", sol: "gpt-5.6-sol", astra: "gpt-6-astra" },
  astraEnabled: true,
  maxQaRetries: 1,
  maxProviderRetries: 2,
  maxConcurrency: 2,
  parallelToolCalls: true,
};

describe("OpenAI Responses provider", () => {
  it("uses the selected model and deterministic cache key", async () => {
    const originalFetch = globalThis.fetch;
    let captured: { body: string; authorization: string | null } | undefined;
    globalThis.fetch = async (_input, init) => {
      captured = {
        body: String(init?.body),
        authorization: new Headers(init?.headers).get("Authorization"),
      };
      return new Response(JSON.stringify({ output_text: "ok" }), { status: 200, headers: { "Content-Type": "application/json" } });
    };

    try {
      const provider = new OpenAIResponsesProvider(config);
      const result = await provider.run("orchestrator", { task: { input: "hello", risk: "routine" }, tier: "terra" });
      assert.strictEqual(result, "ok");
      const body = JSON.parse(captured?.body ?? "{}");
      assert.strictEqual(body.model, "gpt-5.6-terra");
      assert.strictEqual(body.prompt_cache_key, "bioriche-brain:orchestrator:v2");
      assert.strictEqual(captured?.authorization, "Bearer test-key");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
