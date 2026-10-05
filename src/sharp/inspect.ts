import sharp from "sharp";
import { ImagePipelineError } from "../core/errors";
import type { ImagePolicy } from "../core/types";
export async function inspect(input: Uint8Array, policy: ImagePolicy) {
  if (!input.byteLength || input.byteLength > policy.input.maxBytes) {
    throw new ImagePipelineError("INPUT_LIMIT", "The image exceeds the upload size limit.");
  }
  try {
    const meta = await sharp(input, { failOn: "warning", limitInputPixels: policy.input.maxPixels }).metadata();
    if (!meta.format || !policy.input.allowedFormats.includes(meta.format as "jpeg" | "png" | "webp") ||
      !meta.width || !meta.height || (meta.pages ?? 1) !== 1) {
      throw new ImagePipelineError("INVALID_IMAGE", "Use a still JPEG, PNG or WebP image.");
    }
    if (meta.width > policy.input.maxDimension || meta.height > policy.input.maxDimension || meta.width * meta.height > policy.input.maxPixels) {
      throw new ImagePipelineError("INPUT_LIMIT", "The image dimensions exceed the limit.");
    }
    const swap = [5, 6, 7, 8].includes(meta.orientation ?? 1);
    return { width: swap ? meta.height : meta.width, height: swap ? meta.width : meta.height };
  } catch (error) {
    if (error instanceof ImagePipelineError) throw error;
    throw new ImagePipelineError("INVALID_IMAGE", "Could not decode that image.", { cause: error });
  }
}
