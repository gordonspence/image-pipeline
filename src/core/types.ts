export type ImageFormat = "jpeg" | "png" | "webp";
/** Fractions of the EXIF-oriented image. Manual rotation is not supported in v0. */
export type Crop = { x: number; y: number; width: number; height: number };
export type EditInstructions = { crop: Crop };
export type OutputPolicy = {
  width: number;
  height: number;
  format: ImageFormat;
  quality: number;
  maxBytes: number;
};
export type ImagePolicy = {
  input: { maxBytes: number; maxPixels: number; maxDimension: number; allowedFormats: ImageFormat[] };
  aspect: number;
  outputs: Record<string, OutputPolicy>;
};
export type ImageVariant = {
  data: Uint8Array;
  width: number;
  height: number;
  bytes: number;
  format: ImageFormat;
  contentType: string;
};
export type ProcessedImage = { variants: Record<string, ImageVariant> };
export type StoredAsset = {
  id: string;
  variants: Record<string, Omit<ImageVariant, "data"> & { key: string; url: string }>;
};
