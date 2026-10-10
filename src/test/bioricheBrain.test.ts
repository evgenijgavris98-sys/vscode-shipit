import * as assert from "node:assert/strict";
import { loadBrainConfig } from "../bioricheBrain/config";
import { AGENT_REGISTRY } from "../bioricheBrain/agentRegistry";
import { getSkillIdsForAgent } from "../bioricheBrain/skillLoader";

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

  test("keeps Astra disabled by default", () => {
    const previous = process.env.BIORICHE_BRAIN_ASTRA_ENABLED;
    delete process.env.BIORICHE_BRAIN_ASTRA_ENABLED;
    const config = loadBrainConfig();
    if (previous !== undefined) process.env.BIORICHE_BRAIN_ASTRA_ENABLED = previous;
    assert.equal(config.astraEnabled, false);
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


test("falls back safely for malformed QA retry values", () => {
  const previous = process.env.BIORICHE_BRAIN_MAX_QA_RETRIES;
  process.env.BIORICHE_BRAIN_MAX_QA_RETRIES = "not-a-number";
  try {
    assert.equal(loadBrainConfig().maxQaRetries, 1);
  } finally {
    if (previous === undefined) delete process.env.BIORICHE_BRAIN_MAX_QA_RETRIES;
    else process.env.BIORICHE_BRAIN_MAX_QA_RETRIES = previous;
  }
});

test("maps reviewed skills only to the intended BIORICHEBRAIN agents", () => {\n  assert.deepEqual(getSkillIdsForAgent("sales_bot"), ["brand-copywriting", "growth-marketing"]);\n  assert.deepEqual(getSkillIdsForAgent("data_scientist"), ["analytics-review"]);\n  assert.deepEqual(getSkillIdsForAgent("label_designer"), ["premium-design-brief"]);\n  assert.deepEqual(getSkillIdsForAgent("devops"), ["software-engineering"]);\n  assert.deepEqual(getSkillIdsForAgent("lab_director"), []);\n});\n\ntest("registers exactly 22 uniquely identified BIORICHEBRAIN agents", () => {
  assert.equal(AGENT_REGISTRY.length, 22);
  assert.equal(new Set(AGENT_REGISTRY.map((agent) => agent.id)).size, 22);
});
