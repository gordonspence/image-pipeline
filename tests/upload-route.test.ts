import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../examples/nextjs/app/api/upload/route";
test("example rejects missing origin, external hosts, and production uploads", async () => {
  assert.equal((await POST(new Request("http://127.0.0.1:3307/api/upload", { method: "POST" }))).status, 403);
  assert.equal((await POST(new Request("https://example.com/api/upload", { method: "POST", headers: { origin: "https://example.com" } }))).status, 403);
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.equal((await POST(new Request("http://127.0.0.1:3307/api/upload", { method: "POST", headers: { origin: "http://127.0.0.1:3307" } }))).status, 403);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test("example bounds the actual body before parsing multipart", async () => {
  const request = new Request("http://127.0.0.1:3307/api/upload", { method: "POST", headers: { origin: "http://127.0.0.1:3307", "content-type": "multipart/form-data; boundary=test" }, body: new Uint8Array(10_064_001) });
  assert.equal((await POST(request)).status, 413);
});
test("same-origin check uses the validated incoming Host when Next normalizes its internal URL", async () => {
  const headers = { host: "127.0.0.1:3307", origin: "http://127.0.0.1:3307", "content-type": "text/plain" };
  assert.equal((await POST(new Request("http://localhost:3307/api/upload", { method: "POST", headers, body: "test" }))).status, 415);
  assert.equal((await POST(new Request("http://localhost:3307/api/upload", { method: "POST", headers: { ...headers, origin: "http://localhost:3307" }, body: "test" }))).status, 403);
  assert.equal((await POST(new Request("http://localhost:3307/api/upload", { method: "POST", headers: { ...headers, host: "external.example", origin: "http://external.example" }, body: "test" }))).status, 403);
});
test("example rejects missing crop data and malformed JSON", async () => {
  for (const edit of [null, "{invalid"]) {
    const body = new FormData(); body.set("image", new File(["fake"], "photo.png", { type: "image/png" }));
    if (edit) body.set("edit", edit);
    const response = await POST(new Request("http://127.0.0.1:3307/api/upload", { method: "POST", headers: { origin: "http://127.0.0.1:3307" }, body }));
    assert.equal(response.status, 400);
  }
});
