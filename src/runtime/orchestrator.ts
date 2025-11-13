import type { Plan} from "../domain/plan.js";
import { runPlan } from "../domain/plan.js";
import type { Telemetry } from "../spi/telemetry.js";
import type { Result } from "../util/result.js";
import { ok, err } from "../util/result.js";

export class Orchestrator {
  constructor(private readonly telemetry?: Telemetry) {}

  async run(plan: Plan): Promise<Result<{ steps: { id: string; ok: boolean }[] }>> {
    try {
      this.telemetry?.info("orchestrator.run.start", { planId: plan.id, name: plan.name });
      const r = await runPlan(plan);
      if (!r.ok) {
        this.telemetry?.error("orchestrator.run.error", { error: r.error });
        return r;
      }
      this.telemetry?.info("orchestrator.run.ok", { steps: r.value.steps.length });
      return ok(r.value);
    } catch (e: any) {
      this.telemetry?.error("orchestrator.run.exception", { error: e?.message || String(e) });
      return err(e);
    }
  }
}