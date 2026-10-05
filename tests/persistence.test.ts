import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { persistImage } from "../src/storage/persist-image";
import { filesystemStorage } from "../src/storage/filesystem";
import type { ProcessedImage } from "../src/core/types";
const variant = { data: new Uint8Array([1, 2]), bytes: 2, width: 1, height: 1, format: "webp" as const, contentType: "image/webp" };
const image: ProcessedImage = { variants: { display: variant, thumbnail: variant } };
test("a failed put cleans both prior and potentially partially written objects", async () => {
  const writes: string[] = []; const deleted: string[] = [];
  await assert.rejects(persistImage(image, {
    async put(key) { writes.push(key); if (writes.length === 2) throw new Error("connection lost"); return { url: key }; },
    async delete(key) { deleted.push(key); },
  }), { code: "STORAGE_FAILED" });
  assert.deepEqual(deleted.sort(), writes.sort());
});
test("filesystem writes unique asset directories and exposes no image buffers", async () => {
  const root = await mkdtemp(join(tmpdir(), "image-pipeline-"));
  try {
    const storage = filesystemStorage(root, "/uploads");
    const first = await persistImage(image, storage); const second = await persistImage(image, storage);
    assert.notEqual(first.id, second.id);
    assert.equal("data" in first.variants.display, false);
    assert.deepEqual([...await readFile(join(root, first.variants.display.key))], [1, 2]);
    assert.equal(first.variants.display.url, `/uploads/${first.id}/display.webp`);
    await assert.rejects(storage.put("../escape.webp", variant.data, variant.contentType));
    await assert.rejects(storage.put(first.variants.display.key, variant.data, variant.contentType));
  } finally { await rm(root, { recursive: true, force: true }); }
});
