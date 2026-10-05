import { resolve } from "node:path";
import { avatar } from "../../../../../src/core/presets/avatar";
import { ImagePipelineError } from "../../../../../src/core/errors";
import { processImage } from "../../../../../src/sharp/process-image";
import { filesystemStorage } from "../../../../../src/storage/filesystem";
import { persistImage } from "../../../../../src/storage/persist-image";
export const runtime = "nodejs";
const policy = avatar();
const maxRequestBytes = policy.input.maxBytes + 64_000;
export async function POST(request: Request) {
  // Replace this local-only gate with real authentication + resource authorization.
  const url = new URL(request.url);
  // Next may use localhost in its internal URL even for an incoming 127.0.0.1 Host.
  const incomingUrl = new URL(url.origin);
  incomingUrl.host = request.headers.get("host") ?? url.host;
  if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1"].includes(incomingUrl.hostname)) {
    return Response.json({ error: "This example accepts local development uploads only." }, { status: 403 });
  }
  if (request.headers.get("origin") !== incomingUrl.origin) return Response.json({ error: "Invalid upload origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return Response.json({ error: "Send a multipart upload." }, { status: 415 });
  // Enforce actual streamed bytes before multipart parsing, including chunked requests.
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Missing upload." }, { status: 400 });
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxRequestBytes) { await reader.cancel(); return Response.json({ error: "The upload is too large." }, { status: 413 }); }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const form = await new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type")! }, body }).formData();
    const image = form.get("image"); const editText = form.get("edit");
    if (!(image instanceof File) || typeof editText !== "string" || editText.length > 4096) return Response.json({ error: "Missing image or crop." }, { status: 400 });
    const edit = JSON.parse(editText);
    const result = await processImage(new Uint8Array(await image.arrayBuffer()), { preset: policy, edit });
    const storage = filesystemStorage(resolve(process.cwd(), "public/uploads"), "/uploads");
    const asset = await persistImage(result, storage);
    return Response.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof ImagePipelineError) {
      if (error.code === "STORAGE_FAILED") console.error(error);
      return Response.json({ error: error.message, code: error.code }, { status: error.code === "STORAGE_FAILED" ? 500 : 422 });
    }
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
  } finally { reader.releaseLock(); }
}
