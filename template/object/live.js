const DATA = __DATA__;
__HELPERS__;
__FILM__;
const stage = document.querySelector(".ar-stage");
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const START = FIGURE.start ?? { yaw: -35, pitch: 12 };
const target = { yaw: START.yaw, pitch: START.pitch, apart: 0, ...FEATURE_DEFAULTS };
const drawn = { ...target };
const EASES = { yaw: 0.22, pitch: 0.22, apart: 0.32 };
for (const f of FEATURE_KEYS) EASES[f.channel] = f.ease ?? 0.25;
let touring = !still.matches;
let tourClock = 0;
let idle = 0;
let frame = 0;
let last = 0;
let visible = false;
let drag = null;
let hovering = false;
const ctl = TURN.mount(stage, DATA.turn, { onHold: () => hold() });
window.TURN = TURN;
function hold() {
  touring = false;
  clearTimeout(idle);
  idle = setTimeout(() => {
    if (hovering || drag) return hold();
    touring = !still.matches;
    run();
  }, 4200);
}
const follow = (from, to, dt, seconds) => to + (from - to) * Math.exp(-dt / seconds);
const svgs = [...stage.querySelectorAll("svg")];
const live = svgs[svgs.length - 1];
const halo = svgs[0].querySelector(".iso-halo");
const VB = svgs[0].getAttribute("viewBox").split(" ").map(Number);
const view = { zoom: 1.4, cx: VB[2] / 2, cy: VB[3] / 2, y1: VB[3] * 0.7, w: VB[2] * 0.4 };
function frameView(dt) {
  const b = live.getBBox();
  if (!b.width) return;
  const goal = {
    zoom: Math.min(1.9, (VB[2] * 0.8) / b.width, (VB[3] * 0.78) / b.height),
    cx: b.x + b.width / 2,
    cy: b.y + b.height / 2,
    y1: b.y + b.height,
    w: b.width,
  };
  for (const key in goal) view[key] = dt ? follow(view[key], goal[key], dt, 0.28) : goal[key];
  const w = VB[2] / view.zoom;
  const h = VB[3] / view.zoom;
  const vb = `${(view.cx - w / 2).toFixed(2)} ${(view.cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
  for (const svg of svgs) svg.setAttribute("viewBox", vb);
  halo.setAttribute("cx", view.cx.toFixed(2));
  halo.setAttribute("cy", (view.y1 + 10 / view.zoom + 6).toFixed(2));
  halo.setAttribute("rx", (view.w * 0.34).toFixed(2));
  halo.setAttribute("ry", (view.w * 0.034 + 2).toFixed(2));
}
function paint(dt = 0) {
  ctl.set({ root: { R: orient(drawn.yaw, drawn.pitch, 0) }, ...featureValues(drawn, explodeValues(drawn.apart)) });
  frameView(dt);
  const state =
    drawn.apart > 0.02
      ? `apart ${Math.round(drawn.apart * 100)}% · ${DATA.parts} parts`
      : FEATURE_KEYS.map((f) => `${f.name} ${Math.round(drawn[f.channel])}${f.unit ?? ""}`).join(" · ") || `${DATA.parts} parts`;
  const text = `${state} · ${(((drawn.yaw % 360) + 360) % 360).toFixed(0)}°`;
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1e3 : 0.016);
  last = now;
  if (touring) {
    tourClock += dt;
    target.yaw = START.yaw + tourClock * 14;
    target.pitch = START.pitch + 8 * Math.sin(tourClock * 0.4);
    const lap = (tourClock % 26) / 26;
    target.apart = lap > 0.42 && lap < 0.64 ? 1 : 0;
    for (const f of FEATURE_KEYS) if (f.tour && f.values) target[f.channel] = lap > f.tour[0] && lap < f.tour[1] ? f.values[1] : f.values[0];
  }
  for (const key in target) drawn[key] = follow(drawn[key], target[key], dt, (key === "yaw" || key === "pitch") && drag ? 0.06 : EASES[key]);
  paint(dt);
  const moving = touring || drag || Object.keys(target).some((k) => Math.abs(drawn[k] - target[k]) > 0.01);
  frame = visible && moving ? requestAnimationFrame(tick) : 0;
  if (!frame) last = 0;
}
function run() {
  if (!frame && visible) frame = requestAnimationFrame(tick);
}
new IntersectionObserver((entries) => {
  visible = entries[0].isIntersecting;
  run();
}).observe(stage);
stage.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "touch") return;
  hovering = true;
  hold();
  target.apart = 1;
  run();
});
stage.addEventListener("pointerleave", () => {
  hovering = false;
  if (!drag) target.apart = 0;
  run();
});
stage.addEventListener("pointerdown", (e) => {
  hold();
  drag = { x: e.clientX, y: e.clientY, yaw: target.yaw, pitch: target.pitch };
  stage.setPointerCapture(e.pointerId);
  run();
});
stage.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const w = stage.getBoundingClientRect().width;
  target.yaw = drag.yaw + ((e.clientX - drag.x) / w) * 300;
  target.pitch = Math.max(-60, Math.min(80, drag.pitch - ((e.clientY - drag.y) / w) * 200));
  run();
});
const end = () => {
  drag = null;
  run();
};
stage.addEventListener("pointerup", end);
stage.addEventListener("pointercancel", end);
stage.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const feature = FEATURE_KEYS.find((f) => f.key === key);
  if (key === "arrowleft") target.yaw -= 15;
  else if (key === "arrowright") target.yaw += 15;
  else if (key === "arrowup") target.pitch = Math.min(80, target.pitch + 10);
  else if (key === "arrowdown") target.pitch = Math.max(-60, target.pitch - 10);
  else if (key === "a" || key === " ") target.apart = target.apart ? 0 : 1;
  else if (feature && feature.step) target[feature.channel] += feature.step;
  else if (feature && feature.values) target[feature.channel] = target[feature.channel] === feature.values[1] ? feature.values[0] : feature.values[1];
  else return;
  e.preventDefault();
  hold();
  run();
});
window.__anatomy = {
  target,
  drawn,
  paint,
  set: (v) => {
    Object.assign(target, v);
    Object.assign(drawn, v);
    touring = false;
    paint();
  },
  explodeValues,
  orient,
};
paint();
