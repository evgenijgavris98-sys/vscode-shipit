import * as assert from "assert";
import { refreshModelPolicy } from "../../bioricheBrain/modelMonitor";

describe("BIORICHE BRAIN model monitor", () => {
  it("normalizes the four model tiers", () => {
    const snapshot = refreshModelPolicy([
      { tier: "terra", id: "gpt-5.6-terra", available: true },
      { tier: "astra", id: "gpt-6-astra", available: true },
    ]);
    assert.strictEqual(snapshot.models.terra.available, true);
    assert.strictEqual(snapshot.models.luna.available, false);
    assert.ok(snapshot.refreshedAt);
  });
});
