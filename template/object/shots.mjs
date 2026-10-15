import { launch } from "../scripts/browser.mjs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const [file, out, ...specs] = process.argv.slice(2);
const size = Number(process.env.SIZE ?? 640);
const browser = await launch();
const page = await browser.newPage();
await page.setViewport({ width: size + 40, height: size + 40, deviceScaleFactor: Number(process.env.DPR ?? 1) });
page.on("console", (m) => console.log("console:", m.text()));
page.on("pageerror", (e) => console.log("pageerror:", e.message));
await page.goto(pathToFileURL(resolve(file)).href);
await page.waitForFunction(() => window.ready);
await page.evaluate((s) => {
  document.body.style.margin = "0";
  const st = document.querySelector(".iso-stage");
  st.style.width = `${s}px`;
}, size);
let i = 0;
for (const spec of specs) {
  const state = JSON.parse(spec);
  const stats = await page.evaluate((s) => {
    const { zoom, ...rest } = s;
    const r = window.set(rest);
    for (const svg of document.querySelectorAll(".iso-stage svg")) {
      if (!svg.dataset.vb) svg.dataset.vb = svg.getAttribute("viewBox");
      const [x, y, w, h] = svg.dataset.vb.split(" ").map(Number);
      if (zoom) {
        const [z, cx, cy] = zoom;
        svg.setAttribute("viewBox", `${cx - w / z / 2} ${cy - h / z / 2} ${w / z} ${h / z}`);
      } else svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
    }
    return r;
  }, state);
  if (stats.forced || stats.unseparated) console.log(spec, JSON.stringify(stats));
  const el = await page.$(".iso-stage");
  await el.screenshot({ path: `${out}_${i++}.png` });
}
await browser.close();
