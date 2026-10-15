import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import { turnScript } from "../scripts/inline-kit.mjs";
import { scene, PAGE_HELPERS } from "./scene.mjs";
import { FILM } from "./film.mjs";
const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const S = scene({ W: 640, H: 640, radius: FILM.radius });
console.log(
  `${S.out.report.parts} parts · ${S.out.report.layers.map((l) => `${l.name}: ${l.planar} planar, ${l.framed} framed, ${l.dynamic} dynamic`).join(" · ")} · ${S.seconds.toFixed(1)} s`,
);
const stage = `<div class="iso-stage iso-turn">${k.figureSvg({ width: S.W, height: S.H, label: FILM.title, body: "" })}${S.out.layerSvg("live", { width: S.W, height: S.H })}</div>`;
const css = `${S.out.css}
.iso-face-text[data-tone="lit"]{fill:var(--anatomy-lit)}
.iso-face-text[data-tone="mid"]{fill:var(--anatomy-mid)}`;
const body = `<style>${css}</style><div class="iso-plate" style="padding:0">${stage}</div>`;
const DATA = { turn: S.out.data, explode: S.obj.explode, basis: S.basis };
const LIVE = `const DATA = ${JSON.stringify(DATA)};
${PAGE_HELPERS}
const stage = document.querySelector(".iso-stage");
const ctl = TURN.mount(stage, DATA.turn, {});
window.TURN = TURN;
window.set = ({ yaw = 0, pitch = 0, roll = 0, apart = 0, ...rest }) => ctl.set({ root: { R: orient(yaw, pitch, roll) }, ...explodeValues(apart), ...rest });
window.ready = true;`;
writeFileSync(
  join(HERE, `test${theme === "light" ? "-light" : ""}.html`),
  k.pageHtml({ title: `${FILM.title} · test`, theme, body, script: turnScript() + LIVE, width: 680 }),
);
console.log("wrote test page");
