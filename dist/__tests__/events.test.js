import { describe, it, expect } from "vitest";
import { AnyEvent } from "../domain/events.js";
describe("Events", () => {
    it("validates tool.completed", () => {
        const ev = {
            id: "00000000-0000-4000-8000-000000000000",
            type: "tool.completed",
            at: new Date().toISOString(),
            planId: "p1",
            stepId: "s1",
            meta: { name: "search", ok: true, result: { hits: 1 } }
        };
        const parsed = AnyEvent.parse(ev);
        expect(parsed.type).toBe("tool.completed");
        if (parsed.type === "tool.completed") {
            expect(parsed.meta.ok).toBe(true);
        }
    });
    it("rejects invalid datetime", () => {
        const bad = {
            id: "00000000-0000-4000-8000-000000000000",
            type: "plan.created",
            at: "not-a-date",
            planId: "p1",
            meta: { name: "demo" }
        };
        expect(() => AnyEvent.parse(bad)).toThrow();
    });
});
//# sourceMappingURL=events.test.js.map