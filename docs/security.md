# Security boundaries

The processor accepts byte arrays only. It checks compressed input size before inspection, recognizes the format through Sharp, checks dimensions and frame count, applies a pixel limit during inspection and decoding, and fully decodes with strict failure handling. It rejects SVG and formats outside the server allowlist. It re-encodes outputs from oriented raw pixels without retaining input metadata.

Supported inputs are still JPEG, PNG and WebP. Input MIME types and filename extensions are browser hints, not server evidence. JPEG output is flattened onto white; PNG and WebP preserve transparency. Animated inputs are rejected rather than reduced silently to their first frame.

Output dimensions, names, quality and byte budgets are server policy. A bounded encoding fallback either produces an asset within the budget or returns OUTPUT_LIMIT. PNG has one lossless encoding attempt. Pixel limits are defense in depth, not a process isolation guarantee: native decoders still handle untrusted data.

Applications supply:

- Authentication and owner/resource authorization, before expensive work.
- CSRF protection, rate limits, per-owner quotas and bounded concurrent processing.
- Streaming request byte limits before multipart parsing, plus ingress timeouts and memory/CPU limits.
- Updated Sharp/libvips and storage SDK dependencies.
- Storage credentials with narrowly scoped access; safe public delivery of finished outputs.
- Private access controls and retention/deletion policy if originals are stored separately.
- Cleanup/reconciliation for abandoned uploads, failed database commits and interrupted requests.

The example demonstrates streamed byte limits and same-origin local requests. It is a developer example, not an internet-ready upload endpoint. Its storage folder must be application-controlled and must not contain attacker-managed symlinks. Production deployments should choose durable object storage.

Useful primary references: [Sharp security](https://sharp.pixelplumbing.com/security/), [Sharp constructor limits](https://sharp.pixelplumbing.com/api-constructor/), [Sharp output metadata](https://sharp.pixelplumbing.com/api-output/).
