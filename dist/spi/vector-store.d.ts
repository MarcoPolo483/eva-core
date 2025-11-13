export type Vector = number[];
export type Doc = {
    id: string;
    text: string;
    metadata?: Record<string, unknown>;
};
export interface VectorStore {
    upsert(items: {
        id: string;
        vector: Vector;
        metadata?: Record<string, unknown>;
    }[]): Promise<void>;
    query(vector: Vector, k: number, filter?: Record<string, unknown>): Promise<{
        id: string;
        score: number;
        metadata?: Record<string, unknown>;
    }[]>;
}
//# sourceMappingURL=vector-store.d.ts.map