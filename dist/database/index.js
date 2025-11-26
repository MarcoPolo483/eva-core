/**
 * EVA Database Service
 * Unified service layer for all database operations across the EVA platform
 */
import { EvaCosmosClientFactory, } from './cosmos-config.js';
import { EvaDocumentRepository, EvaConversationRepository, EvaAnalyticsRepository, } from './repositories/index.js';
/**
 * Main database service that provides access to all repositories
 */
export class EvaDatabaseService {
    cosmosClient;
    documentRepository;
    conversationRepository;
    analyticsRepository;
    constructor(cosmosClient) {
        this.cosmosClient = cosmosClient;
        this.documentRepository = new EvaDocumentRepository(cosmosClient);
        this.conversationRepository = new EvaConversationRepository(cosmosClient);
        this.analyticsRepository = new EvaAnalyticsRepository(cosmosClient);
    }
    /**
     * Factory method to create database service for environment
     */
    static async create(environment = 'development') {
        const cosmosClient = await EvaCosmosClientFactory.getClient(environment);
        return new EvaDatabaseService(cosmosClient);
    }
    /**
     * Get document repository
     */
    get documents() {
        return this.documentRepository;
    }
    /**
     * Get conversation repository
     */
    get conversations() {
        return this.conversationRepository;
    }
    /**
     * Get analytics repository
     */
    get analytics() {
        return this.analyticsRepository;
    }
    /**
     * Get raw Cosmos client for advanced operations
     */
    get client() {
        return this.cosmosClient;
    }
    /**
     * Perform health check across all repositories
     */
    async healthCheck() {
        try {
            const cosmosHealthy = await this.cosmosClient.healthCheck();
            // Test each repository with minimal operations
            const testTenant = { tenantId: 'health-check' };
            // Test document repository
            let documentsHealthy = true;
            try {
                await this.documentRepository.searchDocuments({}, testTenant, 1, 1);
            }
            catch (error) {
                documentsHealthy = false;
            }
            // Test conversation repository
            let conversationsHealthy = true;
            try {
                await this.conversationRepository.searchConversations({}, testTenant, 1, 1);
            }
            catch (error) {
                conversationsHealthy = false;
            }
            // Test analytics repository
            let analyticsHealthy = true;
            try {
                const now = new Date();
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                await this.analyticsRepository.getMetricAggregation('test', testTenant, { start: oneHourAgo, end: now });
            }
            catch (error) {
                analyticsHealthy = false;
            }
            const allHealthy = cosmosHealthy && documentsHealthy && conversationsHealthy && analyticsHealthy;
            const someHealthy = cosmosHealthy || documentsHealthy || conversationsHealthy || analyticsHealthy;
            return {
                status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
                details: {
                    cosmosDb: cosmosHealthy,
                    documentRepository: documentsHealthy,
                    conversationRepository: conversationsHealthy,
                    analyticsRepository: analyticsHealthy,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    cosmosDb: false,
                    documentRepository: false,
                    conversationRepository: false,
                    analyticsRepository: false,
                },
            };
        }
    }
    /**
     * Dispose resources
     */
    async dispose() {
        await this.cosmosClient.dispose();
    }
}
/**
 * Service factory with caching for different environments and services
 */
export class EvaDatabaseServiceFactory {
    static services = new Map();
    /**
     * Get or create database service for EVA RAG service
     */
    static async forRagService(environment = 'development') {
        const key = `rag-${environment}`;
        if (this.services.has(key)) {
            return this.services.get(key);
        }
        const service = await EvaDatabaseService.create(environment);
        this.services.set(key, service);
        return service;
    }
    /**
     * Get or create database service for EVA API service
     */
    static async forApiService(environment = 'development') {
        const key = `api-${environment}`;
        if (this.services.has(key)) {
            return this.services.get(key);
        }
        const service = await EvaDatabaseService.create(environment);
        this.services.set(key, service);
        return service;
    }
    /**
     * Get or create database service for EVA Analytics service
     */
    static async forAnalyticsService(environment = 'development') {
        const key = `analytics-${environment}`;
        if (this.services.has(key)) {
            return this.services.get(key);
        }
        const service = await EvaDatabaseService.create(environment);
        this.services.set(key, service);
        return service;
    }
    /**
     * Clear all cached services
     */
    static clearCache() {
        this.services.clear();
    }
    /**
     * Dispose all services
     */
    static async disposeAll() {
        const promises = Array.from(this.services.values()).map(service => service.dispose());
        await Promise.all(promises);
        this.services.clear();
    }
}
// Export all database types and interfaces
export * from './cosmos-client.js';
export * from './cosmos-config.js';
export * from './repositories/index.js';
//# sourceMappingURL=index.js.map