import { runPlan } from "../domain/plan.js";
import { ok, err } from "../util/result.js";
export class Orchestrator {
    telemetry;
    constructor(telemetry) {
        this.telemetry = telemetry;
    }
    async run(plan) {
        try {
            this.telemetry?.info("orchestrator.run.start", { planId: plan.id, name: plan.name });
            const r = await runPlan(plan);
            if (!r.ok) {
                this.telemetry?.error("orchestrator.run.error", { error: r.error });
                return r;
            }
            this.telemetry?.info("orchestrator.run.ok", { steps: r.value.steps.length });
            return ok(r.value);
        }
        catch (e) {
            this.telemetry?.error("orchestrator.run.exception", { error: e?.message || String(e) });
            return err(e);
        }
    }
}
//# sourceMappingURL=orchestrator.js.map