import { ImagePipelineError } from "./errors";
import type { Crop } from "./types";

export function validateCrop(value: unknown): Crop {
  const crop = value as Crop | null;
  if (!crop || ![crop.x, crop.y, crop.width, crop.height].every(v => typeof v === "number" && Number.isFinite(v)) ||
    crop.x < 0 || crop.y < 0 || crop.width <= 0 || crop.height <= 0 ||
    crop.x + crop.width > 1.000001 || crop.y + crop.height > 1.000001) {
    throw new ImagePipelineError("INVALID_CROP", "Choose a crop inside the image.");
  }
  return { x: crop.x, y: crop.y, width: crop.width, height: crop.height };
}

export function cropToPixels(value: unknown, width: number, height: number, aspect: number) {
  const crop = validateCrop(value);
  const actualAspect = crop.width * width / (crop.height * height);
  if (Math.abs(actualAspect / aspect - 1) > 0.02) {
    throw new ImagePipelineError("INVALID_CROP", "The crop does not match the required shape.");
  }
  const left = Math.min(width - 1, Math.round(crop.x * width));
  const top = Math.min(height - 1, Math.round(crop.y * height));
  return {
    left, top,
    width: Math.max(1, Math.min(width - left, Math.round(crop.width * width))),
    height: Math.max(1, Math.min(height - top, Math.round(crop.height * height))),
  };
}
