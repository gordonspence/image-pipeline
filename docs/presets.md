# Presets

Both presets allow still JPEG/PNG/WebP inputs up to 10,000,000 bytes, 40,000,000 pixels and 12,000 pixels on either axis. Both require a square crop. Byte limits use decimal MB.

| Preset | Display | Thumbnail |
| --- | --- | --- |
| `avatar()` | 600 × 600 WebP, quality 82, max 500 KB | 160 × 160 WebP, quality 75, max 75 KB |
| `product()` | 1200 × 1200 WebP, quality 82, max 1 MB | 160 × 160 WebP, quality 75, max 75 KB |

Functions return fresh objects. Override them on the server:

```ts
const policy = product();
policy.aspect = 4 / 5;
policy.outputs.display.width = 640;
policy.outputs.display.height = 800;
policy.outputs.thumbnail.width = 128;
policy.outputs.thumbnail.height = 160;
```

All output ratios must match the crop aspect. v0 resizes the selected crop; it does not offer a product canvas/contain mode or automatic polish. Those can be extracted from ATG after their framing rules are represented explicitly in the contract.

JPEG/WebP quality can fall to 68, 54 and 40 (never exceeding the requested quality) to fit the byte budget. PNG is encoded losslessly once. If no attempt fits, processing fails. Dimensions can upscale small inputs; use your application guidance or add a minimum-resolution policy if quality matters.
