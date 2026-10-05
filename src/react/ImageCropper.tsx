"use client";
import { useState } from "react";
import Cropper from "react-easy-crop";
import type { Crop } from "../core/types";
export type ImageCropperProps = { image: string; aspect: number; onCropChange: (crop: Crop) => void; onError?: () => void; disabled?: boolean };
export function ImageCropper({ image, aspect, onCropChange, onError, disabled = false }: ImageCropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  return <fieldset className="ip-crop-controls" disabled={disabled}>
    <legend>Crop image</legend>
    <div className="ip-crop" inert={disabled}>
      <Cropper image={image} aspect={aspect} crop={position} zoom={zoom}
        onCropChange={setPosition} onZoomChange={setZoom}
        onCropComplete={area => onCropChange({ x: area.x / 100, y: area.y / 100, width: area.width / 100, height: area.height / 100 })}
        onMediaLoaded={() => { setPosition({ x: 0, y: 0 }); setZoom(1); }}
        mediaProps={{ onError: () => { onCropChange({ x: 0, y: 0, width: 0, height: 0 }); onError?.(); } }} />
    </div>
    <label className="ip-zoom">Zoom <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={event => setZoom(Number(event.target.value))} /></label>
    <p className="ip-hint">Drag to frame. Use arrow keys when the crop is focused.</p>
  </fieldset>;
}
