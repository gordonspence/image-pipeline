import test from "node:test";
import assert from "node:assert/strict";
import { cropToPixels, validateCrop } from "../src/core/crop";
test("crop bounds reject non-finite, negative and out-of-image values", () => {
  for (const crop of [null, {}, { x: NaN, y: 0, width: 1, height: 1 }, { x: -.1, y: 0, width: 1, height: 1 }, { x: .2, y: 0, width: 1, height: 1 }]) {
    assert.throws(() => validateCrop(crop), { code: "INVALID_CROP" });
  }
});
test("percent crop maps to oriented dimensions without crossing the edge", () => {
  assert.deepEqual(cropToPixels({ x: .5, y: 0, width: .5, height: 1 }, 200, 100, 1), { left: 100, top: 0, width: 100, height: 100 });
  assert.deepEqual(cropToPixels({ x: 0, y: 0, width: 1.0000001, height: 1 }, 101, 101, 1), { left: 0, top: 0, width: 101, height: 101 });
  assert.throws(() => cropToPixels({ x: 0, y: 0, width: 1, height: 1 }, 200, 100, 1), { code: "INVALID_CROP" });
});
