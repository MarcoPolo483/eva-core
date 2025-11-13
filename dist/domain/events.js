import { z } from "zod";
export const BaseEvent = z.object({
    id: z.string().uuid(),
    type: z.string(),
    at: z.string().datetime(),
    planId: z.string(),
    stepId: z.string().optional()
});
export const PlanCreated = BaseEvent.extend({
    type: z.literal("plan.created"),
    meta: z.object({
        name: z.string()
    })
});
export const StepStarted = BaseEvent.extend({
    type: z.literal("step.started"),
    meta: z.object({ name: z.string() })
});
export const StepCompleted = BaseEvent.extend({
    type: z.literal("step.completed"),
    meta: z.object({ name: z.string(), ok: z.boolean() })
});
export const ToolCallRequested = BaseEvent.extend({
    type: z.literal("tool.requested"),
    meta: z.object({
        name: z.string(),
        args: z.unknown()
    })
});
export const ToolCallCompleted = BaseEvent.extend({
    type: z.literal("tool.completed"),
    meta: z.object({
        name: z.string(),
        ok: z.boolean(),
        result: z.unknown().optional(),
        error: z.string().optional()
    })
});
export const ErrorOccurred = BaseEvent.extend({
    type: z.literal("error"),
    meta: z.object({
        message: z.string(),
        code: z.string().optional()
    })
});
export const AnyEvent = z.discriminatedUnion("type", [
    PlanCreated,
    StepStarted,
    StepCompleted,
    ToolCallRequested,
    ToolCallCompleted,
    ErrorOccurred
]);
//# sourceMappingURL=events.js.map