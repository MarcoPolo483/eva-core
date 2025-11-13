import { describe, it, expect } from "vitest";

import { Orchestrator } from "../runtime/orchestrator.js";
import { makePlan } from "../domain/plan.js";
import type { Telemetry } from "../spi/telemetry.js";

class TelemetryMock implements Telemetry {
  infoCalls: { msg: string; attrs?: Record<string, unknown> }[] = [];
  errorCalls: { msg: string; attrs?: Record<string, unknown> }[] = [];
  info(msg: string, attrs?: Record<string, unknown>): void {
    this.infoCalls.push({ msg, attrs });
  }
  warn(_msg: string, _attrs?: Record<string, unknown>): void { }
  error(msg: string, attrs?: Record<string, unknown>): void {
    this.errorCalls.push({ msg, attrs });
  }
  async startSpan<T>(_name: string, fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}

describe("Orchestrator telemetry coverage", () => {
  it("emits start and ok info logs on successful run", async () => {
    const t = new TelemetryMock();
    const orch = new Orchestrator(t);
    const plan = makePlan("p", [
      { name: "ok-step", action: async () => ({ ok: true, value: {} } as any) }
    ]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(true);
    const msgs = t.infoCalls.map(c => c.msg);
    expect(msgs).toContain("orchestrator.run.start");
    expect(msgs).toContain("orchestrator.run.ok");
    expect(t.errorCalls.length).toBe(0);
  });

  it("emits error log when a step fails", async () => {
    const t = new TelemetryMock();
    const orch = new Orchestrator(t);
    const plan = makePlan("p", [
      { name: "fail-step", action: async () => ({ ok: false, error: new Error("x") } as any) }
    ]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(false);
    const errorMsgs = t.errorCalls.map(c => c.msg);
    expect(errorMsgs).toContain("orchestrator.run.error");
  });

  it("emits exception log when an action throws (uncaught)", async () => {
    const t = new TelemetryMock();
    const orch = new Orchestrator(t);
    const plan = makePlan("p", [
      { name: "throw-step", action: async () => { throw new Error("kaboom"); } }
    ]);
    const r = await orch.run(plan);
    expect(r.ok).toBe(false);
    const errorMsgs = t.errorCalls.map(c => c.msg);
    // One of the error logs should be either run.error or run.exception
    expect(errorMsgs.some(m => m === "orchestrator.run.exception" || m === "orchestrator.run.error")).toBe(true);
  });
});