import * as assert from "node:assert/strict";
import { loadBrainConfig } from "../bioricheBrain/config";

declare const suite: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;

suite("BIORICHE BRAIN configuration", () => {
  test("keeps Brain disabled by default", () => {
    const previous = process.env.BIORICHE_BRAIN_ENABLED;
    delete process.env.BIORICHE_BRAIN_ENABLED;
    const config = loadBrainConfig();
    if (previous !== undefined) process.env.BIORICHE_BRAIN_ENABLED = previous;
    assert.equal(config.enabled, false);
  });

  test("uses the GPT-5.6 tier defaults and Astra mapping", () => {
    const config = loadBrainConfig();
    assert.equal(config.models.luna, "gpt-5.6-luna");
    assert.equal(config.models.terra, "gpt-5.6-terra");
    assert.equal(config.models.sol, "gpt-5.6-sol");
    assert.equal(config.models.astra, "gpt-6-astra");
    assert.equal(config.reasoningEffort, "medium");
    assert.equal(config.fastMode, false);
  });

  test("caps QA retries at three", () => {
    const previous = process.env.BIORICHE_BRAIN_MAX_QA_RETRIES;
    process.env.BIORICHE_BRAIN_MAX_QA_RETRIES = "99";
    const config = loadBrainConfig();
    if (previous === undefined) delete process.env.BIORICHE_BRAIN_MAX_QA_RETRIES;
    else process.env.BIORICHE_BRAIN_MAX_QA_RETRIES = previous;
    assert.equal(config.maxQaRetries, 3);
  });
});
