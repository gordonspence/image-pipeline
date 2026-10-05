import sharp from "sharp";
import { cropToPixels } from "../core/crop";
import { ImagePipelineError } from "../core/errors";
import { validatePolicy } from "../core/policy";
import type { EditInstructions, ImagePolicy, ProcessedImage } from "../core/types";
import { inspect } from "./inspect";
import { encode } from "./encode";
export async function processImage(input: Uint8Array, options: { preset: ImagePolicy; edit: EditInstructions }): Promise<ProcessedImage> {
  const { preset, edit } = options;
  validatePolicy(preset);
  const dimensions = await inspect(input, preset);
  const crop = cropToPixels(edit?.crop, dimensions.width, dimensions.height, preset.aspect);
  try {
    // Materialize orientation before extraction: crop coordinates use oriented pixels.
    const oriented = await sharp(input, { failOn: "warning", limitInputPixels: preset.input.maxPixels })
      .autoOrient().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
    const base = sharp(oriented.data, { raw: oriented.info }).extract(crop);
    const variants: ProcessedImage["variants"] = {};
    // Sequential variants keep per-upload peak memory bounded.
    for (const [name, policy] of Object.entries(preset.outputs)) {
      variants[name] = await encode(base.clone().resize(policy.width, policy.height, { fit: "fill" }), policy);
    }
    return { variants };
  } catch (error) {
    if (error instanceof ImagePipelineError) throw error;
    throw new ImagePipelineError("INVALID_IMAGE", "Could not process that image.", { cause: error });
  }
}
