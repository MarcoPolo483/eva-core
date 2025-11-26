/**
 * EVA Conversation Repository
 * High-level repository for conversation and chat history management
 */
import { EvaCosmosClient, ConversationMessage, TenantContext, VectorSearchResult } from '../cosmos-client.js';
export interface ConversationSummary {
    conversationId: string;
    title?: string;
    lastMessage: string;
    lastMessageTime: Date;
    messageCount: number;
    participants: string[];
    tags?: string[];
}
export interface ConversationFilter {
    userId?: string;
    conversationIds?: string[];
    startDate?: Date;
    endDate?: Date;
    roles?: ('user' | 'assistant' | 'system')[];
    search?: string;
}
export interface ConversationAnalytics {
    totalConversations: number;
    totalMessages: number;
    averageMessagesPerConversation: number;
    averageResponseTime: number;
    mostActiveUsers: {
        userId: string;
        messageCount: number;
    }[];
    conversationsByDay: {
        date: string;
        count: number;
    }[];
}
/**
 * Repository for conversation operations with semantic search and analytics
 */
export declare class EvaConversationRepository {
    private cosmosClient;
    constructor(cosmosClient: EvaCosmosClient);
    /**
     * Create a new conversation message
     */
    createMessage(message: Omit<ConversationMessage, 'id' | 'timestamp' | 'tenantId'>, tenantContext: TenantContext): Promise<ConversationMessage>;
    /**
     * Get conversation history with optional filtering
     */
    getConversationHistory(conversationId: string, tenantContext: TenantContext, options?: {
        limit?: number;
        offset?: number;
        roles?: ('user' | 'assistant' | 'system')[];
        since?: Date;
    }): Promise<{
        messages: ConversationMessage[];
        hasMore: boolean;
        totalCount: number;
    }>;
    /**
     * Get all conversations for a user with summaries
     */
    getUserConversations(userId: string, tenantContext: TenantContext, page?: number, pageSize?: number): Promise<{
        conversations: ConversationSummary[];
        totalCount: number;
        hasMore: boolean;
    }>;
    /**
     * Search conversations using vector similarity
     */
    semanticSearchConversations(query: string, queryVector: number[], tenantContext: TenantContext, options?: {
        userId?: string;
        k?: number;
        scoreThreshold?: number;
        conversationIds?: string[];
    }): Promise<VectorSearchResult<ConversationMessage>[]>;
    /**
     * Search conversations by text content
     */
    searchConversations(filter: ConversationFilter, tenantContext: TenantContext, page?: number, pageSize?: number): Promise<{
        messages: ConversationMessage[];
        totalCount: number;
        hasMore: boolean;
    }>;
    /**
     * Get conversation analytics for dashboard
     */
    getConversationAnalytics(tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }): Promise<ConversationAnalytics>;
    /**
     * Update message with vector embedding
     */
    updateMessageVector(messageId: string, messageVector: number[], tenantContext: TenantContext): Promise<void>;
    /**
     * Delete conversation (soft delete by marking)
     */
    deleteConversation(conversationId: string, tenantContext: TenantContext): Promise<void>;
    /**
     * Get conversation context for AI prompting
     */
    getConversationContext(conversationId: string, tenantContext: TenantContext, maxMessages?: number): Promise<ConversationMessage[]>;
}
//# sourceMappingURL=conversation-repository.d.ts.map