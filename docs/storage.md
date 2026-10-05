# Storage

`ImageStorage` has `put(key, bytes, contentType)` and `delete(key)`. A put returns a URL. Store immutable objects; adapters must throw on failure. The persistence function creates a UUID directory and uses validated variant names and encoded formats for keys. It returns metadata without image buffers.

The filesystem adapter uses exclusive file creation and validates keys and resolved paths. Use an application-owned root. Its public URL prefix must map to that root. The example uses Next.js public uploads for development only; this is not durable serverless storage.

S3-compatible storage, including R2:

```ts
import { S3Client } from "@aws-sdk/client-s3";
import { s3Storage } from "./image-pipeline/storage/s3";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const storage = s3Storage(client, process.env.R2_BUCKET!, process.env.IMAGE_PUBLIC_URL!);
```

The adapter writes content types and uses conditional creation. Configure the bucket and public delivery URL yourself. No buckets, domains or credentials are provisioned by this toolkit. S3/R2 credentials stay on the server.

If any variant fails to save, persistence attempts to delete all attempted keys, including the failed write's key. Cleanup is best effort. STORAGE_FAILED includes the original error and any cleanup failures in its cause for server-side logging. Do not expose that cause to clients. Interrupted processes still require orphan reconciliation.

v0 stores finished public variants only. Private editable sources need a separate private bucket or prefix protected by real access controls, an owner-checked download route, and a retention policy. A public URL cannot become private just because the application hides it.
