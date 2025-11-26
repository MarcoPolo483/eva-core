/**
 * EVA Conversation Repository
 * High-level repository for conversation and chat history management
 */
/**
 * Repository for conversation operations with semantic search and analytics
 */
export class EvaConversationRepository {
    cosmosClient;
    constructor(cosmosClient) {
        this.cosmosClient = cosmosClient;
    }
    /**
     * Create a new conversation message
     */
    async createMessage(message, tenantContext) {
        return await this.cosmosClient.createConversation(message, tenantContext);
    }
    /**
     * Get conversation history with optional filtering
     */
    async getConversationHistory(conversationId, tenantContext, options = {}) {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        let roleFilter = '';
        let dateFilter = '';
        const parameters = [
            { name: '@tenantId', value: tenantContext.tenantId },
            { name: '@conversationId', value: conversationId },
        ];
        if (options.roles?.length) {
            roleFilter = `AND c.role IN (${options.roles.map((_, i) => `@role${i}`).join(',')})`;
            options.roles.forEach((role, i) => {
                parameters.push({ name: `@role${i}`, value: role });
            });
        }
        if (options.since) {
            dateFilter = 'AND c.timestamp >= @since';
            parameters.push({ name: '@since', value: options.since.toISOString() });
        }
        // Get messages
        const query = {
            query: `
        SELECT * FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.conversation_id = @conversationId
          ${roleFilter}
          ${dateFilter}
        ORDER BY c.timestamp ASC
        OFFSET ${offset} LIMIT ${limit}
      `,
            parameters,
        };
        const messages = await this.cosmosClient.queryDocuments(query, tenantContext);
        // Get total count
        const countQuery = {
            query: `
        SELECT VALUE COUNT(1) FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.conversation_id = @conversationId
          ${roleFilter}
          ${dateFilter}
      `,
            parameters,
        };
        const countResult = await this.cosmosClient.queryDocuments(countQuery, tenantContext);
        const totalCount = countResult[0] || 0;
        return {
            messages,
            hasMore: offset + limit < totalCount,
            totalCount,
        };
    }
    /**
     * Get all conversations for a user with summaries
     */
    async getUserConversations(userId, tenantContext, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        // Get conversation summaries using group by
        const query = {
            query: `
        SELECT 
          c.conversation_id as conversationId,
          MAX(c.timestamp) as lastMessageTime,
          COUNT(1) as messageCount,
          ARRAY_AGG({
            "content": c.content,
            "role": c.role,
            "timestamp": c.timestamp
          }) as messages
        FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.userId = @userId
        GROUP BY c.conversation_id
        ORDER BY MAX(c.timestamp) DESC
        OFFSET ${offset} LIMIT ${pageSize}
      `,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@userId', value: userId },
            ],
        };
        const results = await this.cosmosClient.queryDocuments(query, tenantContext);
        const conversations = results.map(result => {
            // Find the last message
            const sortedMessages = result.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const lastMessage = sortedMessages[0];
            // Generate title from first user message or use last message
            let title = undefined;
            const firstUserMessage = result.messages.find((m) => m.role === 'user');
            if (firstUserMessage) {
                title = firstUserMessage.content.substring(0, 100) + (firstUserMessage.content.length > 100 ? '...' : '');
            }
            return {
                conversationId: result.conversationId,
                title,
                lastMessage: lastMessage.content.substring(0, 200) + (lastMessage.content.length > 200 ? '...' : ''),
                lastMessageTime: new Date(result.lastMessageTime),
                messageCount: result.messageCount,
                participants: [userId], // In this case, just the user
            };
        });
        // Get total conversation count
        const countQuery = {
            query: `
        SELECT VALUE COUNT(DISTINCT c.conversation_id) FROM c 
        WHERE c.tenantId = @tenantId AND c.userId = @userId
      `,
            parameters: [
                { name: '@tenantId', value: tenantContext.tenantId },
                { name: '@userId', value: userId },
            ],
        };
        const countResult = await this.cosmosClient.queryDocuments(countQuery, tenantContext);
        const totalCount = countResult[0] || 0;
        return {
            conversations,
            totalCount,
            hasMore: offset + pageSize < totalCount,
        };
    }
    /**
     * Search conversations using vector similarity
     */
    async semanticSearchConversations(query, queryVector, tenantContext, options = {}) {
        const searchOptions = {
            vector: queryVector,
            path: 'message_vector',
            k: options.k || 10,
        };
        // Build filter conditions
        const filterConditions = [];
        if (options.userId) {
            filterConditions.push(`c.userId = '${options.userId}'`);
        }
        if (options.conversationIds?.length) {
            const conversationFilter = options.conversationIds.map(id => `'${id}'`).join(',');
            filterConditions.push(`c.conversation_id IN (${conversationFilter})`);
        }
        if (filterConditions.length > 0) {
            searchOptions.filter = filterConditions.join(' AND ');
        }
        const results = await this.cosmosClient.vectorSearchDocuments(searchOptions, tenantContext);
        // Apply score threshold if specified
        if (options.scoreThreshold) {
            return results.filter(result => result.score >= options.scoreThreshold);
        }
        return results;
    }
    /**
     * Search conversations by text content
     */
    async searchConversations(filter, tenantContext, page = 1, pageSize = 20) {
        const conditions = ['c.tenantId = @tenantId'];
        const parameters = [{ name: '@tenantId', value: tenantContext.tenantId }];
        // Build dynamic WHERE clause
        if (filter.userId) {
            conditions.push('c.userId = @userId');
            parameters.push({ name: '@userId', value: filter.userId });
        }
        if (filter.conversationIds?.length) {
            conditions.push(`c.conversation_id IN (${filter.conversationIds.map((_, i) => `@convId${i}`).join(',')})`);
            filter.conversationIds.forEach((id, i) => {
                parameters.push({ name: `@convId${i}`, value: id });
            });
        }
        if (filter.startDate) {
            conditions.push('c.timestamp >= @startDate');
            parameters.push({ name: '@startDate', value: filter.startDate.toISOString() });
        }
        if (filter.endDate) {
            conditions.push('c.timestamp <= @endDate');
            parameters.push({ name: '@endDate', value: filter.endDate.toISOString() });
        }
        if (filter.roles?.length) {
            conditions.push(`c.role IN (${filter.roles.map((_, i) => `@role${i}`).join(',')})`);
            filter.roles.forEach((role, i) => {
                parameters.push({ name: `@role${i}`, value: role });
            });
        }
        if (filter.search) {
            conditions.push('CONTAINS(c.content, @search)');
            parameters.push({ name: '@search', value: filter.search });
        }
        const offset = (page - 1) * pageSize;
        const query = {
            query: `
        SELECT * FROM c 
        WHERE ${conditions.join(' AND ')}
        ORDER BY c.timestamp DESC
        OFFSET ${offset} LIMIT ${pageSize}
      `,
            parameters,
        };
        const messages = await this.cosmosClient.queryDocuments(query, tenantContext);
        // Get total count
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
            messages,
            totalCount,
            hasMore: offset + pageSize < totalCount,
        };
    }
    /**
     * Get conversation analytics for dashboard
     */
    async getConversationAnalytics(tenantContext, dateRange) {
        const parameters = [
            { name: '@tenantId', value: tenantContext.tenantId },
            { name: '@startDate', value: dateRange.start.toISOString() },
            { name: '@endDate', value: dateRange.end.toISOString() },
        ];
        // Get all messages in date range
        const query = {
            query: `
        SELECT 
          c.conversation_id,
          c.userId,
          c.role,
          c.timestamp,
          c.metadata
        FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.timestamp >= @startDate 
          AND c.timestamp <= @endDate
      `,
            parameters,
        };
        const messages = await this.cosmosClient.queryDocuments(query, tenantContext);
        // Process analytics
        const conversationIds = new Set();
        const userMessageCounts = {};
        const conversationsByDay = {};
        const responseTimes = [];
        // Group messages by conversation for response time calculation
        const conversationMessages = {};
        messages.forEach(message => {
            conversationIds.add(message.conversation_id);
            // Count user messages
            if (message.role === 'user') {
                userMessageCounts[message.userId] = (userMessageCounts[message.userId] || 0) + 1;
            }
            // Group by day
            const day = new Date(message.timestamp).toISOString().split('T')[0];
            if (!conversationsByDay[day]) {
                conversationsByDay[day] = new Set();
            }
            conversationsByDay[day].add(message.conversation_id);
            // Group messages by conversation
            if (!conversationMessages[message.conversation_id]) {
                conversationMessages[message.conversation_id] = [];
            }
            conversationMessages[message.conversation_id].push(message);
        });
        // Calculate response times
        Object.values(conversationMessages).forEach(convMessages => {
            convMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            for (let i = 0; i < convMessages.length - 1; i++) {
                const currentMsg = convMessages[i];
                const nextMsg = convMessages[i + 1];
                // Calculate response time from user to assistant
                if (currentMsg.role === 'user' && nextMsg.role === 'assistant') {
                    const responseTime = new Date(nextMsg.timestamp).getTime() - new Date(currentMsg.timestamp).getTime();
                    // Use processing time from metadata if available
                    const processingTime = nextMsg.metadata?.processing_time_ms;
                    if (processingTime) {
                        responseTimes.push(processingTime);
                    }
                    else {
                        responseTimes.push(responseTime);
                    }
                }
            }
        });
        // Calculate averages
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
        const totalConversations = conversationIds.size;
        const totalMessages = messages.length;
        const averageMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;
        // Sort most active users
        const mostActiveUsers = Object.entries(userMessageCounts)
            .map(([userId, count]) => ({ userId, messageCount: count }))
            .sort((a, b) => b.messageCount - a.messageCount)
            .slice(0, 10);
        // Format conversations by day
        const conversationsByDayFormatted = Object.entries(conversationsByDay)
            .map(([date, conversations]) => ({
            date,
            count: conversations.size
        }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return {
            totalConversations,
            totalMessages,
            averageMessagesPerConversation,
            averageResponseTime,
            mostActiveUsers,
            conversationsByDay: conversationsByDayFormatted,
        };
    }
    /**
     * Update message with vector embedding
     */
    async updateMessageVector(messageId, messageVector, tenantContext) {
        // This would be implemented by updating the specific message
        // For now, we'll throw an error since individual message updates require the partition key
        throw new Error('Message vector updates should be done during initial creation');
    }
    /**
     * Delete conversation (soft delete by marking)
     */
    async deleteConversation(conversationId, tenantContext) {
        // In a real implementation, you might mark messages as deleted
        // or move them to a different container
        // For now, this is a placeholder
        const messages = await this.getConversationHistory(conversationId, tenantContext, { limit: 1000 });
        // In practice, you'd batch delete or mark as deleted
        console.warn(`Conversation deletion not implemented for conversation: ${conversationId}`);
    }
    /**
     * Get conversation context for AI prompting
     */
    async getConversationContext(conversationId, tenantContext, maxMessages = 10) {
        const { messages } = await this.getConversationHistory(conversationId, tenantContext, {
            limit: maxMessages,
            roles: ['user', 'assistant'] // Exclude system messages from context
        });
        // Return in reverse order (most recent first for context)
        return messages.reverse();
    }
}
//# sourceMappingURL=conversation-repository.js.map