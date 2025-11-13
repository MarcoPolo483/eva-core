import { describe, it, expect } from "vitest";

import { makePlan, runPlan } from "../domain/plan.js";

describe("Plan", () => {
  it("runs steps in order and summarizes", async () => {
    const plan = makePlan("p", [
      { name: "a", action: async () => ({ ok: true, value: {} } as any) },
      { name: "b", action: async () => ({ ok: true, value: {} } as any) }
    ]);
    const r = await runPlan(plan);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.steps).toHaveLength(2);
  });

  it("stops on first failure", async () => {
    const plan = makePlan("p", [
      { name: "a", action: async () => ({ ok: false, error: new Error("x") } as any) },
      { name: "b", action: async () => ({ ok: true, value: {} } as any) }
    ]);
    const r = await runPlan(plan);
    expect(r.ok).toBe(false);
  });

  it("skips step when predicate false", async () => {
    const plan = makePlan("p", [
      { name: "a", when: () => false, action: async () => ({ ok: true, value: {} } as any) }
    ]);
    const r = await runPlan(plan);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.steps[0].ok).toBe(true);
  });
});