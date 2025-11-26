/**
 * EVA Database Service
 * Unified service layer for all database operations across the EVA platform
 */
import { EvaCosmosClient } from './cosmos-config.js';
import { EvaDocumentRepository, EvaConversationRepository, EvaAnalyticsRepository } from './repositories/index.js';
/**
 * Main database service that provides access to all repositories
 */
export declare class EvaDatabaseService {
    private cosmosClient;
    private documentRepository;
    private conversationRepository;
    private analyticsRepository;
    constructor(cosmosClient: EvaCosmosClient);
    /**
     * Factory method to create database service for environment
     */
    static create(environment?: string): Promise<EvaDatabaseService>;
    /**
     * Get document repository
     */
    get documents(): EvaDocumentRepository;
    /**
     * Get conversation repository
     */
    get conversations(): EvaConversationRepository;
    /**
     * Get analytics repository
     */
    get analytics(): EvaAnalyticsRepository;
    /**
     * Get raw Cosmos client for advanced operations
     */
    get client(): EvaCosmosClient;
    /**
     * Perform health check across all repositories
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: {
            cosmosDb: boolean;
            documentRepository: boolean;
            conversationRepository: boolean;
            analyticsRepository: boolean;
        };
    }>;
    /**
     * Dispose resources
     */
    dispose(): Promise<void>;
}
/**
 * Service factory with caching for different environments and services
 */
export declare class EvaDatabaseServiceFactory {
    private static services;
    /**
     * Get or create database service for EVA RAG service
     */
    static forRagService(environment?: string): Promise<EvaDatabaseService>;
    /**
     * Get or create database service for EVA API service
     */
    static forApiService(environment?: string): Promise<EvaDatabaseService>;
    /**
     * Get or create database service for EVA Analytics service
     */
    static forAnalyticsService(environment?: string): Promise<EvaDatabaseService>;
    /**
     * Clear all cached services
     */
    static clearCache(): void;
    /**
     * Dispose all services
     */
    static disposeAll(): Promise<void>;
}
export * from './cosmos-client.js';
export * from './cosmos-config.js';
export * from './repositories/index.js';
//# sourceMappingURL=index.d.ts.map