/**
 * EVA Database Service
 * Unified service layer for all database operations across the EVA platform
 */

import {
  EvaCosmosClient,
  EvaCosmosClientFactory,
  TenantContext,
} from './cosmos-config.js';

import {
  EvaDocumentRepository,
  EvaConversationRepository,
  EvaAnalyticsRepository,
} from './repositories/index.js';

/**
 * Main database service that provides access to all repositories
 */
export class EvaDatabaseService {
  private cosmosClient: EvaCosmosClient;
  private documentRepository: EvaDocumentRepository;
  private conversationRepository: EvaConversationRepository;
  private analyticsRepository: EvaAnalyticsRepository;

  constructor(cosmosClient: EvaCosmosClient) {
    this.cosmosClient = cosmosClient;
    this.documentRepository = new EvaDocumentRepository(cosmosClient);
    this.conversationRepository = new EvaConversationRepository(cosmosClient);
    this.analyticsRepository = new EvaAnalyticsRepository(cosmosClient);
  }

  /**
   * Factory method to create database service for environment
   */
  static async create(environment: string = 'development'): Promise<EvaDatabaseService> {
    const cosmosClient = await EvaCosmosClientFactory.getClient(environment);
    return new EvaDatabaseService(cosmosClient);
  }

  /**
   * Get document repository
   */
  get documents(): EvaDocumentRepository {
    return this.documentRepository;
  }

  /**
   * Get conversation repository
   */
  get conversations(): EvaConversationRepository {
    return this.conversationRepository;
  }

  /**
   * Get analytics repository
   */
  get analytics(): EvaAnalyticsRepository {
    return this.analyticsRepository;
  }

  /**
   * Get raw Cosmos client for advanced operations
   */
  get client(): EvaCosmosClient {
    return this.cosmosClient;
  }

  /**
   * Perform health check across all repositories
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      cosmosDb: boolean;
      documentRepository: boolean;
      conversationRepository: boolean;
      analyticsRepository: boolean;
    };
  }> {
    try {
      const cosmosHealthy = await this.cosmosClient.healthCheck();
      
      // Test each repository with minimal operations
      const testTenant: TenantContext = { tenantId: 'health-check' };
      
      // Test document repository
      let documentsHealthy = true;
      try {
        await this.documentRepository.searchDocuments({}, testTenant, 1, 1);
      } catch (error) {
        documentsHealthy = false;
      }

      // Test conversation repository
      let conversationsHealthy = true;
      try {
        await this.conversationRepository.searchConversations({}, testTenant, 1, 1);
      } catch (error) {
        conversationsHealthy = false;
      }

      // Test analytics repository
      let analyticsHealthy = true;
      try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        await this.analyticsRepository.getMetricAggregation(
          'test',
          testTenant,
          { start: oneHourAgo, end: now }
        );
      } catch (error) {
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
    } catch (error) {
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
  async dispose(): Promise<void> {
    await this.cosmosClient.dispose();
  }
}

/**
 * Service factory with caching for different environments and services
 */
export class EvaDatabaseServiceFactory {
  private static services: Map<string, EvaDatabaseService> = new Map();

  /**
   * Get or create database service for EVA RAG service
   */
  static async forRagService(environment: string = 'development'): Promise<EvaDatabaseService> {
    const key = `rag-${environment}`;
    
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }

    const service = await EvaDatabaseService.create(environment);
    this.services.set(key, service);
    return service;
  }

  /**
   * Get or create database service for EVA API service
   */
  static async forApiService(environment: string = 'development'): Promise<EvaDatabaseService> {
    const key = `api-${environment}`;
    
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }

    const service = await EvaDatabaseService.create(environment);
    this.services.set(key, service);
    return service;
  }

  /**
   * Get or create database service for EVA Analytics service
   */
  static async forAnalyticsService(environment: string = 'development'): Promise<EvaDatabaseService> {
    const key = `analytics-${environment}`;
    
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }

    const service = await EvaDatabaseService.create(environment);
    this.services.set(key, service);
    return service;
  }

  /**
   * Clear all cached services
   */
  static clearCache(): void {
    this.services.clear();
  }

  /**
   * Dispose all services
   */
  static async disposeAll(): Promise<void> {
    const promises = Array.from(this.services.values()).map(service => service.dispose());
    await Promise.all(promises);
    this.services.clear();
  }
}

// Export all database types and interfaces
export * from './cosmos-client.js';
export * from './cosmos-config.js';
export * from './repositories/index.js';
