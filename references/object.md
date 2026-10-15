# Building the object

The object is built in the Anatomy kit's 3D mode (`kit/turn-build.mjs`):
- convex kit parts, re-projected and re-shaded every frame;
- painted in an order solved from separating planes.

The film turns the whole object through every angle and takes it apart, so a few rules matter more than in a still drawing. `template/object/geometry.mjs` follows all of them. Read it before you write a part.

## Frame and units

- **World units are real millimetres.**
- **The local frame is right-handed:**
  - x is the object's right (as worn, held or faced);
  - y is its front, the face that points at the viewer at yaw 0;
  - z is up.

  Check that x × y = z: a left-handed frame mirrors every view.
- **The root group** is `T.group("root", { free: { origin } })`. Put its origin at the object's visual centre, so tumbles turn about the middle.
- The scene fits a sphere of `FILM.radius` mm (in `object/film.mjs`). Set it to about 0.8 × the object's largest dimension. The film zooms with the viewBox and the kit's strokes don't scale, so lines stay hairlines at 8×.

## Groups

| Group | Use |
|---|---|
| `free` | The root, rotated every frame from yaw, pitch and roll in view space (`orient()`). |
| `slide` | An explode assembly: `assembly(name, direction, travel, delay, parent)`. One value, `apart` (0…1), drives every assembly through `explodeValues()`, a staggered smoothstep. Also used for drawers, cards and cushions. |
| `hinge` | Doors, lids, swivels, folding arms. An axis through a point, with a range in degrees. |
| `turn` | Dials and crowns, about the vertical of their parent's frame (`pivot: [x, y]`). |

Pairs inside one group get a plane fixed in that group, so their order is right at every angle. Pairs in different groups are solved at runtime with GJK.

## Convex parts, flush contacts

- **Every part is convex:**
  - `prismX/Y/Z`: a convex polygon extruded along an axis;
  - `round`: a cylinder or cone on any axis;
  - `T.ball` with flats: a sphere cut by planes, such as a lens cap.
- **Concave shapes are several convex parts.** A plate with a rectangular opening is four pieces: clip the outline by half-planes (see `clip()` in the example's rim). An arch is a chain of wedge segments sharing their joint planes.
- **Parts meet flush or with a gap, never sunk in.** `T.build` throws `interlock A × B` when they overlap. A button on a base starts at the base's top.
- **Hollow shells.** Anything that must come out cannot sit inside a solid. Build housings as dishes: a face plate, a rim in pieces round an opening, and a closing plate. The inner parts then sit in the cavity with clearance.
- **Faces with openings** (a lens throat, a grille, a screen) are a solid face with a dark `T.plane` drawing on it.

## Coming apart cleanly

- **Along any exit direction, the part in front leads.** If A sits in front of B along the direction they both move, A starts earlier (a smaller `delay`) and travels further.
- **Moving toward the centre:** parts that move toward the middle (two cushions facing each other) need their parent to move out first, or they meet.
- **Sideways exits:** a part leaving sideways must clear its neighbour's swept volume. A door's hinge sweeps a slab beside it, so whatever slides out through that door sits outside that slab.
- **Parallel neighbours keep about 1.5 mm of gap:** GJK samples round parts as polygons.
- **Prove it:** run `node object/scan-apart.mjs yaw pitch` from five views, and run `node motion/scan.mjs` on the finished film. Fix every `unseparated` with timing or geometry.
  - A `forced` pick on its own, in a frame that looks right at full size, is a harmless cycle among parts that barely overlap on screen.

**Travel.**
- Inner parts travel 8–30 mm, outer parts 30–60 mm, and decoration that flies off 40–80 mm.
- Read the explode at the film's own angle. A long object fans out along its axis; a column needs most of the travel along z, with the view pitched 20–30°.

## Markings and decoration

- **Text, ticks, screens, grilles, engraving and inlay** are `T.plane({ part, o, u, v, svg, normal })`.
  - `u` is the drawing's right and `v` its down, **seen from outside the face**.
  - Always pass `normal`.
  - The kit sets the font on `.iso-face-text`, so a face font goes in `style="font-family:…"`.
- **Raised decoration** is many small convex prisms (lenses, leaves, thorns) standing on the face, each in an assembly so it can lift off. Test them for overlap in the face plane first.
- **Fine textures** (knit, stipple, knurl) are thin `iso-line` paths in a plane. Ribs and knurls on rounds use `details.ribs`.

## Anchors and features

- `anchors` are named local points the film centres on: `body`, each face, each control, each feature. Add one for every shot.
- `features` is a list of extra group values (a swivel at several angles, a crown turned, a cushion off). The build proves the order in those states too.

## Cost

- A Hero has 100–150 parts.
- Rounds cost about three prisms each, and a ball with flats about nine.
- The template object builds in about 1 s and draws in 5–10 ms a frame in headless Chrome.
