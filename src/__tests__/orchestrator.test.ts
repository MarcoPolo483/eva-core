import { describe, it, expect } from "vitest";

import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";

describe("Orchestrator", () => {
  it("returns ok on success", async () => {
    const orch = new Orchestrator();
    const plan = makePlan("p", [{ name: "ok", action: async () => ({ ok: true, value: {} } as any) }]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(true);
  });

  it("returns err when step fails", async () => {
    const orch = new Orchestrator();
    const plan = makePlan("p", [{ name: "nope", action: async () => ({ ok: false, error: new Error("x") } as any) }]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(false);
  });
});