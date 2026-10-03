import * as assert from "node:assert/strict";
import { TeamOrchestrator } from "../bioricheBrain/teamOrchestrator";
import type { AgentRequest, BrainAgent, BrainProvider } from "../bioricheBrain/types";

class FakeProvider implements BrainProvider {
  public calls: BrainAgent[] = [];

  public async run(agent: BrainAgent, request: AgentRequest): Promise<string> {
    this.calls.push(agent);
    if (agent === "orchestrator" && request.task.input.startsWith("Create a bounded delegation plan")) {
      return JSON.stringify({
        tasks: [
          { agent: "rd_chemist", task: "Review the extraction question.", tier: "sol" },
          { agent: "recipe_validator", task: "Check process consistency.", tier: "terra" },
          { agent: "qa_inspector", task: "Identify evidence gaps.", tier: "luna" }
        ]
      });
    }
    if (agent === "orchestrator") return "Synthesized answer with explicit evidence gaps.";
    return "specialist result";
  }
}

test("delegates to specialists and synthesizes their results", async () => {
  const provider = new FakeProvider();
  const result = await new TeamOrchestrator(provider).run("Assess the next R&D experiment.");
  assert.equal(result.plan.tasks.length, 3);
  assert.deepEqual(result.results.map((item) => item.agent), ["rd_chemist", "recipe_validator", "qa_inspector"]);
  assert.equal(result.results.every((item) => item.output === "specialist result"), true);
  assert.equal(result.synthesis, "Synthesized answer with explicit evidence gaps.");
  assert.equal(provider.calls.filter((agent) => agent === "orchestrator").length, 2);
});

test("rejects an invalid or orchestrator specialist plan", async () => {
  const provider: BrainProvider = {
    async run(agent, request) {
      if (agent === "orchestrator" && request.task.input.startsWith("Create a bounded delegation plan")) {
        return JSON.stringify({ tasks: [{ agent: "orchestrator", task: "delegate again" }] });
      }
      return "unexpected";
    }
  };
  await assert.rejects(
    () => new TeamOrchestrator(provider).run("test"),
    /no valid delegated tasks/
  );
});
