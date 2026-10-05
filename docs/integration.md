# Integration

Copy the modules into a directory in your application, preserving their relative layout. Keep source imports separate: React components in client files, Sharp and storage only in server files. React and react-dom belong to the host app; no styling framework is required.

For Next.js App Router, use a Node.js route handler. Set `runtime = "nodejs"`; keep Sharp external to the server bundle if required by the framework. The reference example demonstrates multipart handling. For Astro with a Node adapter, use the same processor in a server endpoint and hydrate the React component as an island. These frameworks do not need their own processor implementations.

Your endpoint must authenticate the caller, authorize the target resource, apply CSRF/origin protection appropriate to the authentication method, enforce body and processing limits, select a server preset, and parse a small edit payload. Never accept the entire output policy from the browser.

`onUpload` receives `{ file, edit, signal }` and resolves to a `StoredAsset`. Use the signal in fetch. Failures should throw a concise Error for the uploader. Selection and crop remain available after failure. The hook prevents overlapping uploads within one component instance. The default UI shows pending state, not byte-level progress. Use `useImageUpload` with your own transport/UI if you need upload progress.

`onComplete` gives the form the saved asset. Persist its metadata using your own model. If that database operation fails after storage succeeds, clean up the returned keys or arrange reconciliation. Only delete replaced assets after the new association commits.

Durable retries are an application concern in v0: associate a stable request ID with the authenticated owner, source/edit/preset identity, and saved result. Replaying the same ID should return the committed result; changing its payload should conflict. A retry of `persistImage` by itself creates a new asset. Do not reuse an asset ID across different owners.

The local example intentionally has no accounts and refuses production uploads. Replace the local gate with application authorization before adapting it for deployment. The repository itself requires no service registration, tokens or hosting.
