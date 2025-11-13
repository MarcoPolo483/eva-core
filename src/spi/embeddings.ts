export interface Embeddings {
  embed(texts: string[], options?: Record<string, unknown>): Promise<number[][]>;
  dimensions?: number;
}