import { z } from "zod";
const colorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const projectThemeSchema = z.object({
    primaryColor: colorHex,
    backgroundColor: colorHex,
    headerTextColor: colorHex
});
export const projectI18nSchema = z.object({
    headlineKeyEn: z.string().min(1),
    headlineKeyFr: z.string().min(1),
    subtitleKeyEn: z.string().min(1),
    subtitleKeyFr: z.string().min(1)
});
export const projectApiSchema = z.object({
    ragEndpoint: z.string().url(),
    safetyProfile: z.string().min(1)
});
export const projectConfigSchema = z
    .object({
    projectId: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    theme: projectThemeSchema,
    i18n: projectI18nSchema,
    api: projectApiSchema
})
    .strict();
export const layoutSectionSchema = z
    .object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.unknown()).optional()
})
    .strict();
export const layoutSchema = z
    .object({
    pageId: z.string().min(1),
    version: z.string().optional(),
    sections: z.array(layoutSectionSchema).min(1)
})
    .strict();
export const screenTemplateSchema = z
    .object({
    templateId: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
    layoutRef: z.string().min(1),
    allowedProjects: z.array(z.string().min(1)),
    editableProps: z.array(z.string().min(1))
})
    .strict();
const assetTypeSchema = z.enum(["svg", "png", "gif", "jpeg", "webp"]);
export const assetSchema = z
    .object({
    assetId: z.string().min(1),
    type: assetTypeSchema,
    path: z.string().min(1),
    description: z.string().optional()
})
    .strict();
export const ragHistoryMessageSchema = z
    .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1)
})
    .strict();
export const ragRequestSchema = z
    .object({
    question: z.string().min(1),
    projectId: z.string().min(1),
    history: z.array(ragHistoryMessageSchema).optional()
})
    .strict();
export const ragAnswerCitationSchema = z
    .object({
    sourceId: z.string().min(1),
    snippet: z.string().optional()
})
    .strict();
export const ragAnswerSchema = z
    .object({
    text: z.string().min(1),
    citations: z.array(ragAnswerCitationSchema).optional()
})
    .strict();
export const safetyResultSchema = z
    .object({
    blocked: z.boolean(),
    reason: z.string().optional(),
    redactedText: z.string().optional()
})
    .strict();
export const ragResponseSchema = z
    .object({
    answer: ragAnswerSchema,
    safety: safetyResultSchema.optional()
})
    .strict();
//# sourceMappingURL=app.schema.js.map