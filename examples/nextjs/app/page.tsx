"use client";
import { useState } from "react";
import { ImageUploader } from "../../../src/react/ImageUploader";
import type { StoredAsset } from "../../../src/core/types";
import type { UploadRequest } from "../../../src/react/useImageUpload";
async function upload({ file, edit, signal }: UploadRequest): Promise<StoredAsset> {
  const body = new FormData(); body.set("image", file); body.set("edit", JSON.stringify(edit));
  const response = await fetch("/api/upload", { method: "POST", body, signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Could not upload that image.");
  return result;
}
export default function Page() {
  const [asset, setAsset] = useState<StoredAsset | null>(null);
  return <main>
    <p className="eyebrow">Image pipeline / local example</p>
    <h1>A photo, ready for your app.</h1>
    <p className="intro">Choose a photo and frame it. The server validates the original and creates a display image and thumbnail.</p>
    <ImageUploader onUpload={upload} onComplete={setAsset} />
    {asset ? <section className="results" aria-label="Processed images"><h2>Saved variants</h2>
      {Object.entries(asset.variants).map(([name, variant]) => <figure key={name}>
        <img src={variant.url} width={variant.width} height={variant.height} alt={`Uploaded photo: ${name}`} />
        <figcaption>{name} · {variant.width} × {variant.height} · {(variant.bytes / 1000).toFixed(1)} KB</figcaption>
      </figure>)}
    </section> : null}
    <footer>Local demonstration. Connect your own authorization and storage before using this in an application.</footer>
  </main>;
}
