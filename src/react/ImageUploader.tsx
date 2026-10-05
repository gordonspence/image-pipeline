"use client";
import { useId, useState } from "react";
import type { StoredAsset } from "../core/types";
import { ImageCropper } from "./ImageCropper";
import { useImageUpload, type UploadHandler } from "./useImageUpload";
export type ImageUploaderProps = { aspect?: number; maxBytes?: number; onUpload: UploadHandler; onComplete?: (asset: StoredAsset) => void };
export function ImageUploader({ aspect = 1, maxBytes = 10_000_000, onUpload, onComplete }: ImageUploaderProps) {
  const id = useId();
  const flow = useImageUpload(onUpload, maxBytes);
  const [saved, setSaved] = useState(false);
  async function submit() {
    const asset = await flow.upload();
    if (asset) { setSaved(true); flow.reset(); onComplete?.(asset); }
  }
  return <section className="ip-uploader" aria-label="Image upload" aria-busy={flow.busy}>
    <label htmlFor={id}>Choose a photo</label>
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={flow.busy}
      onChange={event => { const file = event.target.files?.[0]; if (file) { setSaved(false); flow.select(file); } event.target.value = ""; }} />
    <p className="ip-hint">JPEG, PNG or WebP. Up to {Math.round(maxBytes / 1_000_000)} MB.</p>
    {flow.preview ? <>
      <ImageCropper key={flow.preview} image={flow.preview} aspect={aspect} onCropChange={flow.setCrop} onError={flow.previewError} disabled={flow.busy} />
      <div className="ip-actions">
        <button type="button" disabled={flow.busy || !flow.crop || flow.crop.width <= 0} onClick={() => void submit()}>{flow.busy ? "Uploading…" : "Upload photo"}</button>
        {flow.busy ? <button type="button" onClick={flow.cancel}>Cancel upload</button> : <button type="button" onClick={flow.reset}>Discard</button>}
      </div>
    </> : null}
    {flow.error ? <p role="alert" className="ip-error">{flow.error}</p> : null}
    <p role="status">{saved ? "Photo uploaded." : ""}</p>
  </section>;
}
