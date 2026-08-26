# Canvas UI (vendored)

Source files copied from [Canvas UI](https://canvasui.dev) by David Haz
([DavidHDev/canvas-ui](https://github.com/DavidHDev/canvas-ui)), the vanilla
TypeScript build. Canvas UI is distributed shadcn-style: the CLI copies source
into the project rather than adding a runtime dependency, so these live in the
repo and are ours to edit.

`LICENSE.md` is the upstream MIT + Commons Clause license, kept verbatim. The
Commons Clause forbids selling or redistributing the components themselves.
Using them inside this site is explicitly allowed.

| File | Upstream path |
| --- | --- |
| `rect-cache.ts` | `src/lib/rect-cache.ts` |
| `DecryptRevealVanilla.ts` | `src/lib/DecryptReveal/DecryptRevealVanilla.ts` |
| `DisplacementVanilla.ts` | `src/lib/Displacement/DisplacementVanilla.ts` |
| `GlyphRainVanilla.ts` | `src/lib/GlyphRain/GlyphRainVanilla.ts` |
| `GridVanilla.ts` | `src/lib/Grid/GridVanilla.ts` |
| `RetroDitherVanilla.ts` | `src/lib/RetroDither/RetroDitherVanilla.ts` |

Only the `rect-cache` import path changed, from `../rect-cache` to
`./rect-cache`, since the flat layout here drops the per-component folders.
`GlyphRainVanilla.ts` has no imports at all and is byte-identical to upstream.
Do not reformat these files. Keeping them byte-identical to upstream apart from
that one line is what makes re-pulling a fix from upstream a diff instead of a
merge.

Both effects need the experimental `html-in-canvas` API (`drawElementImage` +
`canvas.requestPaint`), which today means Chrome with
`chrome://flags/#canvas-draw-element` or an origin trial token. Everywhere else
`supportsHtmlInCanvas()` returns false and `CanvasEffect.astro` leaves the plain
HTML alone.
