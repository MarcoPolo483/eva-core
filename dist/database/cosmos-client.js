/**
 * EVA Cosmos DB Client Library
 * Enterprise-grade Cosmos DB client with vector search, HPK support, and advanced AI capabilities
 * Optimized for EVA 2.0 microservices architecture
 */
import { CosmosClient } from '@azure/cosmos';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import { Logger } from '@azure/logger';
/**
 * EVA Cosmos DB Client with enterprise features
 */
export class EvaCosmosClient {
    cosmosClient;
    database;
    containers = new Map();
    logger;
    config;
    constructor(config) {
        this.config = config;
        this.logger = Logger('EVACosmosClient');
        // Initialize Cosmos client with managed identity or key
        this.cosmosClient = this.initializeCosmosClient();
        this.database = this.cosmosClient.database(config.databaseName);
        // Initialize containers
        this.initializeContainers();
    }
    initializeCosmosClient() {
        const options = {
            consistencyLevel: this.config.consistencyLevel || 'Session',
            connectionPolicy: {
                requestTimeout: 30000,
                enableEndpointDiscovery: true,
                preferredLocations: [], // Will be populated with geo-replicated regions
            },
            userAgentSuffix: 'EVA-2.0-Platform',
        };
        if (this.config.retryOptions) {
            options.connectionPolicy = {
                ...options.connectionPolicy,
                retryOptions: this.config.retryOptions,
            };
        }
        if (this.config.useMangedIdentity) {
            const credential = new DefaultAzureCredential();
            return new CosmosClient({
                endpoint: this.config.endpoint,
                aadCredentials: credential,
                ...options,
            });
        }
        else if (this.config.keyVaultUrl) {
            // Get key from Key Vault
            const credential = new DefaultAzureCredential();
            const keyVaultClient = new SecretClient(this.config.keyVaultUrl, credential);
            // This would be async in real implementation
            throw new Error('Key Vault integration requires async initialization');
        }
        else if (this.config.primaryKey) {
            return new CosmosClient({
                endpoint: this.config.endpoint,
                key: this.config.primaryKey,
                ...options,
            });
        }
        else {
            throw new Error('No authentication method provided. Use managed identity, Key Vault, or primary key.');
        }
    }
    initializeContainers() {
        const containerNames = ['documents', 'conversations', 'user_profiles', 'analytics'];
        containerNames.forEach(name => {
            this.containers.set(name, this.database.container(name));
        });
    }
    /**
     * Static factory method for async initialization with Key Vault
     */
    static async createWithKeyVault(config) {
        if (!config.keyVaultUrl) {
            throw new Error('Key Vault URL is required');
        }
        const credential = new DefaultAzureCredential();
        const keyVaultClient = new SecretClient(config.keyVaultUrl, credential);
        // Get Cosmos DB key from Key Vault
        const keySecret = await keyVaultClient.getSecret(`${config.endpoint.split('//')[1].split('.')[0]}-key`);
        const clientConfig = {
            ...config,
            primaryKey: keySecret.value,
            keyVaultUrl: undefined, // Clear to use key directly
        };
        return new EvaCosmosClient(clientConfig);
    }
    // Document Operations
    async createDocument(document, tenantContext) {
        const container = this.containers.get('documents');
        const newDocument = {
            ...document,
            id: this.generateId(),
            tenantId: tenantContext.tenantId,
            created_at: new Date(),
            updated_at: new Date(),
            status: 'uploading',
        };
        try {
            const response = await container.items.create(newDocument, {
                partitionKey: [newDocument.tenantId, newDocument.documentType],
            });
            this.logger.info(`Document created: ${response.item.id}`);
            return response.item;
        }
        catch (error) {
            this.logger.error('Error creating document:', error);
            throw error;
        }
    }
    async updateDocument(documentId, updates, tenantContext) {
        const container = this.containers.get('documents');
        try {
            // First get the document to maintain partition key
            const { item: existingDoc } = await container.item(documentId, [tenantContext.tenantId]).read();
            const updatedDocument = {
                ...existingDoc,
                ...updates,
                updated_at: new Date(),
            };
            const response = await container.item(documentId, [tenantContext.tenantId]).replace(updatedDocument);
            this.logger.info(`Document updated: ${documentId}`);
            return response.item;
        }
        catch (error) {
            this.logger.error(`Error updating document ${documentId}:`, error);
            throw error;
        }
    }
    async getDocument(documentId, tenantContext) {
        const container = this.containers.get('documents');
        try {
            const response = await container.item(documentId, [tenantContext.tenantId]).read();
            return response.item;
        }
        catch (error) {
            if (error.code === 404) {
                return null;
            }
            this.logger.error(`Error getting document ${documentId}:`, error);
            throw error;
        }
    }
    async queryDocuments(query, tenantContext, options) {
        const container = this.containers.get('documents');
        const queryOptions = {
            partitionKey: [tenantContext.tenantId],
            maxItemCount: 100,
            ...options,
        };
        try {
            const { resources } = await container.items.query(query, queryOptions).fetchAll();
            return resources;
        }
        catch (error) {
            this.logger.error('Error querying documents:', error);
            throw error;
        }
    }
    // Vector Search Operations (requires vector search enabled)
    async vectorSearchDocuments(searchOptions, tenantContext) {
        if (!this.config.enableVectorSearch) {
            throw new Error('Vector search is not enabled in configuration');
        }
        const container = this.containers.get('documents');
        const query = `
      SELECT c.*, VectorDistance(c.${searchOptions.path}, @vector) AS score 
      FROM c 
      WHERE c.tenantId = @tenantId
      ${searchOptions.filter ? `AND ${searchOptions.filter}` : ''}
      ORDER BY VectorDistance(c.${searchOptions.path}, @vector)
      OFFSET 0 LIMIT ${searchOptions.k || 10}
    `;
        const querySpec = {
            query,
            parameters: [
                { name: '@vector', value: searchOptions.vector },
                { name: '@tenantId', value: tenantContext.tenantId },
            ],
        };
        try {
            const { resources } = await container.items.query(querySpec, {
                partitionKey: [tenantContext.tenantId],
            }).fetchAll();
            return resources.map(item => ({
                item: item,
                score: item.score,
            }));
        }
        catch (error) {
            this.logger.error('Error performing vector search:', error);
            throw error;
        }
    }
    // Conversation Operations
    async createConversation(message, tenantContext) {
        const container = this.containers.get('conversations');
        const newMessage = {
            ...message,
            id: this.generateId(),
            tenantId: tenantContext.tenantId,
            timestamp: new Date(),
        };
        try {
            const response = await container.items.create(newMessage, {
                partitionKey: [newMessage.tenantId, newMessage.userId],
            });
            this.logger.info(`Conversation message created: ${response.item.id}`);
            return response.item;
        }
        catch (error) {
            this.logger.error('Error creating conversation message:', error);
            throw error;
        }
    }
    async getConversationHistory(conversationId, tenantContext, limit = 50) {
        const container = this.containers.get('conversations');
        const query = `
      SELECT * FROM c 
      WHERE c.tenantId = @tenantId 
        AND c.conversation_id = @conversationId
      ORDER BY c.timestamp DESC
      OFFSET 0 LIMIT ${limit}
    `;
        const querySpec = {
            query,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@conversationId', value: conversationId },
            ],
        };
        try {
            const { resources } = await container.items.query(querySpec, {
                partitionKey: [tenantContext.tenantId, tenantContext.userId],
            }).fetchAll();
            return resources.reverse(); // Return in chronological order
        }
        catch (error) {
            this.logger.error('Error getting conversation history:', error);
            throw error;
        }
    }
    // User Profile Operations
    async createOrUpdateUserProfile(profile, tenantContext) {
        const container = this.containers.get('user_profiles');
        const userProfile = {
            ...profile,
            tenantId: tenantContext.tenantId,
            updated_at: new Date(),
        };
        try {
            const response = await container.items.upsert(userProfile, {
                partitionKey: [userProfile.tenantId],
            });
            this.logger.info(`User profile updated: ${response.item.user_id}`);
            return response.item;
        }
        catch (error) {
            this.logger.error('Error updating user profile:', error);
            throw error;
        }
    }
    async getUserProfile(userId, tenantContext) {
        const container = this.containers.get('user_profiles');
        const query = `SELECT * FROM c WHERE c.tenantId = @tenantId AND c.user_id = @userId`;
        const querySpec = {
            query,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@userId', value: userId },
            ],
        };
        try {
            const { resources } = await container.items.query(querySpec, {
                partitionKey: [tenantContext.tenantId],
            }).fetchAll();
            return resources[0] || null;
        }
        catch (error) {
            this.logger.error(`Error getting user profile ${userId}:`, error);
            throw error;
        }
    }
    // Analytics Operations
    async recordMetric(metric, tenantContext) {
        const container = this.containers.get('analytics');
        const analyticsMetric = {
            ...metric,
            id: this.generateId(),
            tenantId: tenantContext.tenantId,
            timestamp: new Date(),
        };
        try {
            await container.items.create(analyticsMetric, {
                partitionKey: [analyticsMetric.tenantId, analyticsMetric.metric_type],
            });
            this.logger.info(`Metric recorded: ${analyticsMetric.metric_type}`);
        }
        catch (error) {
            this.logger.error('Error recording metric:', error);
            throw error;
        }
    }
    async getMetrics(metricType, tenantContext, startDate, endDate) {
        const container = this.containers.get('analytics');
        const query = `
      SELECT * FROM c 
      WHERE c.tenantId = @tenantId 
        AND c.metric_type = @metricType
        AND c.timestamp >= @startDate 
        AND c.timestamp <= @endDate
      ORDER BY c.timestamp DESC
    `;
        const querySpec = {
            query,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@metricType', value: metricType },
                { name: '@startDate', value: startDate.toISOString() },
                { name: '@endDate', value: endDate.toISOString() },
            ],
        };
        try {
            const { resources } = await container.items.query(querySpec, {
                partitionKey: [tenantContext.tenantId, metricType],
            }).fetchAll();
            return resources;
        }
        catch (error) {
            this.logger.error('Error getting metrics:', error);
            throw error;
        }
    }
    // Batch Operations for high-performance scenarios
    async batchCreateDocuments(documents, tenantContext) {
        const container = this.containers.get('documents');
        const batchOperations = documents.map(doc => {
            const newDoc = {
                ...doc,
                id: this.generateId(),
                tenantId: tenantContext.tenantId,
                created_at: new Date(),
                updated_at: new Date(),
                status: 'uploading',
            };
            return {
                operationType: 'Create',
                partitionKey: [newDoc.tenantId, newDoc.documentType],
                resourceBody: newDoc,
            };
        });
        try {
            const results = [];
            // Process in chunks of 100 (Cosmos DB batch limit)
            for (let i = 0; i < batchOperations.length; i += 100) {
                const chunk = batchOperations.slice(i, i + 100);
                const response = await container.items.batch(chunk);
                response.result.forEach(result => {
                    if (result.statusCode >= 200 && result.statusCode < 300) {
                        results.push(result.resourceBody);
                    }
                });
            }
            this.logger.info(`Batch created ${results.length} documents`);
            return results;
        }
        catch (error) {
            this.logger.error('Error in batch create documents:', error);
            throw error;
        }
    }
    // Utility methods
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Health check
    async healthCheck() {
        try {
            await this.database.read();
            return true;
        }
        catch (error) {
            this.logger.error('Health check failed:', error);
            return false;
        }
    }
    // Cleanup resources
    async dispose() {
        await this.cosmosClient.dispose();
    }
}
//# sourceMappingURL=cosmos-client.js.map