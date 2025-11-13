export type Brand<T, B> = T & { __brand: B };

export type PlanId = Brand<string, "PlanId">;
export type StepId = Brand<string, "StepId">;
export type EventId = Brand<string, "EventId">;

export function asPlanId(s: string): PlanId { return s as PlanId; }
export function asStepId(s: string): StepId { return s as StepId; }
export function asEventId(s: string): EventId { return s as EventId; }