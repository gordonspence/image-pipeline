import type { Sharp } from "sharp";
import { ImagePipelineError } from "../core/errors";
import type { ImageVariant, OutputPolicy } from "../core/types";
export async function encode(image: Sharp, policy: OutputPolicy): Promise<ImageVariant> {
  const qualities = [...new Set([policy.quality, Math.min(policy.quality, 68), Math.min(policy.quality, 54), Math.min(policy.quality, 40)])];
  for (const quality of qualities) {
    let output = image.clone();
    if (policy.format === "jpeg") output = output.flatten({ background: "white" }).jpeg({ quality });
    else if (policy.format === "png") output = output.png();
    else output = output.webp({ quality, effort: 4 });
    const { data, info } = await output.toBuffer({ resolveWithObject: true });
    if (data.byteLength <= policy.maxBytes) return {
      data, bytes: data.byteLength, width: info.width, height: info.height, format: policy.format,
      contentType: `image/${policy.format}`,
    };
    if (policy.format === "png") break;
  }
  throw new ImagePipelineError("OUTPUT_LIMIT", "The image could not fit the output size limit.");
}
