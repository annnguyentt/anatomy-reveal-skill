export const FILM = {
  fig: "Fig 1",
  title: "Espresso machine",
  radius: 380,
  label:
    "A stainless dual-boiler espresso machine with a built-in grinder, turning, seen close on the bean hopper, the pressure gauge and the steam knob, the portafilter unlocking from the group head, then taken apart into its shell, boilers, pump and grinder and put back together.",
  bounds: [
    [-216, 192],
    [-240, 290],
    [0, 486],
  ],
};

export const FIGURE = {
  title: "Espresso machine · anatomy",
  start: { yaw: -32, pitch: 14 },
  label:
    "A dual-boiler espresso machine with a built-in conical burr grinder, built from {parts} solid parts: a brushed steel shell of base, back, side panels, cheeks and top, a control head with a pressure gauge, two knurled knobs, five buttons and a side steam knob, a group head and a portafilter that unlocks and drops, a drip tray with its grille, a steam wand and a latte glass. Inside sit a coffee boiler and a steam boiler, a vibration pump, the grinder motor and a control board. Apart, it opens into {assemblies} assemblies.",
  keys: [
    { mark: "raised", label: "Shell: base, back, sides, cheeks, top, control head" },
    { mark: "lit", label: "Brew path: tank, pump, coffee boiler, group head, portafilter" },
    { mark: "edge", label: "Grinder: hopper, burr carrier, grind collar, motor" },
  ],
  caption:
    "{parts} convex parts, re-projected and re-shaded every frame and painted in an order solved from separating planes. The shell is a hollow box, so it comes apart in layers: the hopper and the tools lift off the top, the control head slides forward with its knobs and gauge, the side panels and the back open, and the boilers, the pump and the grinder motor rise out of the chassis.",
};

export const FEATURE_DEFAULTS = { pressure: 0, portafilter: 0, steam: 0, grind: 0 };

export const FEATURE_KEYS = [
  { key: "p", channel: "pressure", name: "pressure", unit: "°", values: [0, 160], ease: 0.35, verb: "builds brew pressure" },
  { key: "f", channel: "portafilter", name: "portafilter", unit: "", values: [0, 1], ease: 0.3, verb: "unlocks the portafilter" },
  { key: "s", channel: "steam", name: "steam", unit: "°", step: 90, ease: 0.18, verb: "turns the steam knob" },
  { key: "g", channel: "grind", name: "grind", unit: "°", step: 30, ease: 0.18, verb: "turns the grind knob" },
];

const clamp01 = (x) => Math.max(0, Math.min(1, x));

export function featureValues(s, values) {
  return {
    ...values,
    needle: s.pressure,
    "pf.lock": -30 * clamp01(s.portafilter * 2),
    "pf.drop": 38 * clamp01(s.portafilter * 2 - 1),
    "knob.steam": s.steam,
    "knob.grind": s.grind,
  };
}

export function featureTravel(a, b) {
  return Math.max(
    (Math.abs(b.pressure - a.pressure) * Math.PI * 20) / 180,
    Math.abs(b.portafilter - a.portafilter) * 90,
    (Math.abs(b.steam - a.steam) * Math.PI * 24) / 180,
    (Math.abs(b.grind - a.grind) * Math.PI * 13) / 180,
  );
}
