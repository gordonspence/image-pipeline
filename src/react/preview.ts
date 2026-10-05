export function validateSelection(file: File, maxBytes: number): void {
  if (!file.size || file.size > maxBytes) throw new Error(`Choose an image smaller than ${Math.round(maxBytes / 1_000_000)} MB.`);
  // This is a UX check. The server inspects actual bytes.
  if (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choose a JPEG, PNG or WebP image.");
}
