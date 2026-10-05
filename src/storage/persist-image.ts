import { randomUUID } from "node:crypto";
import { ImagePipelineError } from "../core/errors";
import type { ProcessedImage, StoredAsset } from "../core/types";
import type { ImageStorage } from "./types";
export async function persistImage(image: ProcessedImage, storage: ImageStorage): Promise<StoredAsset> {
  const id = randomUUID();
  const asset: StoredAsset = { id, variants: {} };
  const attempted: string[] = [];
  try {
    for (const [name, variant] of Object.entries(image.variants)) {
      if (!/^[a-z][a-z0-9-]{0,39}$/.test(name)) throw new Error("Invalid variant name");
      const key = `${id}/${name}.${variant.format}`;
      attempted.push(key);
      const { url } = await storage.put(key, variant.data, variant.contentType);
      const { data: _data, ...metadata } = variant;
      asset.variants[name] = { ...metadata, key, url };
    }
    return asset;
  } catch (error) {
    const cleanup = await Promise.allSettled(attempted.map(key => storage.delete(key)));
    throw new ImagePipelineError("STORAGE_FAILED", "Could not save the image.", {
      cause: { error, cleanupFailures: cleanup.flatMap((r, i) => r.status === "rejected" ? [{ key: attempted[i], error: r.reason }] : []) },
    });
  }
}
