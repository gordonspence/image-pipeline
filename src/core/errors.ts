export class ImagePipelineError extends Error {
  constructor(public readonly code: "INVALID_POLICY" | "INVALID_CROP" | "INVALID_IMAGE" | "INPUT_LIMIT" | "OUTPUT_LIMIT" | "STORAGE_FAILED", message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ImagePipelineError";
  }
}
