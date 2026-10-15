import { cpSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const target = process.argv[2];
if (!target) {
  console.log("usage: node scripts/new-project.mjs <dir>");
  process.exit(1);
}
const dir = resolve(target);
if (existsSync(dir) && readdirSync(dir).length) {
  console.log(`${dir} exists and is not empty`);
  process.exit(1);
}
cpSync(join(HERE, "..", "template"), dir, { recursive: true });
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: dir, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status) process.exit(r.status);
};
run("npm", ["install", "--no-audit", "--no-fund"]);
run("node", ["object/test-page.mjs", "--light"]);
run("node", ["object/build.mjs"]);
run("node", ["object/build.mjs", "--light"]);
run("node", ["motion/build.mjs"]);
console.log(`ready: ${dir}`);
