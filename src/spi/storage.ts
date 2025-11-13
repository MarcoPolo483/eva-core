export interface KeyValue {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface BlobStore {
  put(path: string, content: Uint8Array | string, contentType?: string): Promise<void>;
  get(path: string): Promise<Uint8Array | undefined>;
  delete(path: string): Promise<void>;
}