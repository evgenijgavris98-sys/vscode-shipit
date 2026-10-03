import * as assert from "node:assert/strict";
import { authorizeToolInvocation } from "../bioricheBrain/toolRegistry";
import { DenyByDefaultApprovalGate } from "../bioricheBrain/approvalGate";
import { MemoryAuditSink } from "../bioricheBrain/auditLog";

test("tool registry enforces per-agent capabilities", () => {
  assert.doesNotThrow(() => authorizeToolInvocation({
    toolId: "github.read",
    agent: "devops",
    input: { repo: "test" }
  }));
  assert.throws(
    () => authorizeToolInvocation({ toolId: "github.write", agent: "rd_chemist", input: {} }),
    /not authorized/
  );
});

test("write and irreversible tools are approval-gated", () => {
  const githubWrite = authorizeToolInvocation({ toolId: "github.write", agent: "devops", input: {} });
  const deployment = authorizeToolInvocation({ toolId: "deployment.execute", agent: "devops", input: {} });
  assert.equal(githubWrite.requiresApproval, true);
  assert.equal(githubWrite.risk, "write");
  assert.equal(deployment.requiresApproval, true);
  assert.equal(deployment.risk, "irreversible");
});

test("approval gate denies by default and audit sink records events", async () => {
  const gate = new DenyByDefaultApprovalGate();
  assert.equal(await gate.requestApproval({
    agent: "devops",
    tool: authorizeToolInvocation({ toolId: "github.write", agent: "devops", input: {} }),
    reason: "test",
    inputSummary: "test write"
  }), false);

  const sink = new MemoryAuditSink();
  sink.record({
    timestamp: new Date().toISOString(),
    agent: "devops",
    toolId: "github.write",
    outcome: "denied",
    inputSummary: "test write"
  });
  assert.equal(sink.events.length, 1);
  assert.equal(sink.events[0].outcome, "denied");
});
