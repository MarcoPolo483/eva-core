import { describe, it, expect } from "vitest";
import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";
describe("Orchestrator success without telemetry", () => {
    it("runs successfully when no telemetry is provided", async () => {
        const orch = new Orchestrator(); // no telemetry client
        const plan = makePlan("p", [
            { name: "ok", action: async () => ({ ok: true, value: {} }) }
        ]);
        const r = await orch.run(plan);
        expect(r.ok).toBe(true);
    });
});
//# sourceMappingURL=orchestrator-success-no-telemetry.test.js.map