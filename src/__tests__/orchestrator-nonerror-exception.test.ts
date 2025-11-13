import { describe, it, expect } from "vitest";

import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";
import type { Telemetry } from "../spi/telemetry.js";

class TelemetryMock implements Telemetry {
  infoCalls: { msg: string; attrs?: Record<string, unknown> }[] = [];
  errorCalls: { msg: string; attrs?: Record<string, unknown> }[] = [];
  info(msg: string, attrs?: Record<string, unknown>): void { this.infoCalls.push({ msg, attrs }); }
  warn(_msg: string, _attrs?: Record<string, unknown>): void { }
  error(msg: string, attrs?: Record<string, unknown>): void { this.errorCalls.push({ msg, attrs }); }
  async startSpan<T>(_name: string, fn: () => Promise<T>): Promise<T> { return fn(); }
}

describe("Orchestrator exception with non-Error throw", () => {
  it("logs orchestrator.run.exception and returns err when a step throws a non-Error", async () => {
    const t = new TelemetryMock();
    const orch = new Orchestrator(t);
    const plan = makePlan("p", [
      // Throw a string to exercise String(e) fallback path in catch block
      { name: "throw-nonerror", action: async () => { throw "boom"; } } as any
    ]);

    const r = await orch.run(plan);
    expect(r.ok).toBe(false);

    const errorMsgs = t.errorCalls.map(c => c.msg);
    expect(errorMsgs).toContain("orchestrator.run.exception");
  });
});