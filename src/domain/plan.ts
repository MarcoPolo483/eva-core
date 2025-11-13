import type { Result} from "../util/result.js";
import { ok, err } from "../util/result.js";

import type { StepId, PlanId} from "./ids.js";
import { asPlanId, asStepId } from "./ids.js";


export type StepContext = {
  vars: Record<string, unknown>;
};

export type Step = {
  id: StepId;
  name: string;
  // action executes this step and may mutate context.vars
  action: (ctx: StepContext) => Promise<Result<{ output?: unknown }>>;
  // optional predicate for gating
  when?: (ctx: StepContext) => boolean;
};

export type Plan = {
  id: PlanId;
  name: string;
  steps: Step[];
};

export function makePlan(name: string, steps: Omit<Step, "id">[] | Step[]): Plan {
  const normalized: Step[] = steps.map((s, i) => ({
    id: (s as Step).id ?? asStepId(`${name}-s${i + 1}`),
    name: s.name,
    action: s.action,
    when: s.when
  }));
  return { id: asPlanId(name), name, steps: normalized };
}

export type RunResult = Result<{ steps: { id: StepId; ok: boolean }[] }>;

export async function runPlan(plan: Plan): Promise<RunResult> {
  const ctx: StepContext = { vars: {} };
  const summary: { id: StepId; ok: boolean }[] = [];
  for (const s of plan.steps) {
    if (s.when && !s.when(ctx)) {
      summary.push({ id: s.id, ok: true });
      continue;
    }
    const r = await s.action(ctx);
    summary.push({ id: s.id, ok: r.ok });
    if (!r.ok) return err({ message: `Step failed: ${s.name}`, cause: r.error } as any);
  }
  return ok({ steps: summary });
}