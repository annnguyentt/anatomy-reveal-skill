import { launch } from "../scripts/browser.mjs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const browser = await launch();
const page = await browser.newPage();
const DPR = 1;
await page.setViewport({ width: 540, height: 960 });
await page.goto(pathToFileURL(resolve(process.argv[2] ?? join(HERE, "motion.html"))).href);
await page.waitForFunction(() => window.ready);
const size = await page.evaluate(() => window.SIZE);
await page.setViewport({ width: size.W, height: size.H, deviceScaleFactor: DPR });
const res = await page.evaluate(() => {
  const out = [];
  for (let n = 0; n < Math.ceil(window.DURATION * 60); n++) {
    const t = n / 60;
    globalThis.__t3forced = [];
    const s = window.frame(t);
    if (s.forced || s.unseparated) {
      const names = [...new Set(globalThis.__t3forced.map((p) => p.name ?? p.id ?? String(p)))].slice(0, 6);
      out.push([t.toFixed(3), s.forced, s.unseparated, s.ms.toFixed(1), names.join(",")]);
    }
  }
  return out;
});
console.log(
  res.length ? res.map((r) => r.join(" ")).join("\n") : "every frame clean: no forced picks, no pass-throughs",
);
await browser.close();
