import { describe, it, expect } from "vitest";
import { ok, err, unwrap } from "../util/result.js";
describe("Result", () => {
    it("unwrap returns value for ok", () => {
        const r = ok(42);
        expect(unwrap(r)).toBe(42);
    });
    it("unwrap throws for err", () => {
        const e = new Error("bad");
        const r = err(e);
        expect(() => unwrap(r)).toThrow("bad");
    });
});
//# sourceMappingURL=result.test.js.map