/**
 * Shared EVA UI configuration primitives used by api/ui/mobile packages.
 */

export interface ProjectTheme {
    primaryColor: string;
    backgroundColor: string;
    headerTextColor: string;
}

export interface ProjectI18nConfig {
    headlineKeyEn: string;
    headlineKeyFr: string;
    subtitleKeyEn: string;
    subtitleKeyFr: string;
}

export interface ProjectApiConfig {
    ragEndpoint: string;
    safetyProfile: string;
}

export interface ProjectConfig {
    projectId: string;
    name: string;
    description?: string;
    theme: ProjectTheme;
    i18n: ProjectI18nConfig;
    api: ProjectApiConfig;
}

export interface LayoutSection {
    id: string;
    type: string;
    props?: Record<string, unknown>;
}

export interface Layout {
    pageId: string;
    version?: string;
    sections: LayoutSection[];
}

export interface ScreenTemplate {
    templateId: string;
    label: string;
    description?: string;
    layoutRef: string;
    allowedProjects: string[];
    editableProps: string[];
}

export type AssetType = "svg" | "png" | "gif" | "jpeg" | "webp";

export interface Asset {
    assetId: string;
    type: AssetType;
    path: string;
    description?: string;
}

export type RagMessageRole = "user" | "assistant";

export interface RagHistoryMessage {
    role: RagMessageRole;
    content: string;
}

export interface RagRequest {
    question: string;
    projectId: string;
    history?: RagHistoryMessage[];
}

export interface RagAnswerCitation {
    sourceId: string;
    snippet?: string;
}

export interface RagAnswer {
    text: string;
    citations?: RagAnswerCitation[];
}

export interface SafetyResult {
    blocked: boolean;
    reason?: string;
    redactedText?: string;
}

export interface RagResponse {
    answer: RagAnswer;
    safety?: SafetyResult;
}
