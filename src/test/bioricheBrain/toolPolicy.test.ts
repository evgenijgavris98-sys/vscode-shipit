import * as assert from "assert";
import { getToolPolicy, isToolAllowed } from "../../bioricheBrain/toolPolicy";

describe("BIORICHE BRAIN tool policy", () => {
  it("allows only explicitly listed tools", () => {
    assert.strictEqual(isToolAllowed("rd_chemist", "web_search"), true);
    assert.strictEqual(isToolAllowed("rd_chemist", "shell"), false);
    assert.strictEqual(isToolAllowed("qa_inspector", "delegate"), false);
  });

  it("bounds high-impact tool calls", () => {
    const policy = getToolPolicy("qa_inspector", "high_impact", 8, true);
    assert.strictEqual(policy.maxCalls, 4);
  });
});
