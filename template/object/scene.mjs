import * as k from "../kit/iso-kit.mjs";
import * as A from "../kit/audit.mjs";
import { turning } from "../kit/turn-build.mjs";
import { buildObject, explodeValues } from "./geometry.mjs";
export function scene({ W = 640, H = 640, radius = 112, pad = 12, verify = false, strict = true, samples = 9 } = {}) {
  const box = { x: -radius, y: -radius, w: 2 * radius, d: 2 * radius, r: 0 };
  const P = k.fitProjection(k.boxCorners(box, -radius, radius), W, H, { pad, azimuth: 45, elevation: 30 });
  const R = A.recorder(P);
  const T = turning(P, { recorder: R });
  const layer = T.layer("live");
  T.stack(["live"]);
  const obj = buildObject(T, { layer });
  const poses = () => {
    const out2 = [];
    for (let i = 0; i <= samples; i++) out2.push({ ...explodeValues(obj.explode, i / samples) });
    for (const f of obj.features ?? []) out2.push(f);
    return out2;
  };
  const t0 = Date.now();
  const out = T.build({ statics: [], poses, verify, strict });
  const basis = A.cameraBasis(P);
  return { P, R, T, out, obj, basis, W, H, seconds: (Date.now() - t0) / 1e3 };
}
export const PAGE_HELPERS = `
const EXPLODE = DATA.explode;
function explodeValues(apart, stretch = 0.55) {
  const out = {};
  for (const { name, travel, delay } of EXPLODE) {
    const t = Math.max(0, Math.min(1, (apart - delay * stretch) / (1 - stretch)));
    out[name] = travel * t * t * (3 - 2 * t);
  }
  return out;
}
const mat3 = (a, b) => {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
};
const rotAbout = (axis, deg) => {
  const [x, y, z] = axis;
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c];
};
const M0 = [-1, 0, 0, 0, 0, 1, 0, 1, 0];
const BV = (() => {
  const { R, D, V } = DATA.basis;
  return [R[0], -D[0], V[0], R[1], -D[1], V[1], R[2], -D[2], V[2]];
})();
function orient(yaw, pitch = 0, roll = 0) {
  let M = mat3(rotAbout([0, 1, 0], yaw), M0);
  M = mat3(rotAbout([1, 0, 0], pitch), M);
  M = mat3(rotAbout([0, 0, 1], roll), M);
  return mat3(BV, M);
}
`;
