import { describe, it, expect } from "vitest";

import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";

describe("Orchestrator exception path", () => {
  it("returns err when a step throws (uncaught by runPlan)", async () => {
    const orch = new Orchestrator();
    const plan = makePlan("p", [
      { name: "boom", action: async () => { throw new Error("kaboom"); } }
    ]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(false);
  });
});