import * as assert from "assert";
import { createAuditEvent } from "../../bioricheBrain/audit";

describe("BIORICHE BRAIN audit", () => {
  it("redacts authorization secrets", () => {
    const event = createAuditEvent({
      agent: "orchestrator",
      tier: "sol",
      status: "failed",
      reason: "Bearer abc123 sk-secret-value",
    });
    assert.ok(event.reason?.includes("[REDACTED]"));
    assert.strictEqual(event.reason?.includes("abc123"), false);
    assert.strictEqual(event.reason?.includes("sk-secret-value"), false);
  });
});
