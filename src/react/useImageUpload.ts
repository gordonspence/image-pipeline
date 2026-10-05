"use client";
import { useEffect, useRef, useState } from "react";
import type { Crop, StoredAsset } from "../core/types";
import { validateSelection } from "./preview";
export type UploadRequest = { file: File; edit: { crop: Crop }; signal: AbortSignal };
export type UploadHandler = (request: UploadRequest) => Promise<StoredAsset>;
export function useImageUpload(onUpload: UploadHandler, maxBytes = 10_000_000) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const previewRef = useRef<string | null>(null);
  useEffect(() => () => {
    active.current?.abort();
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);
  function select(next: File) {
    if (active.current) return;
    try {
      validateSelection(next, maxBytes);
      const url = URL.createObjectURL(next);
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = url;
      setFile(next); setPreview(url); setCrop(null); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not open that image."); }
  }
  function reset() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setFile(null); setPreview(null); setCrop(null); setError(null);
  }
  async function upload(): Promise<StoredAsset | undefined> {
    if (!file || !crop || active.current) return;
    const controller = new AbortController();
    active.current = controller; setBusy(true); setError(null);
    try {
      const asset = await onUpload({ file, edit: { crop }, signal: controller.signal });
      if (controller.signal.aborted) return;
      return asset;
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not upload the image. Try again.");
    } finally {
      if (active.current === controller) { active.current = null; setBusy(false); }
    }
  }
  return { file, preview, crop, setCrop, busy, error, select, reset, upload,
    previewError: () => { setCrop(null); setError("Could not open that image. Choose another photo."); },
    cancel: () => active.current?.abort() };
}
