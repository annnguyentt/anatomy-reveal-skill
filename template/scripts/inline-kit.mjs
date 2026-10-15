import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const KIT = join(dirname(fileURLToPath(import.meta.url)), "..", "kit");
const strip = (file) => readFileSync(join(KIT, file), "utf8").replace(/^export /gm, "");
export function kitScript() {
  return strip("iso-kit.mjs");
}
export function turnScript() {
  return strip("turn.mjs");
}
