/**
 * EVA Cosmos DB Client Library
 * Enterprise-grade Cosmos DB client with vector search, HPK support, and advanced AI capabilities
 * Optimized for EVA 2.0 microservices architecture
 */
import { FeedOptions, SqlQuerySpec } from '@azure/cosmos';
export interface EvaCosmosConfig {
    endpoint: string;
    databaseName: string;
    keyVaultUrl?: string;
    useMangedIdentity?: boolean;
    primaryKey?: string;
    consistencyLevel?: 'Strong' | 'BoundedStaleness' | 'Session' | 'Eventual' | 'ConsistentPrefix';
    enableVectorSearch?: boolean;
    vectorDimensions?: number;
    retryOptions?: {
        maxRetryAttemptCount: number;
        fixedRetryIntervalInMilliseconds: number;
        maxRetryIntervalInMilliseconds: number;
    };
}
export interface TenantContext {
    tenantId: string;
    userId?: string;
    role?: string;
    permissions?: string[];
}
export interface DocumentMetadata {
    id: string;
    tenantId: string;
    documentType: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    created_at: Date;
    updated_at: Date;
    processed_at?: Date;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    processing_stage?: string;
    error_message?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    content_vector?: number[];
    title_vector?: number[];
    extracted_text?: string;
    summary?: string;
    key_points?: string[];
    entities?: any[];
    sentiment?: {
        score: number;
        magnitude: number;
        label: 'positive' | 'neutral' | 'negative';
    };
}
export interface ConversationMessage {
    id: string;
    tenantId: string;
    userId: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    message_vector?: number[];
    timestamp: Date;
    metadata?: {
        model?: string;
        tokens_used?: number;
        processing_time_ms?: number;
        sources?: string[];
        confidence_score?: number;
    };
}
export interface UserProfile {
    id: string;
    tenantId: string;
    user_id: string;
    email: string;
    name: string;
    role: string;
    preferences: {
        language: string;
        timezone: string;
        notification_settings: Record<string, boolean>;
        ui_preferences: Record<string, any>;
    };
    last_activity: Date;
    created_at: Date;
    updated_at: Date;
}
export interface AnalyticsMetric {
    id: string;
    tenantId: string;
    metric_type: string;
    timestamp: Date;
    value: number;
    dimensions?: Record<string, string>;
    metadata?: Record<string, any>;
}
export interface VectorSearchOptions {
    vector: number[];
    path: string;
    k?: number;
    efSearch?: number;
    filter?: string;
}
export interface VectorSearchResult<T> {
    item: T;
    score: number;
}
/**
 * EVA Cosmos DB Client with enterprise features
 */
export declare class EvaCosmosClient {
    private cosmosClient;
    private database;
    private containers;
    private logger;
    private config;
    constructor(config: EvaCosmosConfig);
    private initializeCosmosClient;
    private initializeContainers;
    /**
     * Static factory method for async initialization with Key Vault
     */
    static createWithKeyVault(config: EvaCosmosConfig): Promise<EvaCosmosClient>;
    createDocument(document: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'>, tenantContext: TenantContext): Promise<DocumentMetadata>;
    updateDocument(documentId: string, updates: Partial<DocumentMetadata>, tenantContext: TenantContext): Promise<DocumentMetadata>;
    getDocument(documentId: string, tenantContext: TenantContext): Promise<DocumentMetadata | null>;
    queryDocuments(query: SqlQuerySpec | string, tenantContext: TenantContext, options?: FeedOptions): Promise<DocumentMetadata[]>;
    vectorSearchDocuments(searchOptions: VectorSearchOptions, tenantContext: TenantContext): Promise<VectorSearchResult<DocumentMetadata>[]>;
    createConversation(message: Omit<ConversationMessage, 'id' | 'timestamp'>, tenantContext: TenantContext): Promise<ConversationMessage>;
    getConversationHistory(conversationId: string, tenantContext: TenantContext, limit?: number): Promise<ConversationMessage[]>;
    createOrUpdateUserProfile(profile: UserProfile, tenantContext: TenantContext): Promise<UserProfile>;
    getUserProfile(userId: string, tenantContext: TenantContext): Promise<UserProfile | null>;
    recordMetric(metric: Omit<AnalyticsMetric, 'id' | 'timestamp'>, tenantContext: TenantContext): Promise<void>;
    getMetrics(metricType: string, tenantContext: TenantContext, startDate: Date, endDate: Date): Promise<AnalyticsMetric[]>;
    batchCreateDocuments(documents: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'>[], tenantContext: TenantContext): Promise<DocumentMetadata[]>;
    private generateId;
    healthCheck(): Promise<boolean>;
    dispose(): Promise<void>;
}
//# sourceMappingURL=cosmos-client.d.ts.map