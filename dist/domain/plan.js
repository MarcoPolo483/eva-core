import { ok, err } from "../util/result.js";
import { asPlanId, asStepId } from "./ids.js";
export function makePlan(name, steps) {
    const normalized = steps.map((s, i) => ({
        id: s.id ?? asStepId(`${name}-s${i + 1}`),
        name: s.name,
        action: s.action,
        when: s.when
    }));
    return { id: asPlanId(name), name, steps: normalized };
}
export async function runPlan(plan) {
    const ctx = { vars: {} };
    const summary = [];
    for (const s of plan.steps) {
        if (s.when && !s.when(ctx)) {
            summary.push({ id: s.id, ok: true });
            continue;
        }
        const r = await s.action(ctx);
        summary.push({ id: s.id, ok: r.ok });
        if (!r.ok)
            return err({ message: `Step failed: ${s.name}`, cause: r.error });
    }
    return ok({ steps: summary });
}
//# sourceMappingURL=plan.js.map