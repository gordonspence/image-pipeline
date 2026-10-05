import { avatar } from "./avatar";
import type { ImagePolicy } from "../types";
export function product(): ImagePolicy {
  const policy = avatar();
  policy.outputs.display = { width: 1200, height: 1200, format: "webp", quality: 82, maxBytes: 1_000_000 };
  return policy;
}
