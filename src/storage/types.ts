export interface ImageStorage {
  /** Must use immutable unique keys. Failed puts may have written an object. */
  put(key: string, data: Uint8Array, contentType: string): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}
