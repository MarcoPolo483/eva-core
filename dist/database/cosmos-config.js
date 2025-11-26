/**
 * EVA Cosmos DB Configuration and Factory
 * Centralized configuration management for Cosmos DB across EVA ecosystem
 */
import { EvaCosmosClient } from './cosmos-client.js';
/**
 * Default configurations for different environments
 */
export const defaultConfigurations = {
    development: {
        consistencyLevel: 'Session',
        maxRetryAttempts: 3,
        requestTimeoutMs: 30000,
        enableVectorSearch: true,
        vectorDimensions: 1536,
        containers: {
            documents: {
                throughput: 400,
                partitionKeys: ['/tenantId', '/documentType'],
            },
            conversations: {
                throughput: 400,
                partitionKeys: ['/tenantId', '/userId'],
            },
            userProfiles: {
                throughput: 400,
                partitionKeys: ['/tenantId'],
            },
            analytics: {
                throughput: 400,
                partitionKeys: ['/tenantId', '/metric_type'],
            },
        },
    },
    staging: {
        consistencyLevel: 'Session',
        maxRetryAttempts: 5,
        requestTimeoutMs: 45000,
        enableVectorSearch: true,
        vectorDimensions: 1536,
        containers: {
            documents: {
                throughput: 1000,
                partitionKeys: ['/tenantId', '/documentType'],
            },
            conversations: {
                throughput: 800,
                partitionKeys: ['/tenantId', '/userId'],
            },
            userProfiles: {
                throughput: 400,
                partitionKeys: ['/tenantId'],
            },
            analytics: {
                throughput: 600,
                partitionKeys: ['/tenantId', '/metric_type'],
            },
        },
    },
    production: {
        consistencyLevel: 'Session',
        maxRetryAttempts: 10,
        requestTimeoutMs: 60000,
        enableVectorSearch: true,
        vectorDimensions: 1536,
        containers: {
            documents: {
                // Autoscale in production
                partitionKeys: ['/tenantId', '/documentType'],
            },
            conversations: {
                partitionKeys: ['/tenantId', '/userId'],
            },
            userProfiles: {
                partitionKeys: ['/tenantId'],
            },
            analytics: {
                partitionKeys: ['/tenantId', '/metric_type'],
            },
        },
    },
};
/**
 * Configuration loader from environment variables
 */
export class EvaCosmosConfigLoader {
    static loadFromEnvironment(environment = 'development') {
        const baseConfig = defaultConfigurations[environment] || defaultConfigurations.development;
        return {
            // Required settings from environment
            endpoint: this.requireEnvVar('COSMOS_DB_ENDPOINT'),
            databaseName: process.env.COSMOS_DB_NAME || 'eva-platform',
            // Authentication
            useMangedIdentity: process.env.USE_MANAGED_IDENTITY === 'true',
            keyVaultUrl: process.env.KEY_VAULT_URL,
            primaryKey: process.env.COSMOS_DB_KEY, // Only for development
            // Environment
            environment: environment,
            region: process.env.AZURE_REGION || 'eastus',
            // Merge with defaults
            ...baseConfig,
            // Override with environment-specific values
            consistencyLevel: process.env.COSMOS_CONSISTENCY_LEVEL || baseConfig.consistencyLevel,
            maxRetryAttempts: parseInt(process.env.COSMOS_MAX_RETRIES || '') || baseConfig.maxRetryAttempts,
            requestTimeoutMs: parseInt(process.env.COSMOS_REQUEST_TIMEOUT || '') || baseConfig.requestTimeoutMs,
            enableVectorSearch: process.env.COSMOS_ENABLE_VECTOR_SEARCH !== 'false',
            vectorDimensions: parseInt(process.env.COSMOS_VECTOR_DIMENSIONS || '') || baseConfig.vectorDimensions,
        };
    }
    static requireEnvVar(name) {
        const value = process.env[name];
        if (!value) {
            throw new Error(`Required environment variable ${name} is not set`);
        }
        return value;
    }
    /**
     * Validate configuration
     */
    static validateConfig(config) {
        const errors = [];
        if (!config.endpoint) {
            errors.push('endpoint is required');
        }
        if (!config.databaseName) {
            errors.push('databaseName is required');
        }
        if (!config.useMangedIdentity && !config.keyVaultUrl && !config.primaryKey) {
            errors.push('Authentication method required: useMangedIdentity, keyVaultUrl, or primaryKey');
        }
        if (config.environment === 'production' && config.primaryKey) {
            errors.push('Primary key should not be used in production. Use managed identity or Key Vault.');
        }
        if (config.enableVectorSearch && (!config.vectorDimensions || config.vectorDimensions <= 0)) {
            errors.push('vectorDimensions must be positive when vector search is enabled');
        }
        if (errors.length > 0) {
            throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
        }
    }
}
/**
 * Factory for creating Cosmos DB clients
 */
export class EvaCosmosClientFactory {
    static clients = new Map();
    /**
     * Create or get cached client for environment
     */
    static async getClient(environment = 'development') {
        if (this.clients.has(environment)) {
            return this.clients.get(environment);
        }
        const config = EvaCosmosConfigLoader.loadFromEnvironment(environment);
        EvaCosmosConfigLoader.validateConfig(config);
        const clientConfig = {
            endpoint: config.endpoint,
            databaseName: config.databaseName,
            useMangedIdentity: config.useMangedIdentity,
            keyVaultUrl: config.keyVaultUrl,
            primaryKey: config.primaryKey,
            consistencyLevel: config.consistencyLevel,
            enableVectorSearch: config.enableVectorSearch,
            vectorDimensions: config.vectorDimensions,
            retryOptions: {
                maxRetryAttemptCount: config.maxRetryAttempts,
                fixedRetryIntervalInMilliseconds: 1000,
                maxRetryIntervalInMilliseconds: 10000,
            },
        };
        let client;
        if (config.keyVaultUrl && !config.primaryKey) {
            // Use Key Vault for authentication
            client = await EvaCosmosClient.createWithKeyVault(clientConfig);
        }
        else {
            // Use direct authentication
            client = new EvaCosmosClient(clientConfig);
        }
        // Test connection
        const isHealthy = await client.healthCheck();
        if (!isHealthy) {
            throw new Error(`Failed to connect to Cosmos DB for environment: ${environment}`);
        }
        this.clients.set(environment, client);
        return client;
    }
    /**
     * Create client with custom configuration
     */
    static async createCustomClient(config) {
        if (config.keyVaultUrl && !config.primaryKey) {
            return await EvaCosmosClient.createWithKeyVault(config);
        }
        else {
            return new EvaCosmosClient(config);
        }
    }
    /**
     * Clear cached clients (useful for testing)
     */
    static clearCache() {
        this.clients.clear();
    }
    /**
     * Dispose all clients
     */
    static async disposeAll() {
        const promises = Array.from(this.clients.values()).map(client => client.dispose());
        await Promise.all(promises);
        this.clients.clear();
    }
}
/**
 * Configuration helpers for different EVA services
 */
export class EvaServiceCosmosConfig {
    /**
     * Get configuration optimized for EVA RAG service
     */
    static forRagService(baseConfig) {
        return {
            endpoint: baseConfig.endpoint,
            databaseName: baseConfig.databaseName,
            useMangedIdentity: baseConfig.useMangedIdentity,
            keyVaultUrl: baseConfig.keyVaultUrl,
            primaryKey: baseConfig.primaryKey,
            consistencyLevel: baseConfig.consistencyLevel,
            enableVectorSearch: true, // Always enable for RAG
            vectorDimensions: baseConfig.vectorDimensions,
            retryOptions: {
                maxRetryAttemptCount: baseConfig.maxRetryAttempts,
                fixedRetryIntervalInMilliseconds: 500, // Faster for document processing
                maxRetryIntervalInMilliseconds: 5000,
            },
        };
    }
    /**
     * Get configuration optimized for EVA API service
     */
    static forApiService(baseConfig) {
        return {
            endpoint: baseConfig.endpoint,
            databaseName: baseConfig.databaseName,
            useMangedIdentity: baseConfig.useMangedIdentity,
            keyVaultUrl: baseConfig.keyVaultUrl,
            primaryKey: baseConfig.primaryKey,
            consistencyLevel: 'Session', // Optimize for user sessions
            enableVectorSearch: baseConfig.enableVectorSearch,
            vectorDimensions: baseConfig.vectorDimensions,
            retryOptions: {
                maxRetryAttemptCount: 5, // Higher retries for user-facing API
                fixedRetryIntervalInMilliseconds: 200,
                maxRetryIntervalInMilliseconds: 2000,
            },
        };
    }
    /**
     * Get configuration optimized for EVA Analytics service
     */
    static forAnalyticsService(baseConfig) {
        return {
            endpoint: baseConfig.endpoint,
            databaseName: baseConfig.databaseName,
            useMangedIdentity: baseConfig.useMangedIdentity,
            keyVaultUrl: baseConfig.keyVaultUrl,
            primaryKey: baseConfig.primaryKey,
            consistencyLevel: 'Eventual', // Analytics can tolerate eventual consistency
            enableVectorSearch: false, // Not needed for metrics
            vectorDimensions: 0,
            retryOptions: {
                maxRetryAttemptCount: 3,
                fixedRetryIntervalInMilliseconds: 1000,
                maxRetryIntervalInMilliseconds: 10000,
            },
        };
    }
}
// Export all types and classes
export * from './cosmos-client.js';
//# sourceMappingURL=cosmos-config.js.map