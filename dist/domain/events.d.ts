import { z } from "zod";
export declare const BaseEvent: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: string;
    planId: string;
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: string;
    planId: string;
    stepId?: string | undefined;
}>;
export declare const PlanCreated: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"plan.created">;
    meta: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "plan.created";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "plan.created";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}>;
export declare const StepStarted: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"step.started">;
    meta: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "step.started";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "step.started";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}>;
export declare const StepCompleted: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"step.completed">;
    meta: z.ZodObject<{
        name: z.ZodString;
        ok: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        ok: boolean;
    }, {
        name: string;
        ok: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "step.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "step.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
    };
    stepId?: string | undefined;
}>;
export declare const ToolCallRequested: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"tool.requested">;
    meta: z.ZodObject<{
        name: z.ZodString;
        args: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        name: string;
        args?: unknown;
    }, {
        name: string;
        args?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "tool.requested";
    planId: string;
    meta: {
        name: string;
        args?: unknown;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "tool.requested";
    planId: string;
    meta: {
        name: string;
        args?: unknown;
    };
    stepId?: string | undefined;
}>;
export declare const ToolCallCompleted: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"tool.completed">;
    meta: z.ZodObject<{
        name: z.ZodString;
        ok: z.ZodBoolean;
        result: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    }, {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "tool.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "tool.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    };
    stepId?: string | undefined;
}>;
export declare const ErrorOccurred: z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"error">;
    meta: z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
    }, {
        message: string;
        code?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "error";
    planId: string;
    meta: {
        message: string;
        code?: string | undefined;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "error";
    planId: string;
    meta: {
        message: string;
        code?: string | undefined;
    };
    stepId?: string | undefined;
}>;
export declare const AnyEvent: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"plan.created">;
    meta: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "plan.created";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "plan.created";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"step.started">;
    meta: z.ZodObject<{
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
    }, {
        name: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "step.started";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "step.started";
    planId: string;
    meta: {
        name: string;
    };
    stepId?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"step.completed">;
    meta: z.ZodObject<{
        name: z.ZodString;
        ok: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        name: string;
        ok: boolean;
    }, {
        name: string;
        ok: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "step.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "step.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
    };
    stepId?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"tool.requested">;
    meta: z.ZodObject<{
        name: z.ZodString;
        args: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        name: string;
        args?: unknown;
    }, {
        name: string;
        args?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "tool.requested";
    planId: string;
    meta: {
        name: string;
        args?: unknown;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "tool.requested";
    planId: string;
    meta: {
        name: string;
        args?: unknown;
    };
    stepId?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"tool.completed">;
    meta: z.ZodObject<{
        name: z.ZodString;
        ok: z.ZodBoolean;
        result: z.ZodOptional<z.ZodUnknown>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    }, {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "tool.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "tool.completed";
    planId: string;
    meta: {
        name: string;
        ok: boolean;
        result?: unknown;
        error?: string | undefined;
    };
    stepId?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    at: z.ZodString;
    planId: z.ZodString;
    stepId: z.ZodOptional<z.ZodString>;
} & {
    type: z.ZodLiteral<"error">;
    meta: z.ZodObject<{
        message: z.ZodString;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        code?: string | undefined;
    }, {
        message: string;
        code?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    at: string;
    type: "error";
    planId: string;
    meta: {
        message: string;
        code?: string | undefined;
    };
    stepId?: string | undefined;
}, {
    id: string;
    at: string;
    type: "error";
    planId: string;
    meta: {
        message: string;
        code?: string | undefined;
    };
    stepId?: string | undefined;
}>]>;
export type AnyEvent = z.infer<typeof AnyEvent>;
//# sourceMappingURL=events.d.ts.map