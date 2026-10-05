# Crop contract

`edit.crop` is `{ x, y, width, height }`. Values are fractions, not pixels or percentages: `0.5` means half of the corresponding image dimension. The rectangle uses the image after EXIF orientation (including flips). It does not use the preview element's CSS dimensions.

The React component converts react-easy-crop's percentage output by dividing by 100. Modern browsers display EXIF-oriented images; Sharp applies `autoOrient` before materializing and extracting pixels. Manual user rotation is intentionally unsupported in v0. Do not send crop coordinates from a manually rotated preview.

All values must be finite. Origins are non-negative; width and height are positive; the rectangle must stay inside the image. A tiny floating point tolerance is allowed at the far edge. The rectangle's pixel aspect must match the server preset within 2%, allowing small browser rounding differences.

Pixel conversion rounds the origin and size, then clamps the size to the remaining image bounds. Each crop dimension has a minimum of one pixel. Output dimensions are fixed by the preset; v0 permits upscaling and resizes the validated crop to those dimensions. Use adequate source resolution for good quality.

Example: on an oriented 2000 × 1000 image, `{ x: 0.5, y: 0, width: 0.5, height: 1 }` selects the right-hand 1000 × 1000 square.

Reference: [react-easy-crop](https://github.com/ValentinH/react-easy-crop), [Sharp orientation](https://sharp.pixelplumbing.com/api-operation/#autoorient).
