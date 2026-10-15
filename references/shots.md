# The film

A film, 10 seconds and 9:16 by default, in one continuous take: **drift, whip, hold**, repeated, then the object comes apart and back together. The output is 30 fps at 1080 × 1920, or 1080 × 1350, 1080 × 1080 or 1920 × 1080 with `--ratio 4:5`, `1:1` or `16:9`. Whips are about 0.24 s with heavy motion blur, holds 0.6–1 s, and the only stillness is the last second.

## Beats

The template's espresso machine plays these beats:

| t (s) | Beat | What it shows |
|---|---|---|
| 0.00–1.62 | **Tumble in** | The object seen from behind and a little above, rolled about −30°. It turns about 180° in yaw into a three-quarter front view while its roll rights itself, filling about 60% of the width. Slow start, fastest mid-way, settling. |
| 1.62–1.72 | Breath | A tiny drift. |
| 1.72–1.96 | **Whip 1** | Onto the richest detail at 4–8× (the bean hopper). |
| 1.96–2.76 | **Macro slide** | A slow slide across that detail. |
| 2.76–3.00 | **Whip 2** | To a second detail: a gauge, a control, a logo plate. |
| 3.00–4.00 | **Hold** | That detail large, slightly rolled, a slow push in. Something on it moves (the gauge needle rises to brew pressure). |
| 4.00–4.24 | **Whip 3** | To a control on another face (the steam knob on the side). |
| 4.24–4.92 | **Hold** | The control turns. |
| 4.92–5.16 | **Whip 4** | To the feature. |
| 5.16–6.40 | **Feature** | Something real happens and comes back: the portafilter twists to unlock, drops out of the group head, and locks in again. |
| 6.40–6.85 | **Pull out** | Back to the whole object, three-quarter from above. |
| 6.93–7.33 | **Explode** | It comes apart fast (ease-out). |
| 7.33–8.25 | **Hold** | Apart, drifting: a slow yaw of 10–15° and a slight zoom out. |
| 8.25–8.90 | **Implode** | Back together while turning to face the viewer. A feature can settle into its hero pose. |
| 8.90–10.00 | **Hero** | Front, a slight three-quarter, about 75% of the width. A slow push that eases out to stillness. |

Adapt the details and the feature to the object; keep the rhythm.

## Length

`node motion/build.mjs --duration <seconds>` (3–60) retimes the film:
- keys are written on the 10 s base (`BASE_DURATION`);
- segments that ease into a `whip` key keep their length;
- every other segment stretches or compresses by the same factor, so a longer film breathes instead of playing in slow motion;
- labels move with the keys, and `DURATION` becomes the real total.

The renderer and `scan.mjs` read it from the page.

## Ratio

`node motion/build.mjs --ratio <9:16|4:5|1:1|16:9>` sets the frame. Keys are written once, for 9:16; the other ratios reuse them:
- one viewBox unit is one CSS pixel at every ratio, so a macro looks the same and only the frame around it changes;
- wide shots (zoom under about 2.6) zoom out by `min(1, width / 540, height / 760)` so the whole object and its explode stay in a shorter frame; macros (zoom over about 4.6) keep their zoom, and the two blend in between (`fitZoom` in `motion/timeline.mjs`);
- the renderer and `scan.mjs` read the size from the page.

Check every ratio you deliver with stills before rendering.

Below about 3 s the holds get too short to read. Above about 12 s a single object turn feels slow, so add beats:
- a second macro pass;
- a cross-section hold;
- a second feature;
- a longer explode hold with a slow orbit.

Then write their keys on the base timeline.

## The timeline (`motion/timeline.mjs`)

The film is a pure function of time. `at(t)` returns the state and `frame(t)` draws it, so any frame renders on its own.

`KEYS` is a list of `{ t, …channels, ease }`. Each channel keeps its own keys, and a key that leaves a channel out leaves it to its neighbours. **A channel that first moves mid-film needs a value at t = 0**, or its first value holds from the start.

| Channel | Meaning |
|---|---|
| `yaw` | Degrees about the screen vertical. 0 = the object's front (+y) faces the viewer; 90 = its right (+x) faces the viewer. Keep it continuous: write 464 rather than 104 when the short way round passes 360. |
| `pitch` | Degrees about the screen horizontal. Positive = seen from above. |
| `roll` | Degrees about the view axis. |
| `zoom` | 1 = the scene's fit; interpolated in log space. Macros are 5–8. |
| `focus` | An anchor name (or a local point) the frame centres on. It is interpolated in object space and projected with the current rotation, so a close-up stays on its subject while the object turns. |
| `panX`, `panY` | Screen offset at zoom 1 (divided by zoom). Positive `panY` moves the view down, so the object rises. |
| `apart` | 0…1 through `explodeValues()`. |
| feature channels | Declared in `object/film.mjs` (`FEATURE_DEFAULTS`) and mapped to groups by `featureValues()`. |
| `glow` | `[x, y, r]` of the soft light on the paper, as fractions of the frame. |

`ease` is the ease *into* that key:

| Ease | Use |
|---|---|
| `whip` | Subject changes. |
| `io` | Pull-outs and the implode. |
| `o` | Explode and settle. |
| `si`, `so` | The tumble's start and end. |
| `lin` | Drifting holds. |

`LABELS` set the plate's corners per beat. `{parts}`, `{assemblies}` and any key in the object's `counts` are filled in from the build.

## Framing

Never guess an angle. Render candidates and choose:

```sh
node motion/render.mjs poses '[{"yaw":-52,"pitch":30,"zoom":4.4,"focus":"hopper"},{"yaw":-16,"pitch":6,"zoom":6.6,"focus":"gauge","pressure":120}]' out/p
```

Then write the winner into the keys and check the beats:

```sh
node motion/render.mjs stills 0,0.6,1.2,1.7,2.3,3.5,4.6,5.6,6.85,7.3,7.9,8.5,10 out/s
```

**What to check:**
- Size: the share of the frame width the object fills.
- Position.
- Nothing important cut off by the frame.
- The feature visible.
- The explode readable at its angle.

## Motion blur and encode

`speed(t)` measures how far the picture moves in one frame, in output pixels:
- the object's bounding-box corners and anchors, ignoring any that are off screen in both frames;
- every sliding assembly;
- the feature travel.

`render.mjs blur` then gives each frame `ceil(speed / step)` sub-frames, at most `most`, spread over the whole frame interval (a 360° shutter). `encode.mjs` averages each frame's sub-frames and writes H.264.

A fixed 4:1 blend would show separate copies on whips, so keep the adaptive shutter.
