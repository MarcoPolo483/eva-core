/**
 * EVA Analytics Repository
 * Repository for metrics, usage analytics, and performance monitoring
 */
import { EvaCosmosClient, AnalyticsMetric, TenantContext } from '../cosmos-client.js';
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
    throughput: number;
}
/**
 * Repository for analytics and metrics operations
 */
export declare class EvaAnalyticsRepository {
    private cosmosClient;
    constructor(cosmosClient: EvaCosmosClient);
    /**
     * Record a metric event
     */
    recordMetric(metric: Omit<AnalyticsMetric, 'id' | 'timestamp' | 'tenantId'>, tenantContext: TenantContext): Promise<void>;
    /**
     * Record multiple metrics in batch for performance
     */
    recordMetricsBatch(metrics: Omit<AnalyticsMetric, 'id' | 'timestamp' | 'tenantId'>[], tenantContext: TenantContext): Promise<void>;
    /**
     * Get metrics for a specific type and time range
     */
    getMetrics(metricType: string, tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }, dimensions?: Record<string, string>): Promise<AnalyticsMetric[]>;
    /**
     * Get aggregated metrics for dashboard display
     */
    getMetricAggregation(metricType: string, tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }, dimensions?: Record<string, string>): Promise<MetricAggregation>;
    /**
     * Get time series data for trending analysis
     */
    getTimeSeriesData(metricType: string, tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }, interval?: 'hour' | 'day' | 'week' | 'month', dimensions?: Record<string, string>): Promise<TimeSeriesData[]>;
    /**
     * Generate comprehensive usage report
     */
    generateUsageReport(tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }): Promise<UsageReport>;
    /**
     * Get performance metrics for system monitoring
     */
    getPerformanceMetrics(tenantContext: TenantContext, dateRange: {
        start: Date;
        end: Date;
    }, service?: string): Promise<PerformanceMetrics>;
    /**
     * Clean up old metrics (for data retention)
     */
    cleanupOldMetrics(tenantContext: TenantContext, retentionDays: number): Promise<number>;
    /**
     * Record common platform metrics
     */
    recordPlatformMetrics(tenantContext: TenantContext, metrics: {
        documentProcessed?: {
            documentId: string;
            userId: string;
            processingTime: number;
        };
        conversationCreated?: {
            conversationId: string;
            userId: string;
        };
        vectorSearch?: {
            query: string;
            resultCount: number;
            responseTime: number;
        };
        apiCall?: {
            endpoint: string;
            method: string;
            responseTime: number;
            statusCode: number;
        };
        error?: {
            service: string;
            errorType: string;
            userId?: string;
        };
    }): Promise<void>;
}
//# sourceMappingURL=analytics-repository.d.ts.map