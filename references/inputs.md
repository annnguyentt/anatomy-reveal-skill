# From a photo or a name to a parts list

The figure and the film are only as good as the facts behind them. Spend the first part of the job here, and write the result down as a spec before you write geometry.

## Case A: an image of the object

1. **Read the picture, region by region.** Outline and proportions (measure ratios in pixels), every visible part and how it meets its neighbours, materials (anodised, painted, polished, rubber, fabric, glass), colours, surface decoration, text and markings, and controls, ports, seams and screws.
2. **Several images** (front, side, back) show the depth and the hidden faces. Note what no image shows, then infer it from how such objects are built.
3. **Identify it if you can.** If it is a known product (even a customised one), look up its real dimensions and internals as in case B. The photo then decides finish and decoration; the research decides size and structure.
4. **Otherwise, scale from a known feature.** A USB-C port is 8.4 mm wide, a portafilter basket 58 mm across, a camera lens mount about 60 mm across, a phone about 72 mm wide. State the assumption.
5. **Decoration:**
   - **Engraving, filigree, print, patterns:** redraw them as geometry: smooth SVG paths in the plane of the face, plus a few raised convex pieces for relief. Build scrolls from spirals, tapered ribbons and leaves as convex lenses, and test raised pieces against each other in the face plane so they never overlap.
   - **Colour:** pick a material per region and recolour its ramp if needed (`references/look.md`). Never sample the photo's pixels into the drawing.
6. **Nothing from the photo is used as imagery.** No tracing, no texture, no embedded bitmap.

## Case B: only a name

1. **Pin down the exact object.** Expand the name to model, generation and variant. If it's ambiguous, choose the most common one and say so.
2. **Collect the numbers:**
   - overall width, height and depth;
   - the main sub-dimensions (a lens's diameter and length, a cup's outline, a screen's diagonal and bezel, a strap's width);
   - the counts of buttons, dials, ports, screws and vents.

   Manufacturer spec sheets are best, then reviews with measurements, then teardowns.
3. **Collect the behaviour:** what turns, slides, opens, folds, detaches, lights up. One or two of these become the film's feature beat.
4. **Collect the inside:** teardowns list the boards, chips, batteries, drivers, sensors and how the shell comes apart. That order becomes the explode order.
5. **No web access:** use what you know, mark every estimate in the spec, and prefer a well-known variant whose numbers you are sure of.

## The spec

Write it in a few lines before any code:

```
Object: dual-boiler espresso machine with a built-in conical burr grinder (brushed steel)
Size: 380 × 415 × 470 mm with the hopper; control head 94 mm deep; group head 80 mm across
Materials: brushed steel shell, chrome knobs and trim, smoked glass hopper, rubber grips, glass tank
Moves: portafilter twists 30° to unlock and drops; gauge needle rises; knobs turn
Inside: coffee boiler, steam boiler, vibration pump, solenoid valve, grinder motor, control board
Parts (≈80): shell 7 · cheeks 2 · head, badge, gauge ×3, knobs ×3 (skirt, body), buttons ×5 · group, portafilter ×7
  · tray, grille, glass ×5, wand ×5 · hopper ×7 · tools ×5 · tank ×2 · boilers ×6, pump ×3, valve ×3, motor ×2, board ×7
Film features: hopper and gauge in macro (needle rises), steam knob turns, portafilter unlocks and back
```

Show the spec to the user when it rests on guesses: a wrong size or a missing button is cheap to fix now and expensive later.
