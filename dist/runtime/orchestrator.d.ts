import type { Plan } from "../domain/plan.js";
import type { Telemetry } from "../spi/telemetry.js";
import type { Result } from "../util/result.js";
export declare class Orchestrator {
    private readonly telemetry?;
    constructor(telemetry?: Telemetry | undefined);
    run(plan: Plan): Promise<Result<{
        steps: {
            id: string;
            ok: boolean;
        }[];
    }>>;
}
//# sourceMappingURL=orchestrator.d.ts.map