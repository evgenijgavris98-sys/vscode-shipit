import * as assert from "node:assert/strict";
import { DevopsPipeline, type DevopsPipelineAdapter } from "../bioricheBrain/devopsPipeline";
import { MemoryAuditSink } from "../bioricheBrain/auditLog";
import type { ApprovalGate } from "../bioricheBrain/approvalGate";

function setup(options: { qa?: boolean; ci?: boolean; approvals?: boolean[] } = {}) {
  const calls: string[] = [];
  const adapter: DevopsPipelineAdapter = {
    runSandbox: async () => { calls.push("sandbox"); return { success: true, output: "changed files" }; },
    runQa: async () => { calls.push("qa"); return { passed: options.qa ?? true, report: "QA report" }; },
    createPullRequest: async () => { calls.push("pr"); return { url: "https://github.com/example/repo/pull/1", id: "1" }; },
    waitForCi: async () => { calls.push("ci"); return { passed: options.ci ?? true, report: "CI report" }; },
    mergePullRequest: async () => { calls.push("merge"); },
  };
  let approvalIndex = 0;
  const approval: ApprovalGate = { requestApproval: async () => options.approvals?.[approvalIndex++] ?? false };
  const audit = new MemoryAuditSink();
  return { pipeline: new DevopsPipeline(adapter, approval, audit), calls, audit };
}

suite("DevopsPipeline", () => {
  test("stops before sandbox when approval is denied", async () => {
    const s = setup();
    const result = await s.pipeline.run("Implement feature");
    assert.equal(result.status, "blocked");
    assert.equal(result.blockedAt, "sandbox");
    assert.deepEqual(s.calls, []);
    assert.equal(s.audit.events.at(-1)?.outcome, "denied");
  });
  test("does not create a PR when QA fails", async () => {
    const s = setup({ approvals: [true], qa: false });
    const result = await s.pipeline.run("Implement feature");
    assert.equal(result.blockedAt, "qa");
    assert.deepEqual(s.calls, ["sandbox", "qa"]);
  });
  test("does not merge when CI fails", async () => {
    const s = setup({ approvals: [true, true], ci: false });
    const result = await s.pipeline.run("Implement feature");
    assert.equal(result.blockedAt, "ci");
    assert.ok(result.pullRequestUrl);
    assert.equal(s.calls.includes("merge"), false);
  });
  test("requires a separate explicit approval to merge after CI", async () => {
    const s = setup({ approvals: [true, true, false] });
    const result = await s.pipeline.run("Implement feature");
    assert.equal(result.blockedAt, "merge");
    assert.deepEqual(s.calls, ["sandbox", "qa", "pr", "ci"]);
  });
  test("completes only after sandbox, QA, PR, CI and merge approvals", async () => {
    const s = setup({ approvals: [true, true, true] });
    const result = await s.pipeline.run("Implement feature");
    assert.equal(result.status, "completed");
    assert.deepEqual(result.completedStages, ["sandbox", "qa", "pull_request", "ci", "merge"]);
    assert.deepEqual(s.calls, ["sandbox", "qa", "pr", "ci", "merge"]);
  });
});
