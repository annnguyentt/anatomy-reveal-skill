# Any object

The skill works for any physical thing the user names or shows: electronics, kitchenware, footwear, furniture, instruments, tools, toys, vehicles, jewellery, packaging, food, plants. The example in `template/` happens to be an espresso machine. Every object goes through the same steps: real dimensions, a parts list grouped by how it really comes apart, convex parts, one or two features that move.

## Choosing the anatomy

Ask what the object is made of and how it would come apart on a bench. That order is the explode.

| Kind | What comes apart | What moves in the feature beat |
|---|---|---|
| Electronics (phones, cameras, speakers, consoles) | Shell panels, screen stack, boards, battery, buttons, screws | A door, a card, a dial, a button, a stand |
| Kitchenware (kettle, teapot, mixer, coffee maker) | Body, lid, handle, spout, base, element, gaskets; for an espresso machine (the template): hopper, top, control head, side panels, boilers, pump, grinder motor | The lid lifts, a switch flips, a jug slides off its base |
| Footwear and bags | Outsole, midsole, insole, upper panels, tongue, laces, eyelets, zips | Laces loosen, a strap opens, a zip pull runs |
| Furniture (chair, lamp, table, shelf) | Legs, rails, seat, back, joints, fittings, shade, bulb | A lamp arm folds, a drawer slides, a seat tilts |
| Instruments (guitar, trumpet, keyboard) | Body, neck, frets, pickups, bridge, tuners; tubes, valves, slides | A tuner turns, a valve presses, a key goes down |
| Tools (drill, wrench, scissors, knife) | Housing halves, motor, gears, chuck, battery, blades, pivot | The chuck turns, the blades open, the trigger moves |
| Toys and figures | Shell halves, limbs on pins, joints, mechanism | A limb swings, wheels turn |
| Vehicles (bike, scooter, car, plane) | Frame or body, wheels, suspension, drivetrain, seat, controls | Wheels turn, a door or the steering moves |
| Jewellery and watches | Case, bezel, crystal, dial, hands, movement, crown, strap or links | The crown turns, the bezel clicks, the clasp opens |
| Packaging (bottle, perfume, can, box) | Cap, pump, collar, body, label band, insert | The cap twists off, the box lid lifts |
| Natural things (fruit, flower, shell, seed) | Layers from the outside in: skin, flesh, core, seeds; petals, sepals, stamens | It splits along its natural seams, petals open |

For something without an inside (a solid ornament, a coin), the anatomy is its layers of manufacture: base form, inlays, plating, engraving, stand.

## Shapes from convex parts

The 3D mode draws convex parts only. Everything else is built from them.

| Shape | Build it as |
|---|---|
| Box, panel, slab | `prismX/Y/Z` of a rounded polygon. Clip a big outline with half-planes to get a rim round an opening. |
| Cylinder, disc, cone, button, dial | `round` on any axis; `details.ribs` for knurls, `seams` for bands. |
| Turned body (bottle, vase, kettle, lens, bell) | A stack of `round` frustums with `r: [r0, r1]` (one per profile segment, flush), or `T.lathe` for one convex smooth body. Make 8–14 bands so the outline reads as a curve. |
| Sphere, dome, bulb, fruit | `T.ball`, with a flat where it sits on something. A lens cap is a large sphere cut by one flat. |
| Arch, ring, handle, frame tube | A chain of wedge prisms sharing their joint planes. A torus is wedges round a circle. |
| Bent tube, cable, spout, strap | `T.tube` along a route with gentle bends, or a chain of short rounds joined by small balls at the bends. |
| Organic, sculpted forms (shoe upper, grip, saddle, body panel) | Several convex pieces that meet flush, each a stretch of the surface: think of the seams a maker would cut. Rounded corners hide the facets. |
| Soft goods (fabric, cushions, laces) | Thick convex slabs with generous rounding, plus texture planes (knit hatching, stitching dashes). Laces are chains of thin rounds. |
| Thin flat things (labels, paper, film, leaves, petals) | Prisms 0.3–1 mm thick, or a plane drawn on a host part. |
| Text, logos, dials, screens, ornament | `T.plane` SVG on the face. Ornament can also have raised convex pieces. |
| Holes, grilles, vents, throats | A solid face with a dark drawing on it. |

## Scale

- **Small objects** (a ring, an earbud): build them at real size. The scene radius sets the fit, and macros zoom to 8× without losing line quality.
- **Large objects** (a car, a piano, a building): build at real size in millimetres, but group detail at the scale the film shows. Use a few hundred parts at most. Spend the detail on the two or three regions the macro shots visit, and keep the rest as clean large parts.
- **Sets or pairs** (earbuds in a case, a pair of shoes): one root group holding both, each its own sub-assembly.

## The feature beat

Pick the one movement a person does with the object most: open, twist, press, fold, pour, lace, wind. Build it as a `hinge`, `turn` or `slide` group, then declare it in `object/film.mjs`:
- its channel in `FEATURE_DEFAULTS`;
- its key in `FEATURE_KEYS`, so the figure page gets it too;
- how it maps to groups in `featureValues`;
- how far it moves a part in `featureTravel`.

Objects with no moving part can use the explode as their feature, or a slow orbit of a detail.
