import { z } from "zod";

import type {
    Asset,
    AssetType,
    Layout,
    LayoutSection,
    ProjectApiConfig,
    ProjectConfig,
    ProjectI18nConfig,
    ProjectTheme,
    RagAnswer,
    RagAnswerCitation,
    RagHistoryMessage,
    RagRequest,
    RagResponse,
    SafetyResult,
    ScreenTemplate
} from "./app.js";

const colorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const projectThemeSchema = z.object({
    primaryColor: colorHex,
    backgroundColor: colorHex,
    headerTextColor: colorHex
}) satisfies z.ZodType<ProjectTheme>;

export const projectI18nSchema = z.object({
    headlineKeyEn: z.string().min(1),
    headlineKeyFr: z.string().min(1),
    subtitleKeyEn: z.string().min(1),
    subtitleKeyFr: z.string().min(1)
}) satisfies z.ZodType<ProjectI18nConfig>;

export const projectApiSchema = z.object({
    ragEndpoint: z.string().url(),
    safetyProfile: z.string().min(1)
}) satisfies z.ZodType<ProjectApiConfig>;

export const projectConfigSchema = z
    .object({
        projectId: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        theme: projectThemeSchema,
        i18n: projectI18nSchema,
        api: projectApiSchema
    })
    .strict() satisfies z.ZodType<ProjectConfig>;

export const layoutSectionSchema = z
    .object({
        id: z.string().min(1),
        type: z.string().min(1),
        props: z.record(z.unknown()).optional()
    })
    .strict() satisfies z.ZodType<LayoutSection>;

export const layoutSchema = z
    .object({
        pageId: z.string().min(1),
        version: z.string().optional(),
        sections: z.array(layoutSectionSchema).min(1)
    })
    .strict() satisfies z.ZodType<Layout>;

export const screenTemplateSchema = z
    .object({
        templateId: z.string().min(1),
        label: z.string().min(1),
        description: z.string().optional(),
        layoutRef: z.string().min(1),
        allowedProjects: z.array(z.string().min(1)),
        editableProps: z.array(z.string().min(1))
    })
    .strict() satisfies z.ZodType<ScreenTemplate>;

const assetTypeSchema = z.enum(["svg", "png", "gif", "jpeg", "webp"]) satisfies z.ZodType<AssetType>;

export const assetSchema = z
    .object({
        assetId: z.string().min(1),
        type: assetTypeSchema,
        path: z.string().min(1),
        description: z.string().optional()
    })
    .strict() satisfies z.ZodType<Asset>;

export const ragHistoryMessageSchema = z
    .object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1)
    })
    .strict() satisfies z.ZodType<RagHistoryMessage>;

export const ragRequestSchema = z
    .object({
        question: z.string().min(1),
        projectId: z.string().min(1),
        history: z.array(ragHistoryMessageSchema).optional()
    })
    .strict() satisfies z.ZodType<RagRequest>;

export const ragAnswerCitationSchema = z
    .object({
        sourceId: z.string().min(1),
        snippet: z.string().optional()
    })
    .strict() satisfies z.ZodType<RagAnswerCitation>;

export const ragAnswerSchema = z
    .object({
        text: z.string().min(1),
        citations: z.array(ragAnswerCitationSchema).optional()
    })
    .strict() satisfies z.ZodType<RagAnswer>;

export const safetyResultSchema = z
    .object({
        blocked: z.boolean(),
        reason: z.string().optional(),
        redactedText: z.string().optional()
    })
    .strict() satisfies z.ZodType<SafetyResult>;

export const ragResponseSchema = z
    .object({
        answer: ragAnswerSchema,
        safety: safetyResultSchema.optional()
    })
    .strict() satisfies z.ZodType<RagResponse>;
