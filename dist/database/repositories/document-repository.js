/**
 * EVA Document Repository
 * High-level repository pattern for document management with advanced AI capabilities
 */
/**
 * Repository for document operations with advanced querying and AI features
 */
export class EvaDocumentRepository {
    cosmosClient;
    constructor(cosmosClient) {
        this.cosmosClient = cosmosClient;
    }
    /**
     * Create a new document with initial metadata
     */
    async createDocument(document, tenantContext) {
        return await this.cosmosClient.createDocument(document, tenantContext);
    }
    /**
     * Get document by ID with optional vector data
     */
    async getDocument(documentId, tenantContext, includeVectors = false) {
        const document = await this.cosmosClient.getDocument(documentId, tenantContext);
        if (document && !includeVectors) {
            // Remove vector data for performance if not needed
            delete document.content_vector;
            delete document.title_vector;
        }
        return document;
    }
    /**
     * Update document processing status and results
     */
    async updateProcessingStatus(documentId, status, tenantContext, updates) {
        const updateData = {
            status,
            ...updates,
        };
        if (status === 'completed') {
            updateData.processed_at = new Date();
        }
        return await this.cosmosClient.updateDocument(documentId, updateData, tenantContext);
    }
    /**
     * Search documents with filters and pagination
     */
    async searchDocuments(filter, tenantContext, page = 1, pageSize = 20) {
        const conditions = ['c.tenantId = @tenantId'];
        const parameters = [{ name: '@tenantId', value: tenantContext.tenantId }];
        // Build dynamic WHERE clause
        if (filter.documentTypes?.length) {
            conditions.push(`c.documentType IN (${filter.documentTypes.map((_, i) => `@docType${i}`).join(',')})`);
            filter.documentTypes.forEach((type, i) => {
                parameters.push({ name: `@docType${i}`, value: type });
            });
        }
        if (filter.status?.length) {
            conditions.push(`c.status IN (${filter.status.map((_, i) => `@status${i}`).join(',')})`);
            filter.status.forEach((status, i) => {
                parameters.push({ name: `@status${i}`, value: status });
            });
        }
        if (filter.createdAfter) {
            conditions.push('c.created_at >= @createdAfter');
            parameters.push({ name: '@createdAfter', value: filter.createdAfter.toISOString() });
        }
        if (filter.createdBefore) {
            conditions.push('c.created_at <= @createdBefore');
            parameters.push({ name: '@createdBefore', value: filter.createdBefore.toISOString() });
        }
        if (filter.tags?.length) {
            conditions.push('ARRAY_CONTAINS_ANY(c.tags, @tags)');
            parameters.push({ name: '@tags', value: filter.tags });
        }
        if (filter.search) {
            conditions.push('(CONTAINS(c.file_name, @search) OR CONTAINS(c.extracted_text, @search))');
            parameters.push({ name: '@search', value: filter.search });
        }
        if (filter.hasVectors !== undefined) {
            if (filter.hasVectors) {
                conditions.push('(IS_DEFINED(c.content_vector) OR IS_DEFINED(c.title_vector))');
            }
            else {
                conditions.push('(NOT IS_DEFINED(c.content_vector) AND NOT IS_DEFINED(c.title_vector))');
            }
        }
        const offset = (page - 1) * pageSize;
        const query = {
            query: `
        SELECT * FROM c 
        WHERE ${conditions.join(' AND ')}
        ORDER BY c.created_at DESC
        OFFSET ${offset} LIMIT ${pageSize}
      `,
            parameters,
        };
        const documents = await this.cosmosClient.queryDocuments(query, tenantContext);
        // Get total count for pagination
        const countQuery = {
            query: `
        SELECT VALUE COUNT(1) FROM c 
        WHERE ${conditions.join(' AND ')}
      `,
            parameters,
        };
        const countResult = await this.cosmosClient.queryDocuments(countQuery, tenantContext);
        const totalCount = countResult[0] || 0;
        return {
            documents,
            totalCount,
            hasMore: offset + pageSize < totalCount,
        };
    }
    /**
     * Semantic search using vector embeddings
     */
    async semanticSearch(query, queryVector, tenantContext, options = {}) {
        const searchOptions = {
            vector: queryVector,
            path: options.searchField || 'content_vector',
            k: options.k || 10,
        };
        // Add filters for document types
        if (options.documentTypes?.length) {
            const typeFilter = options.documentTypes.map(type => `'${type}'`).join(',');
            searchOptions.filter = `c.documentType IN (${typeFilter})`;
        }
        const results = await this.cosmosClient.vectorSearchDocuments(searchOptions, tenantContext);
        // Apply score threshold if specified
        if (options.scoreThreshold) {
            return results.filter(result => result.score >= options.scoreThreshold);
        }
        return results;
    }
    /**
     * Get document statistics for dashboard
     */
    async getDocumentStats(tenantContext, dateRange) {
        let dateFilter = '';
        const parameters = [{ name: '@tenantId', value: tenantContext.tenantId }];
        if (dateRange) {
            dateFilter = 'AND c.created_at >= @startDate AND c.created_at <= @endDate';
            parameters.push({ name: '@startDate', value: dateRange.start.toISOString() }, { name: '@endDate', value: dateRange.end.toISOString() });
        }
        // Get total count and status distribution
        const statsQuery = {
            query: `
        SELECT 
          COUNT(1) as totalDocuments,
          c.status,
          c.documentType,
          c.file_size,
          c.created_at,
          c.processed_at
        FROM c 
        WHERE c.tenantId = @tenantId ${dateFilter}
      `,
            parameters,
        };
        const results = await this.cosmosClient.queryDocuments(statsQuery, tenantContext);
        // Process results to calculate statistics
        const stats = {
            totalDocuments: results.length,
            documentsByStatus: {},
            documentsByType: {},
            averageProcessingTime: 0,
            errorRate: 0,
            storageUsed: 0,
        };
        let totalProcessingTime = 0;
        let processedCount = 0;
        let errorCount = 0;
        results.forEach(doc => {
            // Count by status
            stats.documentsByStatus[doc.status] = (stats.documentsByStatus[doc.status] || 0) + 1;
            // Count by type
            stats.documentsByType[doc.documentType] = (stats.documentsByType[doc.documentType] || 0) + 1;
            // Storage usage
            stats.storageUsed += doc.file_size || 0;
            // Processing time calculation
            if (doc.status === 'completed' && doc.processed_at && doc.created_at) {
                const processingTime = new Date(doc.processed_at).getTime() - new Date(doc.created_at).getTime();
                totalProcessingTime += processingTime;
                processedCount++;
            }
            // Error counting
            if (doc.status === 'failed') {
                errorCount++;
            }
        });
        stats.averageProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount / 1000 : 0; // Convert to seconds
        stats.errorRate = stats.totalDocuments > 0 ? (errorCount / stats.totalDocuments) * 100 : 0;
        return stats;
    }
    /**
     * Get documents by file path pattern (for batch operations)
     */
    async getDocumentsByPath(pathPattern, tenantContext) {
        const query = {
            query: `
        SELECT * FROM c 
        WHERE c.tenantId = @tenantId 
          AND STARTSWITH(c.file_path, @pathPattern)
        ORDER BY c.file_path
      `,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@pathPattern', value: pathPattern },
            ],
        };
        return await this.cosmosClient.queryDocuments(query, tenantContext);
    }
    /**
     * Mark documents for reprocessing
     */
    async markForReprocessing(documentIds, tenantContext) {
        const results = [];
        for (const documentId of documentIds) {
            try {
                const updated = await this.updateProcessingStatus(documentId, 'uploading', tenantContext, {
                    processing_stage: 'queued-for-reprocessing',
                    error_message: undefined,
                    processed_at: undefined,
                    // Clear previous results
                    extracted_text: undefined,
                    summary: undefined,
                    key_points: undefined,
                    entities: undefined,
                    sentiment: undefined,
                    content_vector: undefined,
                    title_vector: undefined,
                });
                results.push(updated);
            }
            catch (error) {
                console.error(`Failed to mark document ${documentId} for reprocessing:`, error);
            }
        }
        return results;
    }
    /**
     * Delete documents (soft delete by updating status)
     */
    async deleteDocuments(documentIds, tenantContext, softDelete = true) {
        if (softDelete) {
            // Soft delete by updating status
            for (const documentId of documentIds) {
                await this.updateProcessingStatus(documentId, 'failed', tenantContext, {
                    processing_stage: 'deleted',
                    error_message: 'Document deleted by user',
                });
            }
        }
        else {
            // Hard delete (implement if needed)
            throw new Error('Hard delete not implemented for security reasons');
        }
    }
    /**
     * Get processing progress for multiple documents
     */
    async getProcessingProgress(documentIds, tenantContext) {
        const documents = await Promise.all(documentIds.map(id => this.getDocument(id, tenantContext)));
        return documents
            .filter(doc => doc !== null)
            .map(doc => {
            let progress = 0;
            switch (doc.status) {
                case 'uploading':
                    progress = 10;
                    break;
                case 'processing':
                    progress = 50;
                    break;
                case 'completed':
                    progress = 100;
                    break;
                case 'failed':
                    progress = 0;
                    break;
            }
            return {
                documentId: doc.id,
                stage: doc.processing_stage || doc.status,
                progress,
                lastUpdated: doc.updated_at,
            };
        });
    }
}
//# sourceMappingURL=document-repository.js.map