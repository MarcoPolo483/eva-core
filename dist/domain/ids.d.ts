export type Brand<T, B> = T & {
    __brand: B;
};
export type PlanId = Brand<string, "PlanId">;
export type StepId = Brand<string, "StepId">;
export type EventId = Brand<string, "EventId">;
export declare function asPlanId(s: string): PlanId;
export declare function asStepId(s: string): StepId;
export declare function asEventId(s: string): EventId;
//# sourceMappingURL=ids.d.ts.map