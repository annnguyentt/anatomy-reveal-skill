import { launch } from "../scripts/browser.mjs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const [yaw = -26, pitch = 30] = process.argv.slice(2).map(Number);
const browser = await launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(process.env.PAGE ?? "object/test-light.html")).href);
await page.waitForFunction(() => window.ready);
const res = await page.evaluate(
  ({ yaw: yaw2, pitch: pitch2 }) => {
    const seen = new Map();
    let forced = 0;
    for (let i = 0; i <= 200; i++) {
      globalThis.__t3unsep = [];
      const s = window.set({ yaw: yaw2, pitch: pitch2, apart: i / 200 });
      forced += s.forced;
      for (const [a, b, m] of globalThis.__t3unsep) {
        const key = `${a} × ${b}`;
        const prev = seen.get(key);
        if (!prev || m < prev.m) seen.set(key, { m, at: i / 200 });
      }
    }
    return { forced, pairs: [...seen].map(([k, v]) => `${k}  margin ${v.m.toFixed(2)} at apart ${v.at.toFixed(3)}`) };
  },
  { yaw, pitch },
);
console.log(`forced picks: ${res.forced}`);
console.log(res.pairs.length ? res.pairs.join("\n") : "no pairs pass through each other");
await browser.close();
