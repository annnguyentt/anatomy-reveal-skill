const EASE = {
  lin: (x) => x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  i: (x) => x * x * x,
  o: (x) => 1 - Math.pow(1 - x, 3),
  whip: (x) => (x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2),
  so: (x) => 1 - Math.pow(1 - x, 2),
  si: (x) => x * x,
  back: (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2),
};
export const BASE_DURATION = 10;
const BASE_KEYS = [
  { t: 0, yaw: 150, pitch: 26, roll: -28, zoom: 1.62, focus: "body", panX: 0, panY: -10, apart: 0, pressure: 0, portafilter: 0, steam: 0, grind: 0, glow: [0.8, 1.06, 0.62] },
  { t: 0.6, yaw: 112, pitch: 22, roll: -18, zoom: 1.7, ease: "si" },
  { t: 1.2, yaw: 0, pitch: 14, roll: -5, zoom: 1.94, ease: "lin", panY: -4 },
  { t: 1.62, yaw: -34, pitch: 14, roll: 0, zoom: 2.1, ease: "so", panY: 0, glow: [0.6, 0.6, 0.62] },
  { t: 1.72, yaw: -38, pitch: 15, roll: 0, zoom: 2.15, focus: "body", panX: 0, panY: 0, ease: "lin" },
  { t: 1.96, yaw: -52, pitch: 30, roll: -4, zoom: 4.4, focus: "hopper", panX: -10, panY: 16, grind: 0, ease: "whip" },
  { t: 2.76, yaw: -30, pitch: 26, roll: -6, zoom: 4.9, focus: "hopper", panX: 8, panY: -10, grind: 60, ease: "lin" },
  { t: 3.0, yaw: -16, pitch: 6, roll: 3, zoom: 6.6, focus: "gauge", panX: 0, panY: 4, pressure: 0, ease: "whip", glow: [0.5, 0.5, 0.6] },
  { t: 4.0, yaw: -22, pitch: 8, roll: 5, zoom: 7.4, focus: "gauge", panX: 0, panY: 0, pressure: 132, ease: "lin" },
  { t: 4.24, yaw: -80, pitch: 12, roll: -3, zoom: 5.0, focus: "knob.steam", panX: 0, panY: 0, steam: 0, ease: "whip" },
  { t: 4.92, yaw: -72, pitch: 14, roll: -5, zoom: 5.5, focus: "knob.steam", panX: 0, panY: 0, steam: 135, ease: "lin" },
  { t: 5.16, yaw: -28, pitch: 12, roll: 2, zoom: 3.2, focus: "group", panX: 0, panY: 30, portafilter: 0, ease: "whip" },
  { t: 5.95, yaw: -34, pitch: 13, roll: 2, zoom: 3.35, focus: "group", panX: 0, panY: 30, portafilter: 1, ease: "io" },
  { t: 6.4, yaw: -36, pitch: 14, roll: 1, zoom: 3.4, focus: "group", panX: 0, panY: 30, portafilter: 0, ease: "io" },
  { t: 6.85, yaw: -50, pitch: 22, roll: 0, zoom: 2.03, focus: "body", panX: 0, panY: 0, pressure: 0, steam: 0, ease: "io", glow: [0.52, 0.5, 0.72] },
  { t: 6.93, apart: 0, ease: "lin" },
  { t: 7.33, yaw: -58, pitch: 24, roll: -2, zoom: 1.4, apart: 1, panY: -40, ease: "o" },
  { t: 8.25, yaw: -74, pitch: 22, roll: -3, zoom: 1.35, apart: 1, panY: -40, ease: "lin" },
  { t: 8.9, yaw: -22, pitch: 10, roll: 0, zoom: 2.03, apart: 0, panY: 0, grind: 0, ease: "io", glow: [0.52, 0.45, 0.75] },
  { t: 10, yaw: -26, pitch: 8, roll: 0, zoom: 2.15, panY: 0, ease: "o" },
];
const BASE_LABELS = [
  { t: 0, hint: "Espresso machine", readout: "dual boiler · built-in grinder" },
  { t: 1.85, hint: "Bean hopper · conical burr grinder", readout: "250 g smoked hopper" },
  { t: 2.9, hint: "Pressure gauge", readout: "9 bar extraction" },
  { t: 4.15, hint: "Steam knob", readout: "knurled steel dial" },
  { t: 5.08, hint: "Portafilter · group head", readout: "58 mm · twist to unlock" },
  { t: 6.8, hint: "Taken apart", readout: "{parts} parts · {assemblies} assemblies" },
  { t: 8.7, hint: "Espresso machine", readout: "380 × 415 × 470 mm" },
];
const REQUESTED = typeof DATA !== "undefined" && DATA.duration ? DATA.duration : BASE_DURATION;
function retimer(keys, duration) {
  const segments = [];
  let fixed = 0;
  for (let i = 1; i < keys.length; i++) {
    const whip = keys[i].ease === "whip";
    segments.push({ a: keys[i - 1].t, b: keys[i].t, whip });
    if (whip) fixed += keys[i].t - keys[i - 1].t;
  }
  const scale = Math.max(0.35, (duration - fixed) / (BASE_DURATION - fixed));
  return (t) => {
    let out = 0;
    for (const s of segments) {
      if (t <= s.a) break;
      const part = Math.min(t, s.b) - s.a;
      out += s.whip ? part : part * scale;
    }
    return out + Math.max(0, t - BASE_DURATION) * scale;
  };
}
const RETIME = retimer(BASE_KEYS, REQUESTED);
export const DURATION = RETIME(BASE_DURATION);
export const KEYS = BASE_KEYS.map((k) => ({ ...k, t: RETIME(k.t) }));
export const LABELS = BASE_LABELS.map((l) => ({ ...l, t: RETIME(l.t) }));
const CHANNELS = ["yaw", "pitch", "roll", "zoom", "panX", "panY", "apart", ...Object.keys(FEATURE_DEFAULTS)];
const DEFAULTS = { yaw: 0, pitch: 0, roll: 0, zoom: 1, panX: 0, panY: 0, apart: 0, ...FEATURE_DEFAULTS };
function track(name) {
  const list = KEYS.filter((k) => k[name] !== void 0).map((k) => ({ t: k.t, v: k[name], ease: k.ease ?? "io" }));
  if (!list.length || list[0].t > 0) list.unshift({ t: 0, v: list.length ? list[0].v : DEFAULTS[name], ease: "lin" });
  return list;
}
const TRACKS = Object.fromEntries(CHANNELS.map((c) => [c, track(c)]));
const FOCUS = KEYS.filter((k) => k.focus !== void 0).map((k) => ({ t: k.t, v: k.focus, ease: k.ease ?? "io" }));
const GLOW = KEYS.filter((k) => k.glow !== void 0).map((k) => ({ t: k.t, v: k.glow, ease: k.ease ?? "io" }));
function sample(list, t, log = false) {
  if (t <= list[0].t) return { a: list[0].v, b: list[0].v, e: 0 };
  for (let i = 1; i < list.length; i++) {
    if (t <= list[i].t) {
      const x = (t - list[i - 1].t) / (list[i].t - list[i - 1].t || 1);
      return { a: list[i - 1].v, b: list[i].v, e: EASE[list[i].ease](x), log };
    }
  }
  const last = list[list.length - 1].v;
  return { a: last, b: last, e: 0 };
}
const mix = (a, b, e) => a + (b - a) * e;
const FRAME = typeof DATA !== "undefined" && DATA.W ? [DATA.W, DATA.H] : [540, 960];
const WIDE_FIT = Math.min(1, FRAME[0] / 540, FRAME[1] / 760);
function fitZoom(z) {
  const x = Math.max(0, Math.min(1, (z - 2.6) / 2));
  return z * Math.pow(WIDE_FIT, 1 - x * x * (3 - 2 * x));
}
export function at(t) {
  const out = {};
  for (const c of CHANNELS) {
    const { a, b, e } = sample(TRACKS[c], t);
    out[c] = c === "zoom" ? Math.exp(mix(Math.log(a), Math.log(b), e)) : mix(a, b, e);
  }
  out.zoom = fitZoom(out.zoom);
  const f = sample(FOCUS, t);
  out.focus = { a: f.a, b: f.b, e: f.e };
  const g = sample(GLOW, t);
  out.glow = g.a.map((v, i) => mix(v, g.b[i], g.e));
  let label = LABELS[0];
  for (const l of LABELS) if (t >= l.t) label = l;
  out.label = label;
  return out;
}
