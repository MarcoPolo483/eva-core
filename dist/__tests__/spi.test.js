import { describe, it, expect, vi } from 'vitest';
import { NoopTelemetry } from '../spi/telemetry.js';
describe('SPI Interfaces - ChatModel', () => {
    it('should define ChatModel interface contract', () => {
        const mockModel = {
            name: 'test-model',
            generate: vi.fn().mockResolvedValue({
                messages: [{ role: 'assistant', content: 'test response' }],
                usage: { inputTokens: 10, outputTokens: 20, costUSD: 0.001 }
            })
        };
        expect(mockModel.name).toBe('test-model');
        expect(mockModel.generate).toBeDefined();
    });
    it('should handle tool calls in ChatResult', async () => {
        const mockModel = {
            name: 'tool-model',
            generate: vi.fn().mockResolvedValue({
                messages: [{ role: 'assistant', content: 'using tool' }],
                toolCalls: [{ id: 'call-1', name: 'search', arguments: '{}' }],
                usage: { inputTokens: 15, outputTokens: 25 }
            })
        };
        const messages = [{ role: 'user', content: 'search for info' }];
        const tools = [{ name: 'search', description: 'Search tool' }];
        const result = await mockModel.generate(messages, tools);
        expect(result.toolCalls).toHaveLength(1);
        expect(result.toolCalls?.[0].name).toBe('search');
    });
});
describe('SPI Interfaces - Storage', () => {
    it('should define KeyValue interface contract', async () => {
        const mockKV = {
            get: vi.fn().mockResolvedValue('test-value'),
            set: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn().mockResolvedValue(undefined)
        };
        await mockKV.set('key1', 'value1');
        const value = await mockKV.get('key1');
        await mockKV.delete('key1');
        expect(mockKV.set).toHaveBeenCalledWith('key1', 'value1');
        expect(value).toBe('test-value');
        expect(mockKV.delete).toHaveBeenCalledWith('key1');
    });
    it('should handle TTL in KeyValue.set', async () => {
        const mockKV = {
            get: vi.fn(),
            set: vi.fn().mockResolvedValue(undefined),
            delete: vi.fn()
        };
        await mockKV.set('session', { userId: '123' }, 3600);
        expect(mockKV.set).toHaveBeenCalledWith('session', { userId: '123' }, 3600);
    });
    it('should define BlobStore interface contract', async () => {
        const mockBlob = {
            put: vi.fn().mockResolvedValue(undefined),
            get: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
            delete: vi.fn().mockResolvedValue(undefined)
        };
        await mockBlob.put('file.txt', 'content', 'text/plain');
        const content = await mockBlob.get('file.txt');
        await mockBlob.delete('file.txt');
        expect(mockBlob.put).toHaveBeenCalledWith('file.txt', 'content', 'text/plain');
        expect(content).toBeInstanceOf(Uint8Array);
        expect(mockBlob.delete).toHaveBeenCalledWith('file.txt');
    });
});
describe('SPI Interfaces - Telemetry', () => {
    it('should use NoopTelemetry without errors', () => {
        expect(() => {
            NoopTelemetry.info('test message', { key: 'value' });
            NoopTelemetry.warn('warning', { code: 123 });
            NoopTelemetry.error('error', { stack: 'trace' });
        }).not.toThrow();
    });
    it('should execute startSpan with NoopTelemetry', async () => {
        const result = await NoopTelemetry.startSpan('test-span', async () => {
            return 'span-result';
        });
        expect(result).toBe('span-result');
    });
    it('should define Telemetry interface contract', () => {
        const mockTelemetry = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            startSpan: vi.fn().mockImplementation(async (_name, fn) => fn())
        };
        mockTelemetry.info('info', { attr: 1 });
        mockTelemetry.warn('warn');
        mockTelemetry.error('error', { code: 'E001' });
        expect(mockTelemetry.info).toHaveBeenCalledWith('info', { attr: 1 });
        expect(mockTelemetry.warn).toHaveBeenCalledWith('warn');
        expect(mockTelemetry.error).toHaveBeenCalledWith('error', { code: 'E001' });
    });
});
describe('SPI Interfaces - Embeddings', () => {
    it('should define EmbeddingProvider interface contract', async () => {
        const mockEmbeddings = {
            embed: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
            dimensions: 3
        };
        const vectors = await mockEmbeddings.embed(['test text']);
        expect(vectors).toHaveLength(1);
        expect(vectors[0]).toHaveLength(3);
        expect(mockEmbeddings.dimensions).toBe(3);
    });
    it('should handle multiple texts in embed', async () => {
        const mockEmbeddings = {
            embed: vi.fn().mockResolvedValue([
                [0.1, 0.2],
                [0.3, 0.4],
                [0.5, 0.6]
            ]),
            dimensions: 2
        };
        const vectors = await mockEmbeddings.embed(['text1', 'text2', 'text3']);
        expect(vectors).toHaveLength(3);
        expect(vectors[0]).toEqual([0.1, 0.2]);
        expect(vectors[2]).toEqual([0.5, 0.6]);
    });
});
describe('SPI Interfaces - VectorStore', () => {
    it('should define VectorStore interface contract', async () => {
        const mockVectorStore = {
            upsert: vi.fn().mockResolvedValue(undefined),
            search: vi.fn().mockResolvedValue([
                { id: 'doc1', score: 0.95, metadata: { title: 'Test' } }
            ]),
            delete: vi.fn().mockResolvedValue(undefined)
        };
        await mockVectorStore.upsert('doc1', [0.1, 0.2, 0.3], { title: 'Test' });
        const results = await mockVectorStore.search([0.1, 0.2, 0.3], 5);
        await mockVectorStore.delete('doc1');
        expect(mockVectorStore.upsert).toHaveBeenCalledWith('doc1', [0.1, 0.2, 0.3], { title: 'Test' });
        expect(results).toHaveLength(1);
        expect(results[0].score).toBe(0.95);
        expect(mockVectorStore.delete).toHaveBeenCalledWith('doc1');
    });
    it('should handle optional filter in vector search', async () => {
        const mockVectorStore = {
            upsert: vi.fn(),
            search: vi.fn().mockResolvedValue([
                { id: 'doc2', score: 0.88, metadata: { category: 'tech' } }
            ]),
            delete: vi.fn()
        };
        const results = await mockVectorStore.search([0.5, 0.6, 0.7], 10, { category: 'tech' });
        expect(mockVectorStore.search).toHaveBeenCalledWith([0.5, 0.6, 0.7], 10, { category: 'tech' });
        expect(results[0].metadata).toEqual({ category: 'tech' });
    });
    it('should validate VectorQueryResult structure', () => {
        const result = {
            id: 'test-id',
            score: 0.92,
            metadata: { source: 'test', timestamp: Date.now() }
        };
        expect(result.id).toBe('test-id');
        expect(result.score).toBeGreaterThan(0);
        expect(result.metadata).toBeDefined();
    });
});
//# sourceMappingURL=spi.test.js.map