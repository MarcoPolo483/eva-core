import type { Result } from "../util/result.js";
import type { StepId, PlanId } from "./ids.js";
export type StepContext = {
    vars: Record<string, unknown>;
};
export type Step = {
    id: StepId;
    name: string;
    action: (ctx: StepContext) => Promise<Result<{
        output?: unknown;
    }>>;
    when?: (ctx: StepContext) => boolean;
};
export type Plan = {
    id: PlanId;
    name: string;
    steps: Step[];
};
export declare function makePlan(name: string, steps: Omit<Step, "id">[] | Step[]): Plan;
export type RunResult = Result<{
    steps: {
        id: StepId;
        ok: boolean;
    }[];
}>;
export declare function runPlan(plan: Plan): Promise<RunResult>;
//# sourceMappingURL=plan.d.ts.map