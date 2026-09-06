import * as assert from "assert";
import { loadBrainConfig } from "../../bioricheBrain/config";

describe("BIORICHE BRAIN config", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  it("defaults Brain and Astra to disabled and Copilot provider", () => {
    delete process.env.BIORICHE_BRAIN_ENABLED;
    delete process.env.BIORICHE_BRAIN_ASTRA_ENABLED;
    delete process.env.BIORICHE_BRAIN_PROVIDER;
    const config = loadBrainConfig();
    assert.strictEqual(config.enabled, false);
    assert.strictEqual(config.astraEnabled, false);
    assert.strictEqual(config.provider, "copilot");
  });

  it("reads explicit OpenAI routing settings", () => {
    process.env.BIORICHE_BRAIN_ENABLED = "true";
    process.env.BIORICHE_BRAIN_PROVIDER = "openai";
    process.env.BIORICHE_BRAIN_ASTRA_ENABLED = "true";
    process.env.BIORICHE_BRAIN_MAX_CONCURRENCY = "99";
    const config = loadBrainConfig();
    assert.strictEqual(config.enabled, true);
    assert.strictEqual(config.provider, "openai");
    assert.strictEqual(config.astraEnabled, true);
    assert.strictEqual(config.maxConcurrency, 8);
  });
});
