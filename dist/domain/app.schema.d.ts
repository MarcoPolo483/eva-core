import { z } from "zod";
export declare const projectThemeSchema: z.ZodObject<{
    primaryColor: z.ZodString;
    backgroundColor: z.ZodString;
    headerTextColor: z.ZodString;
}, "strip", z.ZodTypeAny, {
    primaryColor: string;
    backgroundColor: string;
    headerTextColor: string;
}, {
    primaryColor: string;
    backgroundColor: string;
    headerTextColor: string;
}>;
export declare const projectI18nSchema: z.ZodObject<{
    headlineKeyEn: z.ZodString;
    headlineKeyFr: z.ZodString;
    subtitleKeyEn: z.ZodString;
    subtitleKeyFr: z.ZodString;
}, "strip", z.ZodTypeAny, {
    headlineKeyEn: string;
    headlineKeyFr: string;
    subtitleKeyEn: string;
    subtitleKeyFr: string;
}, {
    headlineKeyEn: string;
    headlineKeyFr: string;
    subtitleKeyEn: string;
    subtitleKeyFr: string;
}>;
export declare const projectApiSchema: z.ZodObject<{
    ragEndpoint: z.ZodString;
    safetyProfile: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ragEndpoint: string;
    safetyProfile: string;
}, {
    ragEndpoint: string;
    safetyProfile: string;
}>;
export declare const projectConfigSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    theme: z.ZodObject<{
        primaryColor: z.ZodString;
        backgroundColor: z.ZodString;
        headerTextColor: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        primaryColor: string;
        backgroundColor: string;
        headerTextColor: string;
    }, {
        primaryColor: string;
        backgroundColor: string;
        headerTextColor: string;
    }>;
    i18n: z.ZodObject<{
        headlineKeyEn: z.ZodString;
        headlineKeyFr: z.ZodString;
        subtitleKeyEn: z.ZodString;
        subtitleKeyFr: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        headlineKeyEn: string;
        headlineKeyFr: string;
        subtitleKeyEn: string;
        subtitleKeyFr: string;
    }, {
        headlineKeyEn: string;
        headlineKeyFr: string;
        subtitleKeyEn: string;
        subtitleKeyFr: string;
    }>;
    api: z.ZodObject<{
        ragEndpoint: z.ZodString;
        safetyProfile: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ragEndpoint: string;
        safetyProfile: string;
    }, {
        ragEndpoint: string;
        safetyProfile: string;
    }>;
}, "strict", z.ZodTypeAny, {
    name: string;
    projectId: string;
    theme: {
        primaryColor: string;
        backgroundColor: string;
        headerTextColor: string;
    };
    i18n: {
        headlineKeyEn: string;
        headlineKeyFr: string;
        subtitleKeyEn: string;
        subtitleKeyFr: string;
    };
    api: {
        ragEndpoint: string;
        safetyProfile: string;
    };
    description?: string | undefined;
}, {
    name: string;
    projectId: string;
    theme: {
        primaryColor: string;
        backgroundColor: string;
        headerTextColor: string;
    };
    i18n: {
        headlineKeyEn: string;
        headlineKeyFr: string;
        subtitleKeyEn: string;
        subtitleKeyFr: string;
    };
    api: {
        ragEndpoint: string;
        safetyProfile: string;
    };
    description?: string | undefined;
}>;
export declare const layoutSectionSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strict", z.ZodTypeAny, {
    id: string;
    type: string;
    props?: Record<string, unknown> | undefined;
}, {
    id: string;
    type: string;
    props?: Record<string, unknown> | undefined;
}>;
export declare const layoutSchema: z.ZodObject<{
    pageId: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    sections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        type: string;
        props?: Record<string, unknown> | undefined;
    }, {
        id: string;
        type: string;
        props?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    pageId: string;
    sections: {
        id: string;
        type: string;
        props?: Record<string, unknown> | undefined;
    }[];
    version?: string | undefined;
}, {
    pageId: string;
    sections: {
        id: string;
        type: string;
        props?: Record<string, unknown> | undefined;
    }[];
    version?: string | undefined;
}>;
export declare const screenTemplateSchema: z.ZodObject<{
    templateId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    layoutRef: z.ZodString;
    allowedProjects: z.ZodArray<z.ZodString, "many">;
    editableProps: z.ZodArray<z.ZodString, "many">;
}, "strict", z.ZodTypeAny, {
    templateId: string;
    label: string;
    layoutRef: string;
    allowedProjects: string[];
    editableProps: string[];
    description?: string | undefined;
}, {
    templateId: string;
    label: string;
    layoutRef: string;
    allowedProjects: string[];
    editableProps: string[];
    description?: string | undefined;
}>;
export declare const assetSchema: z.ZodObject<{
    assetId: z.ZodString;
    type: z.ZodEnum<["svg", "png", "gif", "jpeg", "webp"]>;
    path: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    type: "svg" | "png" | "gif" | "jpeg" | "webp";
    path: string;
    assetId: string;
    description?: string | undefined;
}, {
    type: "svg" | "png" | "gif" | "jpeg" | "webp";
    path: string;
    assetId: string;
    description?: string | undefined;
}>;
export declare const ragHistoryMessageSchema: z.ZodObject<{
    role: z.ZodEnum<["user", "assistant"]>;
    content: z.ZodString;
}, "strict", z.ZodTypeAny, {
    role: "user" | "assistant";
    content: string;
}, {
    role: "user" | "assistant";
    content: string;
}>;
export declare const ragRequestSchema: z.ZodObject<{
    question: z.ZodString;
    projectId: z.ZodString;
    history: z.ZodOptional<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "assistant"]>;
        content: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        role: "user" | "assistant";
        content: string;
    }, {
        role: "user" | "assistant";
        content: string;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    projectId: string;
    question: string;
    history?: {
        role: "user" | "assistant";
        content: string;
    }[] | undefined;
}, {
    projectId: string;
    question: string;
    history?: {
        role: "user" | "assistant";
        content: string;
    }[] | undefined;
}>;
export declare const ragAnswerCitationSchema: z.ZodObject<{
    sourceId: z.ZodString;
    snippet: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    sourceId: string;
    snippet?: string | undefined;
}, {
    sourceId: string;
    snippet?: string | undefined;
}>;
export declare const ragAnswerSchema: z.ZodObject<{
    text: z.ZodString;
    citations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sourceId: z.ZodString;
        snippet: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        sourceId: string;
        snippet?: string | undefined;
    }, {
        sourceId: string;
        snippet?: string | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    text: string;
    citations?: {
        sourceId: string;
        snippet?: string | undefined;
    }[] | undefined;
}, {
    text: string;
    citations?: {
        sourceId: string;
        snippet?: string | undefined;
    }[] | undefined;
}>;
export declare const safetyResultSchema: z.ZodObject<{
    blocked: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
    redactedText: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    blocked: boolean;
    reason?: string | undefined;
    redactedText?: string | undefined;
}, {
    blocked: boolean;
    reason?: string | undefined;
    redactedText?: string | undefined;
}>;
export declare const ragResponseSchema: z.ZodObject<{
    answer: z.ZodObject<{
        text: z.ZodString;
        citations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourceId: z.ZodString;
            snippet: z.ZodOptional<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            sourceId: string;
            snippet?: string | undefined;
        }, {
            sourceId: string;
            snippet?: string | undefined;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        text: string;
        citations?: {
            sourceId: string;
            snippet?: string | undefined;
        }[] | undefined;
    }, {
        text: string;
        citations?: {
            sourceId: string;
            snippet?: string | undefined;
        }[] | undefined;
    }>;
    safety: z.ZodOptional<z.ZodObject<{
        blocked: z.ZodBoolean;
        reason: z.ZodOptional<z.ZodString>;
        redactedText: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        blocked: boolean;
        reason?: string | undefined;
        redactedText?: string | undefined;
    }, {
        blocked: boolean;
        reason?: string | undefined;
        redactedText?: string | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    answer: {
        text: string;
        citations?: {
            sourceId: string;
            snippet?: string | undefined;
        }[] | undefined;
    };
    safety?: {
        blocked: boolean;
        reason?: string | undefined;
        redactedText?: string | undefined;
    } | undefined;
}, {
    answer: {
        text: string;
        citations?: {
            sourceId: string;
            snippet?: string | undefined;
        }[] | undefined;
    };
    safety?: {
        blocked: boolean;
        reason?: string | undefined;
        redactedText?: string | undefined;
    } | undefined;
}>;
//# sourceMappingURL=app.schema.d.ts.map