import { describe, it, expect } from "vitest";
import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";
class TelemetryMock {
    infoCalls = [];
    errorCalls = [];
    info(msg, attrs) { this.infoCalls.push({ msg, attrs }); }
    warn(_msg, _attrs) { }
    error(msg, attrs) { this.errorCalls.push({ msg, attrs }); }
    async startSpan(_name, fn) { return fn(); }
}
describe("Orchestrator exception with non-Error throw", () => {
    it("logs orchestrator.run.exception and returns err when a step throws a non-Error", async () => {
        const t = new TelemetryMock();
        const orch = new Orchestrator(t);
        const plan = makePlan("p", [
            // Throw a string to exercise String(e) fallback path in catch block
            { name: "throw-nonerror", action: async () => { throw "boom"; } }
        ]);
        const r = await orch.run(plan);
        expect(r.ok).toBe(false);
        const errorMsgs = t.errorCalls.map(c => c.msg);
        expect(errorMsgs).toContain("orchestrator.run.exception");
    });
});
//# sourceMappingURL=orchestrator-nonerror-exception.test.js.map