import { mkdir, writeFile, rm } from "node:fs/promises";
import { resolve, sep, dirname } from "node:path";
import type { ImageStorage } from "./types";
export function filesystemStorage(root: string, publicBaseUrl: string): ImageStorage {
  const directory = resolve(root);
  function path(key: string) {
    if (!/^[a-zA-Z0-9/-]+\.(webp|jpeg|png)$/.test(key)) throw new Error("Invalid storage key");
    const target = resolve(directory, key);
    if (!target.startsWith(directory + sep)) throw new Error("Invalid storage path");
    return target;
  }
  return {
    async put(key, data) {
      const target = path(key);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, data, { flag: "wx" });
      return { url: `${publicBaseUrl.replace(/\/$/, "")}/${key}` };
    },
    async delete(key) { await rm(path(key), { force: true }); },
  };
}
