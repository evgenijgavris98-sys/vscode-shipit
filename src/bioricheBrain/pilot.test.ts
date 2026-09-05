import { strict as assert } from "node:assert";
import { runBrainPilot } from "./pilot";
import type { AgentRequest, BrainAgent, BrainProvider } from "./types";

class MockProvider implements BrainProvider {
  public readonly calls: Array<{ agent: BrainAgent; request: AgentRequest }> = [];

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    this.calls.push({ agent, request });
    if (agent === "rd_chemist") {
      return this.calls.filter((call) => call.agent === "rd_chemist").length === 1
        ? "draft v1"
        : "draft v2";
    }
    return this.calls.filter((call) => call.agent === "qa_inspector").length === 1
      ? "FAIL: add evidence"
      : "PASS: acceptable";
  }
}

describe("runBrainPilot", () => {
  it("regenerates the draft with QA feedback after a failure", async () => {
    const provider = new MockProvider();
    const result = await runBrainPilot(
      provider,
      { id: "1", input: "prepare an R&D draft", risk: "critical" },
      { maxQaRetries: 1 },
    );

    assert.equal(result.tier, "astra");
    assert.equal(result.passed, true);
    assert.equal(result.retryCount, 1);
    assert.equal(provider.calls.length, 4);
    assert.equal(provider.calls[0].agent, "rd_chemist");
    assert.equal(provider.calls[1].agent, "qa_inspector");
    assert.equal(provider.calls[2].agent, "rd_chemist");
    assert.equal(provider.calls[2].request.qaFeedback, "FAIL: add evidence");
    assert.equal(provider.calls[3].agent, "qa_inspector");
  });
});
