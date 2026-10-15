import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { turnScript } from "../scripts/inline-kit.mjs";
import { scene, PAGE_HELPERS } from "./scene.mjs";
import { FILM, FIGURE, FEATURE_KEYS } from "./film.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const W = 640;
const H = 600;
const S = scene({ W, H, radius: FILM.radius, pad: 4 });
const counts = { parts: S.out.report.parts, assemblies: S.obj.explode.length, ...(S.obj.counts ?? {}) };
const fill = (text) => text.replace(/\{(\w+)\}/g, (_, key) => counts[key] ?? `{${key}}`);
const keyList = FEATURE_KEYS.map((f) => f.key.toUpperCase()).join(" · ");
const keySpeech = FEATURE_KEYS.map((f) => `${f.key.toUpperCase()} ${f.verb}`).join(", ");
const css = `${S.out.css}
.ar-stage{cursor:grab;outline:none;touch-action:none}
.ar-stage:active{cursor:grabbing}
.ar-stage:focus-visible{box-shadow:0 0 0 1px var(--anatomy-mid)}
.iso-face-text[data-tone="lit"]{fill:var(--anatomy-lit)}
.iso-face-text[data-tone="mid"]{fill:var(--anatomy-mid)}`;
const halo = `<ellipse cx="${W / 2}" cy="${H * 0.72}" rx="${W * 0.17}" ry="${H * 0.022}" class="iso-halo" style="filter:blur(8px)"/>`;
const aria = `${FIGURE.title}: drag to turn it, hover to take it apart; arrow keys turn it, A takes it apart${keySpeech ? `, ${keySpeech}` : ""}`;
const stage = `<div class="iso-stage iso-turn ar-stage" tabindex="0" role="slider" aria-label="${aria}" aria-valuetext="assembled">${k.figureSvg({ width: W, height: H, label: fill(FIGURE.label), body: halo })}${S.out.layerSvg("live", { width: W, height: H })}</div>`;
const body = k.plateHtml({
  fig: "Fig 1",
  title: FIGURE.title,
  hint: `Drag to turn · hover to take apart${keyList ? ` · ${keyList}` : ""}`,
  readout: "",
  keys: FIGURE.keys,
  caption: fill(FIGURE.caption),
  body: `<style>${css}</style>${stage}`,
});
const film = readFileSync(join(HERE, "film.mjs"), "utf8").replace(/^export /gm, "");
const DATA = { turn: S.out.data, explode: S.obj.explode, basis: S.basis, parts: counts.parts };
const LIVE = readFileSync(join(HERE, "live.js"), "utf8")
  .replace("__DATA__", JSON.stringify(DATA))
  .replace("__HELPERS__;", PAGE_HELPERS)
  .replace("__FILM__;", film);
const page = k.pageHtml({ title: FIGURE.title, theme, body, script: turnScript() + LIVE, width: 700 });
const name = `figure${theme === "light" ? "-light" : ""}.html`;
writeFileSync(join(HERE, name), page);
console.log(`wrote ${name} · ${(page.length / 1024).toFixed(0)} KB · ${counts.parts} parts · ${counts.assemblies} assemblies · build ${S.seconds.toFixed(1)} s`);
