import test from "node:test";
import assert from "node:assert/strict";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Storage } from "../src/storage/s3";
test("S3 adapter sends immutable writes with content type and deletes the same key", async () => {
  const commands: (PutObjectCommand | DeleteObjectCommand)[] = [];
  const client = { async send(command: PutObjectCommand | DeleteObjectCommand) { commands.push(command); return {}; } } as unknown as S3Client;
  const storage = s3Storage(client, "photos", "https://images.example/");
  assert.equal((await storage.put("id/display.webp", new Uint8Array([1]), "image/webp")).url, "https://images.example/id/display.webp");
  await storage.delete("id/display.webp");
  assert.ok(commands[0] instanceof PutObjectCommand);
  assert.equal(commands[0].input.ContentType, "image/webp");
  assert.equal(commands[0].input.IfNoneMatch, "*");
  assert.ok(commands[1] instanceof DeleteObjectCommand);
  assert.equal(commands[1].input.Key, "id/display.webp");
});
