/**
 * EVA Cosmos DB Configuration and Factory
 * Centralized configuration management for Cosmos DB across EVA ecosystem
 */
import { EvaCosmosClient, EvaCosmosConfig } from './cosmos-client.js';
export interface EvaCosmosEnvironmentConfig {
    endpoint: string;
    databaseName: string;
    useMangedIdentity: boolean;
    keyVaultUrl?: string;
    primaryKey?: string;
    consistencyLevel: 'Strong' | 'BoundedStaleness' | 'Session' | 'Eventual' | 'ConsistentPrefix';
    maxRetryAttempts: number;
    requestTimeoutMs: number;
    enableVectorSearch: boolean;
    vectorDimensions: number;
    environment: 'development' | 'staging' | 'production';
    region: string;
    containers: {
        documents: {
            throughput?: number;
            partitionKeys: string[];
        };
        conversations: {
            throughput?: number;
            partitionKeys: string[];
        };
        userProfiles: {
            throughput?: number;
            partitionKeys: string[];
        };
        analytics: {
            throughput?: number;
            partitionKeys: string[];
        };
    };
}
/**
 * Default configurations for different environments
 */
export declare const defaultConfigurations: Record<string, Partial<EvaCosmosEnvironmentConfig>>;
/**
 * Configuration loader from environment variables
 */
export declare class EvaCosmosConfigLoader {
    static loadFromEnvironment(environment?: string): EvaCosmosEnvironmentConfig;
    private static requireEnvVar;
    /**
     * Validate configuration
     */
    static validateConfig(config: EvaCosmosEnvironmentConfig): void;
}
/**
 * Factory for creating Cosmos DB clients
 */
export declare class EvaCosmosClientFactory {
    private static clients;
    /**
     * Create or get cached client for environment
     */
    static getClient(environment?: string): Promise<EvaCosmosClient>;
    /**
     * Create client with custom configuration
     */
    static createCustomClient(config: EvaCosmosConfig): Promise<EvaCosmosClient>;
    /**
     * Clear cached clients (useful for testing)
     */
    static clearCache(): void;
    /**
     * Dispose all clients
     */
    static disposeAll(): Promise<void>;
}
/**
 * Configuration helpers for different EVA services
 */
export declare class EvaServiceCosmosConfig {
    /**
     * Get configuration optimized for EVA RAG service
     */
    static forRagService(baseConfig: EvaCosmosEnvironmentConfig): EvaCosmosConfig;
    /**
     * Get configuration optimized for EVA API service
     */
    static forApiService(baseConfig: EvaCosmosEnvironmentConfig): EvaCosmosConfig;
    /**
     * Get configuration optimized for EVA Analytics service
     */
    static forAnalyticsService(baseConfig: EvaCosmosEnvironmentConfig): EvaCosmosConfig;
}
export * from './cosmos-client.js';
export { EvaCosmosConfig, TenantContext, DocumentMetadata, ConversationMessage, UserProfile, AnalyticsMetric, VectorSearchOptions, VectorSearchResult, } from './cosmos-client.js';
//# sourceMappingURL=cosmos-config.d.ts.map