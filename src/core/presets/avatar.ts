import type { ImagePolicy } from "../types";
export function avatar(): ImagePolicy {
  return {
    input: { maxBytes: 10_000_000, maxPixels: 40_000_000, maxDimension: 12000, allowedFormats: ["jpeg", "png", "webp"] },
    aspect: 1,
    outputs: {
      display: { width: 600, height: 600, format: "webp", quality: 82, maxBytes: 500_000 },
      thumbnail: { width: 160, height: 160, format: "webp", quality: 75, maxBytes: 75_000 },
    },
  };
}
