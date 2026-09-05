import { strict as assert } from "node:assert";
import { selectModelTier } from "./router";

describe("selectModelTier", () => {
  it("uses luna for low risk", () => {
    assert.equal(selectModelTier({ id: "1", input: "format", risk: "low" }), "luna");
  });

  it("uses terra for medium risk", () => {
    assert.equal(selectModelTier({ id: "2", input: "research", risk: "medium" }), "terra");
  });

  it("uses sol for high risk", () => {
    assert.equal(selectModelTier({ id: "3", input: "scientific decision", risk: "high" }), "sol");
  });

  it("uses astra for critical risk", () => {
    assert.equal(selectModelTier({ id: "4", input: "critical regulatory review", risk: "critical" }), "astra");
  });
});
