# Architecture

```text
React selection + crop
    → application upload callback
    → application authentication and resource authorization
    → bounded body parsing
    → Sharp inspection + oriented crop + output encoding
    → storage adapter
    → application database update
```

Core has no framework dependencies. React imports core types only. Sharp is a Node.js module. Storage depends on the processed output contract, not Sharp. Filesystem and S3 adapters are imported directly so applications do not load unused SDKs.

The browser chooses a rectangle; the server chooses input limits and output policies. The processor receives bytes, not paths or URLs. It accepts no arbitrary transformations from the request and does not retain originals.

Orientation is materialized once as raw pixels to make extraction order explicit. Outputs are processed sequentially, reducing simultaneous work per request. This still needs deployment-level concurrency and memory limits; a 40-million-pixel decoded image is significantly larger than its compressed upload.

The upload hook exposes an AbortSignal to the consuming transport. Cancellation stops waiting for the result; it is not a guarantee that server processing or storage was rolled back. Upload completion and database association are separate operations owned by the app.

There is no abstract processor plugin system in v0. Introduce one only when a second processing implementation establishes its requirements. Sharp does not run in a standard Cloudflare Worker; using R2 storage does not make the processor Worker-compatible.
