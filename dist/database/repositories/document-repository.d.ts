/**
 * EVA Document Repository
 * High-level repository pattern for document management with advanced AI capabilities
 */
import { EvaCosmosClient, DocumentMetadata, TenantContext, VectorSearchResult } from './cosmos-client.js';
export interface DocumentFilter {
    documentTypes?: string[];
    status?: ('uploading' | 'processing' | 'completed' | 'failed')[];
    createdAfter?: Date;
    createdBefore?: Date;
    tags?: string[];
    search?: string;
    hasVectors?: boolean;
}
export interface DocumentStats {
    totalDocuments: number;
    documentsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
    averageProcessingTime: number;
    errorRate: number;
    storageUsed: number;
}
export interface ProcessingProgress {
    documentId: string;
    stage: string;
    progress: number;
    timeRemaining?: number;
    lastUpdated: Date;
}
/**
 * Repository for document operations with advanced querying and AI features
 */
export declare class EvaDocumentRepository {
    private cosmosClient;
    constructor(cosmosClient: EvaCosmosClient);
    /**
     * Create a new document with initial metadata
     */
    createDocument(document: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at' | 'tenantId'>, tenantContext: TenantContext): Promise<DocumentMetadata>;
    /**
     * Get document by ID with optional vector data
     */
    getDocument(documentId: string, tenantContext: TenantContext, includeVectors?: boolean): Promise<DocumentMetadata | null>;
    /**
     * Update document processing status and results
     */
    updateProcessingStatus(documentId: string, status: DocumentMetadata['status'], tenantContext: TenantContext, updates?: {
        processing_stage?: string;
        error_message?: string;
        processed_at?: Date;
        extracted_text?: string;
        summary?: string;
        key_points?: string[];
        entities?: any[];
        sentiment?: DocumentMetadata['sentiment'];
        content_vector?: number[];
        title_vector?: number[];
    }): Promise<DocumentMetadata>;
    /**
     * Search documents with filters and pagination
     */
    searchDocuments(filter: DocumentFilter, tenantContext: TenantContext, page?: number, pageSize?: number): Promise<{
        documents: DocumentMetadata[];
        totalCount: number;
        hasMore: boolean;
    }>;
    /**
     * Semantic search using vector embeddings
     */
    semanticSearch(query: string, queryVector: number[], tenantContext: TenantContext, options?: {
        documentTypes?: string[];
        k?: number;
        scoreThreshold?: number;
        searchField?: 'content_vector' | 'title_vector';
    }): Promise<VectorSearchResult<DocumentMetadata>[]>;
    /**
     * Get document statistics for dashboard
     */
    getDocumentStats(tenantContext: TenantContext, dateRange?: {
        start: Date;
        end: Date;
    }): Promise<DocumentStats>;
    /**
     * Get documents by file path pattern (for batch operations)
     */
    getDocumentsByPath(pathPattern: string, tenantContext: TenantContext): Promise<DocumentMetadata[]>;
    /**
     * Mark documents for reprocessing
     */
    markForReprocessing(documentIds: string[], tenantContext: TenantContext): Promise<DocumentMetadata[]>;
    /**
     * Delete documents (soft delete by updating status)
     */
    deleteDocuments(documentIds: string[], tenantContext: TenantContext, softDelete?: boolean): Promise<void>;
    /**
     * Get processing progress for multiple documents
     */
    getProcessingProgress(documentIds: string[], tenantContext: TenantContext): Promise<ProcessingProgress[]>;
}
//# sourceMappingURL=document-repository.d.ts.map