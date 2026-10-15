import * as G from "../kit/lathe.mjs";
const TAU = Math.PI * 2;
const unit = G.unit3;
const add = G.add3;
const mul = G.mul3;
const sub = G.sub3;
const dot = G.dot3;
const cross = G.cross3;
export const frame = (o, a, u) => {
  const A = unit(a);
  const U = unit(sub(u, mul(A, dot(u, A))));
  return { o, a: A, u: U, v: cross(A, U) };
};
const AX = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
const NX = [-1, 0, 0];
const NY = [0, -1, 0];
const NZ = [0, 0, -1];
const vx = (X) => -X;
export const BODY = { W: 190, back: -200, wall: 102, front: 196, base: 12, deck: 18, head: 250, top: 380, lid: 388, cheek: 140 };
const GROUP = { X: 0, y: 150 };
const GAUGE = { X: -30, z: 340, r: 28 };
const HOPPER = { X: -20, y: 98 };
const CUP = { X: 22, y: 158, r: 30 };
const WAND = { X: 86, y: 172 };
const FONT = "Helvetica, Arial, sans-serif";
const ring = (r, steps = 72) =>
  Array.from({ length: steps }, (_, j) => {
    const a = (TAU * j) / steps;
    return `${j ? "L" : "M"}${(r * Math.cos(a)).toFixed(3)} ${(r * Math.sin(a)).toFixed(3)}`;
  }).join("") + "Z";
const rrect = (x0, y0, x1, y1, r) =>
  `M${x0 + r} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
const text = (x, y, s, size, { tone = "hi", anchor = "middle", weight = 400, family = FONT, style = "" } = {}) =>
  `<text class="iso-face-text" data-tone="${tone}" font-size="${size}" text-anchor="${anchor}"${weight !== 400 ? ` font-weight="${weight}"` : ""} style="font-family:${family.replace(/"/g, "'")};letter-spacing:.08em;${style}" transform="translate(${x.toFixed(3)} ${y.toFixed(3)})">${s}</text>`;
const line = (d, tone = "lo") => `<path class="iso-line" data-tone="${tone}" d="${d}"/>`;
function roundedRect(u0, v0, u1, v1, r, round = [1, 1, 1, 1], steps = 8) {
  const out = [];
  const corner = (cu, cv, a0) => {
    for (let j = 0; j <= steps; j++) {
      const a = a0 + (j / steps) * (Math.PI / 2);
      out.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
    }
  };
  if (round[0]) corner(u0 + r, v0 + r, Math.PI);
  else out.push([u0, v0]);
  if (round[1]) corner(u1 - r, v0 + r, 1.5 * Math.PI);
  else out.push([u1, v0]);
  if (round[2]) corner(u1 - r, v1 - r, 0);
  else out.push([u1, v1]);
  if (round[3]) corner(u0 + r, v1 - r, 0.5 * Math.PI);
  else out.push([u0, v1]);
  return out;
}
export function buildObject(T, { layer }) {
  const parts = {};
  const groups = {};
  const explode = [];
  const anchors = {};
  const features = [];
  const L = layer;
  const root = T.group("root", { free: { origin: [0, 0, 236] } });
  groups.root = root;
  const assembly = (name, dir, travel, delay = 0, parent = root) => {
    const g = T.group(name, { parent, slide: { direction: unit(dir), travel } });
    groups[name] = g;
    explode.push({ name, travel, delay });
    return g;
  };
  const hinge = (name, parent, point, axis, range) => {
    const g = T.group(name, { parent, hinge: { point, axis, range } });
    groups[name] = g;
    return g;
  };
  const part = (p) => (parts[p.name] = p);
  const prismOn =
    (axis, u) =>
    (name, group, poly, s0, s1, o = {}) =>
      part(
        T.prism({
          name,
          group,
          layer: L,
          F: frame([0, 0, 0], axis, u),
          polygon: poly,
          s0,
          s1,
          steps: 5,
          tone: o.tone ?? "hi",
          crease: o.crease ?? "lo",
          bevel: o.bevel ?? 0,
          material: o.material,
          lit: o.lit,
          details: o.details,
        }),
      );
  const prismX = prismOn(AX.x, AX.y);
  const prismY = prismOn(AX.y, AX.z);
  const prismZ = prismOn(AX.z, AX.x);
  const round = (name, group, F, s0, s1, r, o = {}) =>
    part(
      T.round({
        name,
        group,
        layer: L,
        F,
        s0,
        s1,
        r,
        ends: o.ends,
        tone: o.tone ?? "hi",
        crease: o.crease ?? "lo",
        material: o.material,
        lit: o.lit,
        details: o.details,
      }),
    );
  const plane = (p, o, u, v, svg, normal, fade = [0.04, 0.3]) => T.plane({ part: p, o, u, v, svg, normal, fade });
  const box = (name, group, [X0, X1], [y0, y1], [z0, z1], o = {}) =>
    prismZ(name, group, o.r ? roundedRect(vx(X1), y0, vx(X0), y1, o.r, o.round, 8) : [[vx(X1), y0], [vx(X0), y0], [vx(X0), y1], [vx(X1), y1]], z0, z1, o);
  const up = (X, y) => frame([vx(X), y, 0], AX.z, AX.x);
  const FRONT = { u: [-1, 0, 0], v: [0, 0, -1] };
  const TOP = { u: [-1, 0, 0], v: [0, 1, 0] };
  const RIGHT = { u: [0, -1, 0], v: [0, 0, -1] };
  const LEFT = { u: [0, 1, 0], v: [0, 0, -1] };
  const BACK = { u: [1, 0, 0], v: [0, 0, -1] };
  const { W, back, wall, front, base, deck, head, top, lid, cheek } = BODY;
  const brushed = (w, h, step = 7, tone = "faint") => {
    let d = "";
    for (let y = -h / 2 + step; y < h / 2 - 2; y += step) d += `M${(-w / 2 + 6).toFixed(1)} ${y.toFixed(1)}H${(w / 2 - 6).toFixed(1)}`;
    return line(d, tone);
  };

  const core = assembly("core", AX.z, 0, 0);
  box("shell.base", core, [-W, W], [back, wall], [base, deck], { material: "gunmetal", tone: "hi" });
  for (const [X, y] of [
    [-165, -176],
    [165, -176],
    [-165, 176],
    [165, 176],
  ]) {
    const n = `foot.${X > 0 ? "R" : "L"}${y > 0 ? "f" : "b"}`;
    const g = assembly(n, NZ, 26, 0.3);
    round(n, g, up(X, y), 0, base, 13, { material: "rubber", tone: "hi" });
  }
  const cavity = box("shell.wall", core, [-W + 6, W - 6], [wall - 6, wall], [deck, top], { material: "steel", tone: "mid", crease: "faint" });
  plane(cavity, [0, wall + 0.02, (deck + head) / 2], FRONT.u, FRONT.v, line(`M-120 -70H120M-120 -40H120M-120 -10H120M-120 20H120M-120 50H120`, "faint"), AX.y);

  const topG = assembly("top", AX.z, 96, 0.06);
  const topPlate = prismZ("shell.top", topG, roundedRect(-W, back, W, front, 34, [0, 0, 1, 1], 8), top, lid, {
    material: "steel",
    tone: "hi",
    bevel: 1.2,
  });
  {
    let d = "";
    for (let X = 62; X <= 176; X += 9) d += `M${X} ${back + 16}V${back + 196}`;
    plane(
      topPlate,
      [0, 0, lid + 0.02],
      TOP.u,
      TOP.v,
      `<path class="iso-line" data-tone="lo" d="${rrect(52, back + 10, 184, back + 204, 10)}"/>` + line(d, "faint") + line(`M-184 ${wall - 2}H184`, "faint"),
      AX.z,
    );
  }

  const sideL = assembly("side.L", AX.x, 56, 0.16);
  const sideR = assembly("side.R", NX, 56, 0.16);
  const sidePoly = [
    [back + 6, deck],
    [wall, deck],
    [wall, top],
    [back + 6, top],
  ];
  const sl = prismX("shell.side.L", sideL, sidePoly, W - 6, W, { material: "steel", tone: "hi", crease: "faint" });
  const sr = prismX("shell.side.R", sideR, sidePoly, -W, -W + 6, { material: "steel", tone: "hi", crease: "faint" });
  plane(sl, [W + 0.02, (back + wall) / 2, (deck + top) / 2], LEFT.u, LEFT.v, brushed(wall - back - 12, top - deck, 9), AX.x);
  plane(sr, [-W - 0.02, (back + wall) / 2, (deck + top) / 2], RIGHT.u, RIGHT.v, brushed(wall - back - 12, top - deck, 9), NX);
  const backG = assembly("back", NY, 54, 0.16);
  const backPanel = box("shell.back", backG, [-W, W], [back, back + 6], [deck, top], { material: "steel", tone: "hi", crease: "faint" });
  {
    let d = "";
    for (let z = -90; z <= 90; z += 8) d += `M60 ${z}h80`;
    plane(
      backPanel,
      [0, back - 0.02, (deck + top) / 2],
      BACK.u,
      BACK.v,
      line(d, "lo") + [-170, 170].flatMap((x) => [-170, 170].map((z) => `<circle cx="${x}" cy="${z}" r="2.4" style="fill:#3b3a3c"/>`)).join(""),
      NY,
    );
  }

  const cheekL = assembly("cheek.L", AX.x, 70, 0.12);
  const cheekR = assembly("cheek.R", NX, 70, 0.12);
  const cl = box("cheek.L", cheekL, [-W, -cheek], [wall, front], [base, head], { material: "steel", tone: "hi", r: 14, round: [0, 0, 1, 0] });
  const cr = box("cheek.R", cheekR, [cheek, W], [wall, front], [base, head], { material: "steel", tone: "hi", r: 14, round: [0, 0, 0, 1] });
  for (const [p, X] of [
    [cl, -165],
    [cr, 165],
  ])
    plane(p, [vx(X), front + 0.02, (base + head) / 2], FRONT.u, FRONT.v, brushed(36, head - base - 20, 8), AX.y);

  const headG = assembly("head", [0, 1, 0.45], 64, 0.12);
  const headBlock = prismZ("head", headG, roundedRect(-W, wall, W, front, 34, [0, 0, 1, 1], 8), head, top, {
    material: "steel",
    tone: "hi",
    bevel: 1.6,
  });
  {
    const zc = (head + top) / 2;
    const y = (z) => -(z - zc);
    let svg = `<path class="iso-line" data-tone="mid" d="${rrect(-176, y(top - 8), 176, y(head + 10), 12)}"/>`;
    svg += text(-150, y(326), "GRIND", 4.2, { tone: "mid" });
    svg += text(72, y(326), "BEVERAGE", 4.2, { tone: "mid" });
    for (const [X, s] of [
      [-108, "1 CUP"],
      [-83, "2 CUP"],
      [-42, "START"],
      [0, "HOT"],
      [25, "STEAM"],
    ])
      svg += text(X, y(281), s, 3.4, { tone: "mid" });
    for (const X of [-108, -83, 0, 25]) svg += `<circle cx="${X}" cy="${y(314)}" r="1.6" style="fill:#f2efe6;stroke:#6f6c66;stroke-width:.3"/>`;
    for (const X of [10, 30, 50, 70, 90, 110]) svg += `<path class="iso-line" data-tone="mid" d="M${X - 3.5} ${y(364)}h7v4.4a3.5 2.6 0 0 1 -7 0z"/><circle cx="${X}" cy="${y(357)}" r=".9" style="fill:#6f6c66"/>`;
    plane(headBlock, [0, front + 0.02, zc], FRONT.u, FRONT.v, svg, AX.y);
    plane(headBlock, [W + 0.02, (wall + front) / 2, zc], LEFT.u, LEFT.v, brushed(front - wall - 30, top - head - 16, 9), AX.x);
  }

  const badge = assembly("badge", AX.y, 26, 0.02, headG);
  {
    const p = prismY("badge", badge, roundedRect(256, -40, 268, 40, 6, [1, 1, 1, 1], 6), front, front + 1.4, { material: "chrome", tone: "hi", bevel: 0.4 });
    plane(p, [0, front + 1.42, 262], FRONT.u, FRONT.v, text(0, 1.6, "ESPRESSO", 4.6, { tone: "hi", weight: 700 }), AX.y);
  }

  const gaugeG = assembly("gauge", AX.y, 42, 0.02, headG);
  const GF = frame([vx(GAUGE.X), front, GAUGE.z], AX.y, AX.z);
  const bezel = round("gauge.bezel", gaugeG, GF, 0, 8, GAUGE.r, { material: "chrome", tone: "hi", details: { seams: [3] } });
  {
    const r = GAUGE.r - 5.5;
    const pt = (a, rr) => [rr * Math.sin(a), -rr * Math.cos(a)];
    let ticks = "";
    let major = "";
    let nums = "";
    for (let i = 0; i <= 32; i++) {
      const a = ((-135 + (270 * i) / 32) * Math.PI) / 180;
      const [x0, y0] = pt(a, r - (i % 4 ? 2 : 4.2));
      const [x1, y1] = pt(a, r - 0.4);
      const seg = `M${x0.toFixed(2)} ${y0.toFixed(2)}L${x1.toFixed(2)} ${y1.toFixed(2)}`;
      if (i % 4) ticks += seg;
      else major += seg;
      if (i % 8 === 0) {
        const [tx, ty] = pt(a, r - 8.5);
        nums += `<text font-size="3.6" text-anchor="middle" style="fill:#efe9dc;font-family:${FONT}" x="${tx.toFixed(2)}" y="${(ty + 1.3).toFixed(2)}">${i / 2}</text>`;
      }
    }
    const a0 = ((-135 + (270 * 16) / 32) * Math.PI) / 180;
    const a1 = ((-135 + (270 * 24) / 32) * Math.PI) / 180;
    const arc = Array.from({ length: 13 }, (_, j) => pt(a0 + ((a1 - a0) * j) / 12, r - 1.2))
      .map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
      .join("");
    const svg =
      `<circle r="${GAUGE.r - 3}" style="fill:#18181b"/>` +
      `<path d="${arc}" style="fill:none;stroke:#c9a35b;stroke-width:2.2"/>` +
      `<path d="${ticks}" style="fill:none;stroke:#cfc9bd;stroke-width:.35"/>` +
      `<path d="${major}" style="fill:none;stroke:#f3eee2;stroke-width:.7"/>` +
      nums +
      `<text font-size="3" text-anchor="middle" style="fill:#a8a296;font-family:${FONT};letter-spacing:.2em" y="11">BAR</text>` +
      `<text font-size="2.3" text-anchor="middle" style="fill:#c9a35b;font-family:${FONT};letter-spacing:.14em" y="16">ESPRESSO</text>` +
      `<path class="iso-line" data-tone="mid" d="${ring(GAUGE.r - 3, 80)}"/>`;
    plane(bezel, [vx(GAUGE.X), front + 8.02, GAUGE.z], FRONT.u, FRONT.v, svg, AX.y, [0.02, 0.2]);
  }
  const needleLift = assembly("needle.lift", AX.y, 30, 0, gaugeG);
  const needle = hinge("needle", needleLift, [vx(GAUGE.X), front, GAUGE.z], NY, [-10, 280]);
  {
    const rest = (-135 * Math.PI) / 180;
    const pts = [
      [-5, -1.5],
      [-5, 1.5],
      [21, 0.35],
      [21, -0.35],
    ].map(([along, side]) => {
      const X = GAUGE.X + along * Math.sin(rest) + side * Math.cos(rest);
      const z = GAUGE.z + along * Math.cos(rest) - side * Math.sin(rest);
      return [z, vx(X)];
    });
    prismY("gauge.needle", needle, pts, front + 8, front + 9, { material: "signal", tone: "hi" });
    round("gauge.pin", needle, GF, 9, 10.6, 2.6, { material: "chrome", tone: "hi" });
  }

  const knob = (name, X, z, r, len) => {
    const lift = assembly(`${name}.lift`, AX.y, 46, 0.03, headG);
    const g = hinge(name, lift, [vx(X), front, z], AX.y, [-720, 720]);
    const F = frame([vx(X), front, z], AX.y, AX.z);
    round(`${name}.skirt`, g, F, 0, 3, r + 2.4, { material: "chrome", tone: "mid" });
    const body = round(`${name}.body`, g, F, 3, len, r, {
      material: "chrome",
      tone: "hi",
      details: { ribs: { s0: 4, s1: len - 1, count: 56, fade: [0.08, 0.55], seams: true, tone: "lo" } },
    });
    plane(body, [vx(X), front + len + 0.02, z], FRONT.u, FRONT.v, `<path class="iso-line" data-tone="mid" d="${ring(r - 2.4, 60)}"/>` + line(`M0 ${-r + 3.4}V${-r + 8}`, "hi"), AX.y);
    anchors[name] = [vx(X), front + len, z];
    return g;
  };
  knob("knob.grind", -150, 300, 13, 17);
  knob("knob.beverage", 72, 300, 13, 17);
  for (const [i, X] of [-108, -83, -42, 0, 25].entries()) {
    const g = assembly(`button.${i}`, AX.y, 30, 0.04, headG);
    const r = i === 2 ? 8 : 7;
    const z = i === 2 ? 294 : 300;
    const b = round(`button.${i}`, g, frame([vx(X), front, z], AX.y, AX.z), 0, 4, r, { material: "chrome", tone: "hi" });
    plane(b, [vx(X), front + 4.02, z], FRONT.u, FRONT.v, `<path class="iso-line" data-tone="lo" d="${ring(r - 2.4, 40)}"/>`, AX.y);
  }
  {
    const lift = assembly("knob.steam.lift", NX, 54, 0, headG);
    const g = hinge("knob.steam", lift, [-W, 152, 316], NX, [-720, 720]);
    const F = frame([-W, 152, 316], NX, AX.z);
    round("knob.steam.collar", g, F, 0, 4, 27, { material: "chrome", tone: "mid" });
    const body = round("knob.steam.body", g, F, 4, 26, 24, {
      material: "chrome",
      tone: "hi",
      details: { ribs: { s0: 5, s1: 25, count: 84, fade: [0.08, 0.55], seams: true, tone: "lo" } },
    });
    plane(body, [-W - 26.02, 152, 316], RIGHT.u, RIGHT.v, `<path class="iso-line" data-tone="mid" d="${ring(19, 70)}${ring(8, 40)}"/>` + line("M0 -19V-11", "hi"), NX);
    anchors["knob.steam"] = [-W - 26, 152, 316];
  }

  const groupG = assembly("group", NZ, 34, 0.14);
  const GH = up(GROUP.X, GROUP.y);
  const collar = round("group.collar", groupG, GH, 224, head, 40, { material: "chrome", tone: "hi", details: { seams: [238] } });
  {
    let d = "";
    for (let r = 6; r <= 26; r += 5) {
      const n = Math.round((TAU * r) / 4.2);
      for (let j = 0; j < n; j++) {
        const a = (j / n) * TAU;
        d += `M${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}h.01`;
      }
    }
    plane(collar, [vx(GROUP.X), GROUP.y, 223.98], [1, 0, 0], [0, 1, 0], `<circle r="31" style="fill:#c9c7c2"/>` + line(d, "lo") + `<path class="iso-line" data-tone="mid" d="${ring(31, 72)}${ring(36, 72)}"/>`, NZ);
  }
  const pfLock = hinge("pf.lock", root, [vx(GROUP.X), GROUP.y, 0], AX.z, [-45, 5]);
  const pfDrop = T.group("pf.drop", { parent: pfLock, slide: { direction: NZ, travel: 40 } });
  groups["pf.drop"] = pfDrop;
  const pf = assembly("portafilter", [0, 1, -0.32], 104, 0.05, pfDrop);
  {
    const F = up(GROUP.X, GROUP.y);
    round("pf.basket", pf, F, 200, 224, [33, 37], { material: "chrome", tone: "hi", details: { seams: [204, 218] } });
    round("pf.spout", pf, F, 189, 200, [9, 12], { material: "chrome", tone: "hi" });
    for (const s of [-1, 1]) round(`pf.spout.${s > 0 ? "a" : "b"}`, pf, up(GROUP.X + s * 5.5, GROUP.y), 180, 189, [2.4, 3.2], { material: "chrome", tone: "mid" });
    const ang = (120 * Math.PI) / 180;
    const dir = unit([vx(Math.cos(ang)), Math.sin(ang), 0]);
    const at = (s) => add([vx(GROUP.X), GROUP.y, 212], mul(dir, s));
    const HF = frame(at(0), dir, AX.z);
    round("pf.neck", pf, HF, 37.5, 62, [6.5, 7.5], { material: "chrome", tone: "hi" });
    round("pf.grip", pf, HF, 62, 150, [10, 12.5], { material: "rubber", tone: "hi", details: { seams: [70, 142] } });
    round("pf.cap", pf, HF, 150, 158, 12.5, { material: "chrome", tone: "hi" });
    anchors.portafilter = at(60);
    anchors.handle = at(150);
  }
  anchors.group = [vx(GROUP.X), GROUP.y, 222];

  const trayG = assembly("tray", AX.y, 86, 0.1);
  const tray = box("tray", trayG, [-cheek + 2, cheek - 2], [wall, 214], [base, 44], { material: "steel", tone: "hi", r: 10, round: [0, 0, 1, 1] });
  plane(tray, [0, 214.02, (base + 44) / 2], FRONT.u, FRONT.v, `<path class="iso-line" data-tone="mid" d="${rrect(-112, -9, 112, 9, 9)}"/>` + text(0, 2, "ESPRESSO", 6.2, { tone: "lo", weight: 700, style: "letter-spacing:.4em" }), AX.y);
  const grilleG = assembly("grille", AX.z, 26, 0.16, trayG);
  const grille = box("grille", grilleG, [-cheek + 4, cheek - 4], [wall + 2, 211], [44, 47], { material: "chrome", tone: "hi", r: 8, round: [0, 0, 1, 1] });
  {
    let d = "";
    for (let y = wall + 8; y <= 205; y += 5.2) d += `M-128 ${(y - (wall + 211) / 2).toFixed(1)}H128`;
    let e = "";
    for (let X = -96; X <= 96; X += 48) e += `M${X} -50V50`;
    plane(grille, [0, (wall + 211) / 2, 47.02], TOP.u, TOP.v, line(d, "lo") + line(e, "mid"), AX.z);
  }
  anchors.tray = [0, 214, 30];

  const cupG = assembly("cup", AX.y, 150, 0, grilleG);
  {
    const F = up(CUP.X, CUP.y);
    const ribs = (s0, s1, tone = "faint") => ({ ribs: { s0, s1, count: 18, fade: [0.1, 0.6], tone } });
    round("cup.base", cupG, F, 47, 53, CUP.r, { material: "glass", tone: "hi" });
    round("cup.espresso", cupG, F, 53, 80, CUP.r, { material: "coffee", tone: "hi", details: ribs(54, 79) });
    round("cup.latte", cupG, F, 80, 98, CUP.r, { material: "coffee", tone: "mid", crease: "faint", details: ribs(81, 97) });
    round("cup.milk", cupG, F, 98, 124, CUP.r, { material: "milk", tone: "hi", details: ribs(99, 123) });
    const foam = round("cup.foam", cupG, F, 124, 136, [CUP.r, CUP.r + 1], { material: "milk", tone: "mid", crease: "faint", details: ribs(125, 135) });
    plane(
      foam,
      [vx(CUP.X), CUP.y, 136.02],
      TOP.u,
      TOP.v,
      `<circle r="${CUP.r - 1}" style="fill:#f6eddd"/><path d="M0 9C-9 3-14-4-9-9-5-12-1-9 0-6 1-9 5-12 9-9 14-4 9 3 0 9Z" style="fill:#b98154;opacity:.75"/><path class="iso-line" data-tone="mid" d="${ring(CUP.r + 0.6, 64)}"/>`,
      AX.z,
    );
  }
  anchors.cup = [vx(CUP.X), CUP.y, 110];
  anchors.foam = [vx(CUP.X), CUP.y, 136];

  const wandG = assembly("wand", AX.y, 92, 0.03);
  {
    const F = up(WAND.X, WAND.y);
    round("wand.joint", wandG, F, 234, head, [8, 11], { material: "chrome", tone: "hi" });
    round("wand.upper", wandG, F, 226, 234, 5, { material: "chrome", tone: "hi" });
    round("wand.grip", wandG, F, 194, 226, 8, { material: "rubber", tone: "hi", details: { seams: [200, 220] } });
    round("wand.tube", wandG, F, 118, 194, 4.6, { material: "chrome", tone: "hi" });
    round("wand.tip", wandG, F, 110, 118, [3.2, 4.6], { material: "chrome", tone: "mid" });
  }
  anchors.wand = [vx(WAND.X), WAND.y, 160];

  {
    const F = up(HOPPER.X, HOPPER.y);
    const collarG = assembly("hopper.collar", AX.z, 118, 0.04, topG);
    round("hopper.collar", collarG, F, lid, lid + 14, 62, {
      material: "chrome",
      tone: "hi",
      details: { ribs: { s0: lid + 2, s1: lid + 12, count: 120, fade: [0.08, 0.55], seams: true, tone: "lo" } },
    });
    const burr = assembly("hopper.burr", AX.z, 150, 0.03, topG);
    round("hopper.burr", burr, F, lid + 14, lid + 22, [58, 56], { material: "gunmetal", tone: "hi", details: { bolts: [{ s: lid + 22, r: 50, count: 12, size: 1.1, tone: "lit" }] } });
    const bowl = assembly("hopper.bowl", AX.z, 190, 0.02, topG);
    const s0 = lid + 22;
    const s1 = lid + 92;
    const beans = [];
    for (let s = s0 + 6, k2 = 0; s < s1 - 4; s += 7.5, k2++) {
      const rr = 56 + ((s - s0) / (s1 - s0)) * 12;
      beans.push({ s, r: rr, count: Math.round((TAU * rr) / 11), phase: k2 * 0.47, size: 2.6, tone: "lo" });
    }
    round("hopper.bowl", bowl, F, s0, s1, [56, 68], { material: "smoke", tone: "hi", details: { bolts: beans, seams: [s0 + 4] } });
    const lidG = assembly("hopper.lid", AX.z, 236, 0, topG);
    round("hopper.rim", lidG, F, s1, s1 + 4, 69, { material: "smoke", tone: "hi" });
    round("hopper.cover", lidG, F, s1 + 4, s1 + 14, [68, 60], { material: "smoke", tone: "hi" });
    round("hopper.knob", lidG, F, s1 + 14, s1 + 22, [12, 10], { material: "chrome", tone: "hi" });
    anchors.hopper = [vx(HOPPER.X), HOPPER.y, lid + 50];
    anchors.collar = [vx(HOPPER.X), HOPPER.y + 62, lid + 8];
  }

  const tools = [
    { name: "tamper", X: 150, y: -40, travel: 170, parts: [["puck", 0, 9, 29, "chrome"], ["neck", 9, 16, [10, 8], "chrome"], ["handle", 16, 52, [14, 18], "chrome"]] },
    { name: "funnel", X: 98, y: 22, travel: 140, parts: [["ring", 0, 14, 31, "steel"]] },
    { name: "basket", X: 104, y: -112, travel: 150, parts: [["cup", 0, 10, 30, "chrome"]] },
  ];
  for (const t of tools) {
    const g = assembly(`tool.${t.name}`, AX.z, t.travel, 0, topG);
    const F = up(t.X, t.y);
    for (const [n, a, b, r, m] of t.parts) {
      const p = round(`tool.${t.name}.${n}`, g, F, lid + a, lid + b, r, {
        material: m,
        tone: "hi",
        details: n === "handle" ? { ribs: { s0: lid + 18, s1: lid + 50, count: 40, fade: [0.1, 0.6], tone: "faint" } } : undefined,
      });
      if (n === "ring" || n === "cup")
        plane(p, [vx(t.X), t.y, lid + b + 0.02], TOP.u, TOP.v, `<circle r="${r - 4}" style="fill:${n === "cup" ? "#bdbab3" : "#8f8c86"}"/><path class="iso-line" data-tone="mid" d="${ring(r - 4, 60)}"/>`, AX.z);
    }
    anchors[`tool.${t.name}`] = [vx(t.X), t.y, lid + 20];
  }

  const tankG = assembly("tank", NY, 110, 0.02);
  {
    const t0 = back - 2;
    const tank = box("tank", tankG, [-160, 30], [back - 38, t0], [30, 352], { material: "glass", tone: "hi", r: 8, round: [1, 1, 0, 0] });
    let d = "";
    for (let x = -88; x <= 88; x += 4) d += `${x === -88 ? "M" : "L"}${x} ${(Math.sin(x / 7) * 1.4 - 30).toFixed(2)}`;
    plane(
      tank,
      [vx(-65), back - 38.02, 191],
      BACK.u,
      BACK.v,
      `<path class="iso-line" data-tone="mid" d="${d}"/>` + line("M70 -70h10M70 -30h10M70 10h10M70 50h14", "mid") + text(62, -68, "MAX", 4, { tone: "mid", anchor: "end" }) + text(62, 52, "MIN", 4, { tone: "mid", anchor: "end" }),
      NY,
    );
    const tl = assembly("tank.lid", AX.z, 60, 0, tankG);
    box("tank.lid", tl, [-160, 30], [back - 38, t0], [352, 360], { material: "rubber", tone: "hi", r: 8, round: [1, 1, 0, 0] });
  }
  anchors.tank = [vx(-65), back - 38, 200];

  for (const [X, r, h, name, travel, delay] of [
    [-92, 44, 206, "coffee", 150, 0.26],
    [84, 40, 190, "steam", 130, 0.28],
  ]) {
    const g = assembly(`boiler.${name}`, AX.z, travel, delay);
    const F = up(X, -88);
    round(`boiler.${name}.shell`, g, F, deck, h, r, {
      material: "copper",
      tone: "hi",
      details: { seams: [deck + 16, h - 16], bolts: [{ s: h, r: r - 6, count: 10, size: 0.9, tone: "lo" }] },
    });
    round(`boiler.${name}.element`, g, F, h, h + 10, r - 14, { material: "brass", tone: "hi" });
    round(`boiler.${name}.probe`, g, F, h + 10, h + 26, 4, { material: "chrome", tone: "mid" });
    anchors[`boiler.${name}`] = [vx(X), -88, h - 40];
  }
  const pumpG = assembly("pump", AX.x, 130, 0.3);
  {
    const F = frame([0, 34, 52], AX.x, AX.z);
    round("pump.body", pumpG, F, -30, 40, 22, { material: "gunmetal", tone: "hi", details: { seams: [-20, 30] } });
    round("pump.coil", pumpG, F, 40, 70, 16, { material: "copper", tone: "hi", details: { ribs: { s0: 41, s1: 69, count: 30, tone: "lo" } } });
    round("pump.inlet", pumpG, F, -46, -30, 8, { material: "brass", tone: "hi" });
  }
  const motorG = assembly("grinder.motor", AX.z, 74, 0.24);
  {
    const F = up(HOPPER.X, 42);
    round("grinder.motor", motorG, F, head + 2, 344, 34, { material: "gunmetal", tone: "hi", details: { seams: [head + 14, 330] } });
    round("grinder.chamber", motorG, F, 344, 372, [38, 34], { material: "steel", tone: "hi", details: { bolts: [{ s: 372, r: 28, count: 6, size: 1, tone: "lo" }] } });
  }
  const valveG = assembly("valve", AX.z, 60, 0.3);
  {
    const F = up(60, 64);
    round("valve.coil", valveG, F, 150, 196, 17, { material: "gunmetal", tone: "hi", details: { seams: [158, 188] } });
    round("valve.body", valveG, F, 132, 150, [11, 13], { material: "brass", tone: "hi" });
    round("valve.cap", valveG, F, 196, 204, 8, { material: "chrome", tone: "mid" });
  }
  const boardG = assembly("board", AX.y, 36, 0.3);
  {
    const b = prismY("board.pcb", boardG, roundedRect(236, -150, 346, 150, 4, [1, 1, 1, 1], 4), back + 8, back + 10, { material: "pcb", tone: "hi" });
    let d = "";
    for (let i = 0; i < 10; i++) d += `M${-130 + i * 6} 40V10L${-110 + i * 6} -10H${20 + i * 4}`;
    plane(b, [0, back + 10.02, 291], FRONT.u, FRONT.v, line(d, "lo"), AX.y);
    const chip = (n, X, z, w, h, label) => {
      const p = prismY(`board.${n}`, boardG, roundedRect(z - h / 2, vx(X) - w / 2, z + h / 2, vx(X) + w / 2, 0.8, [1, 1, 1, 1], 3), back + 10, back + 12, { material: "gunmetal", tone: "hi", bevel: 0.2 });
      if (label) plane(p, [vx(X), back + 12.02, z], FRONT.u, FRONT.v, text(0, 1.4, label, 4, { tone: "hi", weight: 700 }), AX.y);
    };
    chip("mcu", 40, 300, 30, 22, "MCU");
    chip("pid", -40, 270, 18, 14, "PID");
    chip("relay", 100, 310, 24, 18);
    for (const [i, X] of [-110, -92, -74].entries()) round(`board.cap${i}`, boardG, frame([vx(X), back + 10, 320], AX.y, AX.z), 0, 16, 6, { material: "gunmetal", tone: "hi", details: { rings: [{ at: [16, 0, 0], r: 3.2, tone: "lo" }] } });
  }

  anchors.body = [0, 0, 236];
  anchors.gauge = [vx(GAUGE.X), front + 9, GAUGE.z];
  anchors.panel = [vx(-60), front, 310];
  anchors.cavity = [0, 150, 160];
  for (let i = 0; i <= 6; i++) features.push({ "pf.lock": -i * 5, needle: i * 40, "knob.steam": i * 30, "knob.grind": i * 20 });
  for (let i = 0; i <= 6; i++) features.push({ "pf.lock": -30, "pf.drop": i * 6.5 });
  return { parts, groups, explode, root, anchors, features, counts: { boilers: 2 } };
}
export function explodeValues(explode, apart, { stretch = 0.55 } = {}) {
  const out = {};
  for (const { name, travel, delay } of explode) {
    const t = Math.max(0, Math.min(1, (apart - delay * stretch) / (1 - stretch)));
    out[name] = travel * t * t * (3 - 2 * t);
  }
  return out;
}
