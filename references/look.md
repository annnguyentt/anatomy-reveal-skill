# The look

## Paper

The film and the light anatomy page are drawn on warm white paper in the kit's light theme: dark ink outlines over four-tone fills.

`motion/look.css` builds the paper from CSS alone, with nothing bitmapped:
- a base of `#f1ece2`;
- fine grain and long fibres from SVG `feTurbulence` tiles;
- a slow mottling;
- a soft lighter patch where the object is (the `glow` channel);
- a faint warm vignette.

The plate (Fig number, title, hint, readout) is set in a small mono font in dark ink. `node motion/build.mjs --no-plate` drops it.

## Materials

Each part names a material. A material is a ramp of 19 colours for the light theme and 19 for the dark one:
- paper, face, top;
- four facing shades, `shade-0` to `shade-3`;
- lit-top, lit-shade;
- the line tones `hi`, `mid`, `lo`, `faint`;
- `dot`, `lit`;
- four tube colours.

| Material | For |
|---|---|
| `gold`, `chrome`, `steel`, `gunmetal`, `brass`, `copper` | Metals. |
| `rubber` | Grips, seals, black plastics. |
| `glass` | Lenses, filters, screens' cover glass. |
| `pcb`, `sensor` | Boards, image sensors. |
| `signal` | A red for record buttons and accents. |
| `porcelain` | Soft-touch white plastics. |
| `lavender` | An anodised pastel (copy it to make other colours). |
| `knit` | Fabrics, meshes, cushions. |
| `coffee`, `bean`, `milk` | Espresso and latte layers, roasted beans, milk and foam. |
| `smoke` | Smoked or tinted glass (a bean hopper, a sunglass lens). |

**A new colour** is a new entry in `T3_MATERIALS` in `kit/turn.mjs`, keeping each ramp ordered from dark to light so faces still read by facing.

**Recolouring for one film only** is a rule in `motion/look.css`, scoped as `.iso.mo [data-mat="name"]{--anatomy-shade-0:…}`.

## Lines and detail

- **Outlines:** the kit's strokes are 0.6 px at any zoom. Use `tone: "hi"` for the subject, `"mid"` and `"faint"` for big soft parts that shouldn't read as a cage of edges (a long panel in many segments).
- **Small detail is what a macro is for:** screw heads, knurls, numerals, stitching, mesh weave, engraving. Every region a shot visits needs some, and each piece of detail belongs to a real part.
- **Colour inside face drawings** can be set directly in `style` (gold `#d8b25a`, polished chrome `#e4e3ea`) when it must not change with the theme.
