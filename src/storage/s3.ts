import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { ImageStorage } from "./types";
/** Supply an S3Client with your own region, endpoint and credentials (including R2). */
export function s3Storage(client: S3Client, bucket: string, publicBaseUrl: string): ImageStorage {
  return {
    async put(key, data, contentType) {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: contentType, IfNoneMatch: "*" }));
      return { url: `${publicBaseUrl.replace(/\/$/, "")}/${key}` };
    },
    async delete(key) { await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })); },
  };
}
