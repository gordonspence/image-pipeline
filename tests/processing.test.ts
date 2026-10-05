import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { avatar } from "../src/core/presets/avatar";
import { processImage } from "../src/sharp/process-image";
const full = { crop: { x: 0, y: 0, width: 1, height: 1 } };
test("produces actual variant metadata and strips EXIF", async () => {
  const input = await sharp({ create: { width: 64, height: 64, channels: 3, background: "red" } }).jpeg().withMetadata().toBuffer();
  const result = await processImage(input, { preset: avatar(), edit: full });
  for (const [name, output] of Object.entries(result.variants)) {
    const meta = await sharp(output.data).metadata();
    assert.equal(meta.format, "webp"); assert.equal(meta.width, name === "display" ? 600 : 160);
    assert.equal(output.bytes, output.data.byteLength); assert.equal(meta.exif, undefined);
  }
});
test("orientation 6: the crop selects the top half of the displayed image", async () => {
  const pixels = Buffer.from([255,0,0,255,0,0,0,0,255,0,0,255,255,0,0,255,0,0,0,0,255,0,0,255]);
  const input = await sharp(pixels, { raw: { width: 4, height: 2, channels: 3 } }).png().withMetadata({ orientation: 6 }).toBuffer();
  const policy = avatar(); policy.outputs = { display: { width: 2, height: 2, format: "png", quality: 100, maxBytes: 10000 } };
  const result = await processImage(input, { preset: policy, edit: { crop: { x: 0, y: 0, width: 1, height: .5 } } });
  const data = await sharp(result.variants.display.data).removeAlpha().raw().toBuffer();
  assert.deepEqual([...data], [255,0,0,255,0,0,255,0,0,255,0,0]);
});
test("transparent PNG remains transparent in WebP", async () => {
  const input = await sharp({ create: { width: 16, height: 16, channels: 4, background: { r: 255, g: 0, b: 0, alpha: .5 } } }).png().toBuffer();
  const result = await processImage(input, { preset: avatar(), edit: full });
  assert.equal((await sharp(result.variants.display.data).metadata()).hasAlpha, true);
});
test("input bytes, pixel limits, SVG, corrupt files and malformed crop are rejected", async () => {
  const input = await sharp({ create: { width: 32, height: 32, channels: 3, background: "red" } }).png().toBuffer();
  const small = avatar(); small.input.maxBytes = 1;
  await assert.rejects(processImage(input, { preset: small, edit: full }), { code: "INPUT_LIMIT" });
  const limited = avatar(); limited.input.maxDimension = 16;
  await assert.rejects(processImage(input, { preset: limited, edit: full }), { code: "INPUT_LIMIT" });
  for (const bytes of [Buffer.from("not an image"), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'), input.subarray(0, 40)]) {
    await assert.rejects(processImage(bytes, { preset: avatar(), edit: full }), { code: "INVALID_IMAGE" });
  }
  await assert.rejects(processImage(input, { preset: avatar(), edit: { crop: { x: 0, y: 0, width: 2, height: 1 } } }), { code: "INVALID_CROP" });
  const pixels = avatar(); pixels.input.maxPixels = 16; pixels.outputs = { tiny: { width: 2, height: 2, format: "webp", quality: 82, maxBytes: 1000 } };
  await assert.rejects(processImage(input, { preset: pixels, edit: full }), { code: "INVALID_IMAGE" });
});
test("animated WebP is rejected rather than silently taking its first frame", async () => {
  const frames = Buffer.alloc(2 * 2 * 2 * 3, 20);
  frames.fill(240, 12); // Different frames: identical frames can collapse during encoding.
  const input = await sharp(frames, { raw: { width: 2, height: 4, channels: 3, pageHeight: 2 } }).webp({ loop: 0, delay: [100, 100] }).toBuffer();
  assert.equal((await sharp(input).metadata()).pages, 2);
  await assert.rejects(processImage(input, { preset: avatar(), edit: full }), { code: "INVALID_IMAGE" });
});
test("output budget is an enforced limit, not a quality promise", async () => {
  const input = await sharp({ create: { width: 16, height: 16, channels: 3, background: "blue" } }).png().toBuffer();
  const policy = avatar(); policy.outputs.display.maxBytes = 1;
  await assert.rejects(processImage(input, { preset: policy, edit: full }), { code: "OUTPUT_LIMIT" });
});
