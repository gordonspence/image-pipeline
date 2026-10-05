# Image pipeline

A downloadable TypeScript toolkit for React image uploads. Select and crop in the browser; validate, orient, resize and encode with Sharp on your own server; save through your own storage.

This repository runs inside your project. There is no hosted service, account or external processing API. It is a reference implementation with source modules to copy and adapt, not a published npm package.

## Try the local example

Requires Node.js 22 or newer and npm. Sharp requires a supported native runtime.

```sh
npm install
npm test
npm run typecheck
npm run dev
```

Open http://127.0.0.1:3000. The Next.js example saves public display images and thumbnails under `examples/nextjs/public/uploads`. It accepts local development uploads only and refuses production uploads. Nothing is uploaded to a third-party service.

If port 3000 is occupied, choose another with `npm run dev --workspace examples/nextjs -- --port 3307`.

## Add it to an existing project

1. Copy `src/core` and `src/sharp` into your application. Install `sharp`.
2. Copy `src/react` if you want the default uploader or crop controls. Install `react-easy-crop` and import `react/styles.css` once.
3. Copy `src/storage/types.ts`, `persist-image.ts`, and the adapter you need. The S3/R2 adapter additionally needs `@aws-sdk/client-s3`.
4. Add an authenticated upload endpoint using the [example route](examples/nextjs/app/api/upload/route.ts) as a reference. Choose policies on the server and authorize the resource before reading or processing the body.
5. Save returned variant metadata in your existing database.

Server integration, after parsing a bounded upload and authorizing the user:

```ts
import { avatar } from "./image-pipeline/core/presets/avatar";
import { processImage } from "./image-pipeline/sharp/process-image";
import { persistImage } from "./image-pipeline/storage/persist-image";
import { filesystemStorage } from "./image-pipeline/storage/filesystem";

const processed = await processImage(bytes, { preset: avatar(), edit });
const storage = filesystemStorage("./public/uploads", "/uploads");
const asset = await persistImage(processed, storage);
// Save asset in your application. It contains URLs, keys, dimensions and byte sizes.
```

Client integration:

```tsx
<ImageUploader
  aspect={1}
  onUpload={async ({ file, edit, signal }) => {
    const body = new FormData();
    body.set("image", file);
    body.set("edit", JSON.stringify(edit));
    const response = await fetch("/api/photos", { method: "POST", body, signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Upload failed.");
    return result;
  }}
  onComplete={asset => savePhotoToForm(asset)}
/>
```

## What v0 includes

- React selection, preview, crop, zoom, upload state, cancellation and retry after errors.
- A normalized crop contract on the EXIF-oriented image.
- Still JPEG/PNG/WebP inputs; decoded format checks, byte/pixel/dimension limits, strict decoding and metadata stripping.
- Avatar and square product presets, with display and thumbnail outputs.
- Bounded quality fallback for JPEG/WebP output byte budgets; transparent PNG/WebP output support.
- Filesystem and S3-compatible storage, including R2; cleanup after partial failure.
- A local Next.js example, tests, and integration documentation.

Manual rotation, image polish, private editable source retention, galleries, database models and durable idempotency are not implemented in v0. Do not treat random filenames as authorization or retry deduplication.

## Modules

| Directory | Purpose |
| --- | --- |
| `src/core` | Framework-independent contracts, crop rules, errors and policies |
| `src/react` | Browser components and upload hook |
| `src/sharp` | Node.js image inspection and processing |
| `src/storage` | Node.js persistence and optional adapters |
| `examples/nextjs` | Runnable local integration |

Use module-specific imports. There is no root barrel that can pull Sharp into a browser bundle. The example is an npm workspace for local convenience; source modules are not separate packages.

Read [integration](docs/integration.md), [crop contract](docs/crop-contract.md), [security](docs/security.md), [storage](docs/storage.md), [presets](docs/presets.md), [architecture](docs/architecture.md), and the [extraction map](docs/extraction-map.md).

## Validation

```sh
npm test
npm run typecheck
npm run build:example
```

Tests generate small image fixtures in memory, including orientation, transparency, malformed data and animation. No user photos are committed.

The existing [idea document](docs/reusable-image-upload-pipeline.md) is a proposal. This README describes the implemented scope.
