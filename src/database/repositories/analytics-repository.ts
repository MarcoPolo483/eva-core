/**
 * EVA Analytics Repository
 * Repository for metrics, usage analytics, and performance monitoring
 */

import { 
  EvaCosmosClient, 
  AnalyticsMetric, 
  TenantContext 
} from '../cosmos-client.js';
import { SqlQuerySpec } from '@azure/cosmos';

export interface MetricAggregation {
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  dimensions?: Record<string, string>;
}

export interface UsageReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    documentsProcessed: number;
    conversationsCreated: number;
    vectorSearches: number;
    apiCalls: number;
    storageUsed: number;
    processingTimeTotal: number;
    errorCount: number;
  };
  trends: {
    documentsPerDay: TimeSeriesData[];
    conversationsPerDay: TimeSeriesData[];
    errorRatePerDay: TimeSeriesData[];
  };
  topUsers: {
    userId: string;
    activityCount: number;
    documentsProcessed: number;
    conversationsCreated: number;
  }[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughput: number; // requests per second
}

/**
 * Repository for analytics and metrics operations
 */
export class EvaAnalyticsRepository {
  constructor(private cosmosClient: EvaCosmosClient) {}

  /**
   * Record a metric event
   */
  async recordMetric(
    metric: Omit<AnalyticsMetric, 'id' | 'timestamp' | 'tenantId'>,
    tenantContext: TenantContext
  ): Promise<void> {
    await this.cosmosClient.recordMetric(metric, tenantContext);
  }

  /**
   * Record multiple metrics in batch for performance
   */
  async recordMetricsBatch(
    metrics: Omit<AnalyticsMetric, 'id' | 'timestamp' | 'tenantId'>[],
    tenantContext: TenantContext
  ): Promise<void> {
    // Process in chunks to avoid overwhelming Cosmos DB
    const chunkSize = 25; // Conservative batch size
    
    for (let i = 0; i < metrics.length; i += chunkSize) {
      const chunk = metrics.slice(i, i + chunkSize);
      
      // Record each metric in the chunk
      await Promise.all(
        chunk.map(metric => this.recordMetric(metric, tenantContext))
      );
    }
  }

  /**
   * Get metrics for a specific type and time range
   */
  async getMetrics(
    metricType: string,
    tenantContext: TenantContext,
    dateRange: { start: Date; end: Date },
    dimensions?: Record<string, string>
  ): Promise<AnalyticsMetric[]> {
    return await this.cosmosClient.getMetrics(
      metricType,
      tenantContext,
      dateRange.start,
      dateRange.end
    );
  }

  /**
   * Get aggregated metrics for dashboard display
   */
  async getMetricAggregation(
    metricType: string,
    tenantContext: TenantContext,
    dateRange: { start: Date; end: Date },
    dimensions?: Record<string, string>
  ): Promise<MetricAggregation> {
    const conditions = [
      'c.tenantId = @tenantId',
      'c.metric_type = @metricType',
      'c.timestamp >= @startDate',
      'c.timestamp <= @endDate'
    ];

    const parameters: any[] = [
      { name: '@tenantId', value: tenantContext.tenantId },
      { name: '@metricType', value: metricType },
      { name: '@startDate', value: dateRange.start.toISOString() },
      { name: '@endDate', value: dateRange.end.toISOString() },
    ];

    // Add dimension filters
    if (dimensions) {
      Object.entries(dimensions).forEach(([key, value], index) => {
        conditions.push(`c.dimensions.${key} = @dim${index}`);
        parameters.push({ name: `@dim${index}`, value });
      });
    }

    const query: SqlQuerySpec = {
      query: `
        SELECT 
          SUM(c.value) as sum,
          AVG(c.value) as average,
          MIN(c.value) as min,
          MAX(c.value) as max,
          COUNT(1) as count
        FROM c 
        WHERE ${conditions.join(' AND ')}
      `,
      parameters,
    };

    const results = await this.cosmosClient.queryDocuments(query, tenantContext);
    const result = results[0];

    return {
      sum: result?.sum || 0,
      average: result?.average || 0,
      min: result?.min || 0,
      max: result?.max || 0,
      count: result?.count || 0,
    };
  }

  /**
   * Get time series data for trending analysis
   */
  async getTimeSeriesData(
    metricType: string,
    tenantContext: TenantContext,
    dateRange: { start: Date; end: Date },
    interval: 'hour' | 'day' | 'week' | 'month' = 'day',
    dimensions?: Record<string, string>
  ): Promise<TimeSeriesData[]> {
    const conditions = [
      'c.tenantId = @tenantId',
      'c.metric_type = @metricType',
      'c.timestamp >= @startDate',
      'c.timestamp <= @endDate'
    ];

    const parameters: any[] = [
      { name: '@tenantId', value: tenantContext.tenantId },
      { name: '@metricType', value: metricType },
      { name: '@startDate', value: dateRange.start.toISOString() },
      { name: '@endDate', value: dateRange.end.toISOString() },
    ];

    // Add dimension filters
    if (dimensions) {
      Object.entries(dimensions).forEach(([key, value], index) => {
        conditions.push(`c.dimensions.${key} = @dim${index}`);
        parameters.push({ name: `@dim${index}`, value });
      });
    }

    // Generate time buckets based on interval
    let dateFormat: string;
    switch (interval) {
      case 'hour':
        dateFormat = "SUBSTRING(c.timestamp, 0, 13) + ':00:00Z'"; // YYYY-MM-DDTHH:00:00Z
        break;
      case 'day':
        dateFormat = "SUBSTRING(c.timestamp, 0, 10) + 'T00:00:00Z'"; // YYYY-MM-DDTHH:00:00Z
        break;
      case 'week':
        // This would need more complex logic for week boundaries
        dateFormat = "SUBSTRING(c.timestamp, 0, 10) + 'T00:00:00Z'";
        break;
      case 'month':
        dateFormat = "SUBSTRING(c.timestamp, 0, 7) + '-01T00:00:00Z'"; // YYYY-MM-01T00:00:00Z
        break;
      default:
        dateFormat = "SUBSTRING(c.timestamp, 0, 10) + 'T00:00:00Z'";
    }

    const query: SqlQuerySpec = {
      query: `
        SELECT 
          ${dateFormat} as timeBucket,
          SUM(c.value) as value,
          c.dimensions
        FROM c 
        WHERE ${conditions.join(' AND ')}
        GROUP BY ${dateFormat}, c.dimensions
        ORDER BY ${dateFormat}
      `,
      parameters,
    };

    const results = await this.cosmosClient.queryDocuments(query, tenantContext);

    return results.map(result => ({
      timestamp: new Date(result.timeBucket),
      value: result.value,
      dimensions: result.dimensions,
    }));
  }

  /**
   * Generate comprehensive usage report
   */
  async generateUsageReport(
    tenantContext: TenantContext,
    dateRange: { start: Date; end: Date }
  ): Promise<UsageReport> {
    // Get all metrics for the period
    const allMetricsQuery: SqlQuerySpec = {
      query: `
        SELECT 
          c.metric_type,
          c.value,
          c.timestamp,
          c.dimensions
        FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.timestamp >= @startDate 
          AND c.timestamp <= @endDate
      `,
      parameters: [
        { name: '@tenantId', value: tenantContext.tenantId },
        { name: '@startDate', value: dateRange.start.toISOString() },
        { name: '@endDate', value: dateRange.end.toISOString() },
      ],
    };

    const allMetrics = await this.cosmosClient.queryDocuments(allMetricsQuery, tenantContext);

    // Initialize report structure
    const report: UsageReport = {
      period: dateRange,
      metrics: {
        documentsProcessed: 0,
        conversationsCreated: 0,
        vectorSearches: 0,
        apiCalls: 0,
        storageUsed: 0,
        processingTimeTotal: 0,
        errorCount: 0,
      },
      trends: {
        documentsPerDay: [],
        conversationsPerDay: [],
        errorRatePerDay: [],
      },
      topUsers: [],
    };

    // Process metrics
    const dailyMetrics: Record<string, Record<string, number>> = {};
    const userActivityCounts: Record<string, { 
      activityCount: number;
      documentsProcessed: number;
      conversationsCreated: number;
    }> = {};

    allMetrics.forEach(metric => {
      const date = new Date(metric.timestamp).toISOString().split('T')[0];
      
      // Initialize daily metrics
      if (!dailyMetrics[date]) {
        dailyMetrics[date] = {
          documents: 0,
          conversations: 0,
          errors: 0,
        };
      }

      // Aggregate main metrics
      switch (metric.metric_type) {
        case 'document.processed':
          report.metrics.documentsProcessed += metric.value;
          dailyMetrics[date].documents += metric.value;
          
          // Track user activity
          const userId = metric.dimensions?.userId;
          if (userId) {
            if (!userActivityCounts[userId]) {
              userActivityCounts[userId] = { activityCount: 0, documentsProcessed: 0, conversationsCreated: 0 };
            }
            userActivityCounts[userId].documentsProcessed += metric.value;
            userActivityCounts[userId].activityCount += 1;
          }
          break;
          
        case 'conversation.created':
          report.metrics.conversationsCreated += metric.value;
          dailyMetrics[date].conversations += metric.value;
          
          const convUserId = metric.dimensions?.userId;
          if (convUserId) {
            if (!userActivityCounts[convUserId]) {
              userActivityCounts[convUserId] = { activityCount: 0, documentsProcessed: 0, conversationsCreated: 0 };
            }
            userActivityCounts[convUserId].conversationsCreated += metric.value;
            userActivityCounts[convUserId].activityCount += 1;
          }
          break;
          
        case 'vector.search':
          report.metrics.vectorSearches += metric.value;
          break;
          
        case 'api.call':
          report.metrics.apiCalls += metric.value;
          break;
          
        case 'storage.used':
          report.metrics.storageUsed = Math.max(report.metrics.storageUsed, metric.value);
          break;
          
        case 'processing.time':
          report.metrics.processingTimeTotal += metric.value;
          break;
          
        case 'error.count':
          report.metrics.errorCount += metric.value;
          dailyMetrics[date].errors += metric.value;
          break;
      }
    });

    // Generate trends
    Object.entries(dailyMetrics)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, metrics]) => {
        report.trends.documentsPerDay.push({
          timestamp: new Date(date),
          value: metrics.documents,
        });
        
        report.trends.conversationsPerDay.push({
          timestamp: new Date(date),
          value: metrics.conversations,
        });
        
        const totalActivity = metrics.documents + metrics.conversations;
        const errorRate = totalActivity > 0 ? (metrics.errors / totalActivity) * 100 : 0;
        
        report.trends.errorRatePerDay.push({
          timestamp: new Date(date),
          value: errorRate,
        });
      });

    // Generate top users
    report.topUsers = Object.entries(userActivityCounts)
      .map(([userId, counts]) => ({
        userId,
        ...counts,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 10);

    return report;
  }

  /**
   * Get performance metrics for system monitoring
   */
  async getPerformanceMetrics(
    tenantContext: TenantContext,
    dateRange: { start: Date; end: Date },
    service?: string
  ): Promise<PerformanceMetrics> {
    const conditions = [
      'c.tenantId = @tenantId',
      'c.timestamp >= @startDate',
      'c.timestamp <= @endDate',
      "(c.metric_type = 'response.time' OR c.metric_type = 'error.count' OR c.metric_type = 'api.call')"
    ];

    const parameters: any[] = [
      { name: '@tenantId', value: tenantContext.tenantId },
      { name: '@startDate', value: dateRange.start.toISOString() },
      { name: '@endDate', value: dateRange.end.toISOString() },
    ];

    if (service) {
      conditions.push('c.dimensions.service = @service');
      parameters.push({ name: '@service', value: service });
    }

    const query: SqlQuerySpec = {
      query: `
        SELECT 
          c.metric_type,
          c.value,
          c.timestamp
        FROM c 
        WHERE ${conditions.join(' AND ')}
        ORDER BY c.timestamp
      `,
      parameters,
    };

    const metrics = await this.cosmosClient.queryDocuments(query, tenantContext);

    // Calculate performance metrics
    const responseTimes: number[] = [];
    let totalApiCalls = 0;
    let totalErrors = 0;

    metrics.forEach(metric => {
      switch (metric.metric_type) {
        case 'response.time':
          responseTimes.push(metric.value);
          break;
        case 'api.call':
          totalApiCalls += metric.value;
          break;
        case 'error.count':
          totalErrors += metric.value;
          break;
      }
    });

    // Calculate percentiles
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const errorRate = totalApiCalls > 0 ? (totalErrors / totalApiCalls) * 100 : 0;

    // Calculate throughput (requests per second)
    const timeDifferenceSeconds = (dateRange.end.getTime() - dateRange.start.getTime()) / 1000;
    const throughput = timeDifferenceSeconds > 0 ? totalApiCalls / timeDifferenceSeconds : 0;

    return {
      averageResponseTime,
      p95ResponseTime: responseTimes[p95Index] || 0,
      p99ResponseTime: responseTimes[p99Index] || 0,
      errorRate,
      throughput,
    };
  }

  /**
   * Clean up old metrics (for data retention)
   */
  async cleanupOldMetrics(
    tenantContext: TenantContext,
    retentionDays: number
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // This would typically be done as a bulk operation
    // For now, we'll just count what would be deleted
    const query: SqlQuerySpec = {
      query: `
        SELECT VALUE COUNT(1) FROM c 
        WHERE c.tenantId = @tenantId 
          AND c.timestamp < @cutoffDate
      `,
      parameters: [
        { name: '@tenantId', value: tenantContext.tenantId },
        { name: '@cutoffDate', value: cutoffDate.toISOString() },
      ],
    };

    const result = await this.cosmosClient.queryDocuments(query, tenantContext);
    const countToDelete = result[0] || 0;

    // In a real implementation, you would perform the actual deletion here
    console.log(`Would delete ${countToDelete} metrics older than ${cutoffDate}`);

    return countToDelete;
  }

  /**
   * Record common platform metrics
   */
  async recordPlatformMetrics(
    tenantContext: TenantContext,
    metrics: {
      documentProcessed?: { documentId: string; userId: string; processingTime: number };
      conversationCreated?: { conversationId: string; userId: string };
      vectorSearch?: { query: string; resultCount: number; responseTime: number };
      apiCall?: { endpoint: string; method: string; responseTime: number; statusCode: number };
      error?: { service: string; errorType: string; userId?: string };
    }
  ): Promise<void> {
    const metricsToRecord: Omit<AnalyticsMetric, 'id' | 'timestamp' | 'tenantId'>[] = [];

    if (metrics.documentProcessed) {
      metricsToRecord.push({
        metric_type: 'document.processed',
        value: 1,
        dimensions: {
          documentId: metrics.documentProcessed.documentId,
          userId: metrics.documentProcessed.userId,
        },
      });

      metricsToRecord.push({
        metric_type: 'processing.time',
        value: metrics.documentProcessed.processingTime,
        dimensions: {
          documentId: metrics.documentProcessed.documentId,
          userId: metrics.documentProcessed.userId,
        },
      });
    }

    if (metrics.conversationCreated) {
      metricsToRecord.push({
        metric_type: 'conversation.created',
        value: 1,
        dimensions: {
          conversationId: metrics.conversationCreated.conversationId,
          userId: metrics.conversationCreated.userId,
        },
      });
    }

    if (metrics.vectorSearch) {
      metricsToRecord.push({
        metric_type: 'vector.search',
        value: 1,
        dimensions: {
          resultCount: metrics.vectorSearch.resultCount.toString(),
        },
      });

      metricsToRecord.push({
        metric_type: 'response.time',
        value: metrics.vectorSearch.responseTime,
        dimensions: {
          operation: 'vector.search',
        },
      });
    }

    if (metrics.apiCall) {
      metricsToRecord.push({
        metric_type: 'api.call',
        value: 1,
        dimensions: {
          endpoint: metrics.apiCall.endpoint,
          method: metrics.apiCall.method,
          statusCode: metrics.apiCall.statusCode.toString(),
        },
      });

      metricsToRecord.push({
        metric_type: 'response.time',
        value: metrics.apiCall.responseTime,
        dimensions: {
          endpoint: metrics.apiCall.endpoint,
          method: metrics.apiCall.method,
        },
      });
    }

    if (metrics.error) {
      metricsToRecord.push({
        metric_type: 'error.count',
        value: 1,
        dimensions: {
          service: metrics.error.service,
          errorType: metrics.error.errorType,
          userId: metrics.error.userId,
        },
      });
    }

    if (metricsToRecord.length > 0) {
      await this.recordMetricsBatch(metricsToRecord, tenantContext);
    }
  }
}
