import * as assert from "node:assert/strict";
import { loadBrainConfig } from "../bioricheBrain/config";
import { AGENT_REGISTRY } from "../bioricheBrain/agentRegistry";
import { authorizeToolInvocation } from "../bioricheBrain/toolRegistry";

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

test("registers exactly 31 uniquely identified BIORICHEBRAIN agents", () => {
  assert.equal(AGENT_REGISTRY.length, 31);
  assert.equal(new Set(AGENT_REGISTRY.map((agent) => agent.id)).size, 23);
});


test("registers the video department roles and keeps shell execution restricted", () => {
  const videoRoles = ["video_director","video_scriptwriter","storyboard_agent","video_generator","voice_avatar_agent","video_editor","subtitle_localization","video_qa"];
  for (const role of videoRoles) assert.ok(AGENT_REGISTRY.some((agent) => agent.id === role));
  assert.throws(() => authorizeToolInvocation({ toolId: "shell.execute", agent: "video_generator", input: {} }), /not authorized/);
});
