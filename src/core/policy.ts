import { ImagePipelineError } from "./errors";
import type { ImagePolicy } from "./types";
export function validatePolicy(policy: ImagePolicy): void {
  const positive = (n: number) => Number.isSafeInteger(n) && n > 0;
  const outputs = Object.entries(policy.outputs);
  if (!positive(policy.input.maxBytes) || !positive(policy.input.maxPixels) || !positive(policy.input.maxDimension) ||
    !Number.isFinite(policy.aspect) || policy.aspect <= 0 || !policy.input.allowedFormats.length ||
    policy.input.allowedFormats.some(f => !["jpeg", "png", "webp"].includes(f)) || outputs.length < 1 || outputs.length > 8 ||
    outputs.some(([name, o]) => !/^[a-z][a-z0-9-]{0,39}$/.test(name) || !positive(o.width) || !positive(o.height) ||
      o.width * o.height > policy.input.maxPixels || !positive(o.maxBytes) || !positive(o.quality) || o.quality > 100 ||
      !["jpeg", "png", "webp"].includes(o.format) || Math.abs(o.width / o.height / policy.aspect - 1) > 0.02)) {
    throw new ImagePipelineError("INVALID_POLICY", "The image policy is invalid.");
  }
}
