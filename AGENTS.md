## Development

Deploy the current working tree to `https://taf.sh` with `bun run deploy`.
This targets the production `taf-sh` Worker.
Regenerate Worker binding types after configuration changes with `bunx wrangler types worker/worker-configuration.d.ts --include-runtime false`.

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project overview

taf.sh is the company/consultancy site (sole proprietorship) — multi-page, static, OpenCode-inspired dark design. It showcases three products: TalentSync AI (job seekers), TalentSync HR (recruiters), and CliniQ (clinical WhatsApp platform).

## Stack & styling

- Astro (static) + Tailwind CSS v4 via `@tailwindcss/vite` (plugin wired in `astro.config.mjs`)
- `build.inlineStylesheets: 'always'` — no page links a stylesheet, every rule ships inside the HTML. A linked stylesheet is a second round trip racing the markup, and Firefox only suppresses painting for ~250ms before rendering unstyled HTML anyway. Costs ~12kB gzipped per page and buys a guarantee: there is no moment where the document exists without its styles. Don't revert it to `auto` to save bytes
- Fonts: IBM Plex Sans / IBM Plex Mono via `@fontsource/*`, imported in `src/layouts/Layout.astro`
- Design tokens (warm grayscale palette) live in `src/styles/global.css` under `@theme` (light values are the default) — use the semantic utilities: `bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-secondary`, `text-muted`, `text-faint`. Dark values are scoped overrides: OS preference via `prefers-color-scheme`, the visitor's choice via `html[data-theme]`, either half of the reel via `.t-dark`/`.t-light`. Never use `light-dark()` in bundled CSS — the minifier strips its comma and invalidates the token, which is how `bg-accent` once lost its pairing with `text-accent-contrast`. `ThemeScript.astro` (inline, in `<head>`) carries the pre-stylesheet critical block — a `color-scheme` meta, the canvas background/foreground, and `a { color: inherit }` — then applies the stored override by setting both `data-theme` and an inline `color-scheme`. Without it the UA paints white with blue/purple links until `global.css` lands. Its hex values duplicate the `--color-background`/`--color-foreground` tokens by necessity (a token can't style the page before the stylesheet exists) — keep them in sync. `ThemeToggle.astro` (in the nav) switches system/light/dark, persists to `localStorage["taf-theme"]`, and must keep that inline `color-scheme` in step since it outranks `global.css`. System is the default — no `data-theme` attribute is set. Outside that one block, never hardcode hex colors in page markup (`.t-dark`/`.t-light` excepted — they live in `global.css`)
- Teal is the single accent: `text-accent`, `bg-accent` + `text-accent-contrast` (fills), `bg-accent-soft` (tints), `border-accent`, `text-accent-strong`. Use it sparingly — `[*]` markers, `Fig N.` captions, terminal `$` prompts and cursor, primary CTAs, link hovers, focus rings
- Conventions: monospace accents with `[*]` list markers, `Fig N.` stat captions, terminal-style cards, otherwise monochrome

## Motion

Most page motion is CSS, with small canvas and pointer effects in `src/scripts/studio.ts`. Navigation uses browser transitions rather than a client router.

- Navigation uses native **cross-document view transitions** (`@view-transition { navigation: auto }` in `global.css`). The current page pulls back while the destination slides over it in 650ms, from the right on desktop and below on smaller screens, like the work panel. `view-transition-name: site-nav` keeps the header still. `PageTransitions.astro` adds CSS exit/entrance classes around normal document navigation in browsers without native support. Its `[data-page-content]` wrapper excludes the header; hash links, downloads, external links and modified clicks keep their normal behavior
- Product names morph between the index list and the product `<h1>`: both ends set `view-transition-name: product-<id>` plus `view-transition-class: product-title`. New product pages must pass a matching `id` to `ProductPage` and add the same `id` to the `products` array in `index.astro`
- Theme switching runs through `document.startViewTransition({ types: ["theme"] })`, and `:active-view-transition-type(theme)` swaps the slide for a circular reveal that grows from the pressed toggle button. While `html[data-theme-switch]` is set, every element drops its `view-transition-name`, so the header and product titles are revealed with the rest of the page
- Section entrances use the `.reveal` utility — a scroll-driven animation (`animation-timeline: view()`), no IntersectionObserver. Note the `--reveal-timeline` indirection in `global.css`: without it Lightning CSS folds the timeline into the `animation` shorthand, a form browsers reject
- Transition defaults (`180ms`, `--ease-site`) come from `@theme`, so bare `transition-colors` utilities are already on-brand
- Everything above is disabled under `prefers-reduced-motion: reduce`, in CSS and in the theme-toggle script

## Canvas UI effects

Canvas UI supplies the ambient effect on each product page body: RetroDither on TalentSync, Grid on TalentSync HR, and GlyphRain on rah.clinic. The homepage hero uses its own canvas field in `src/components/studio/Hero.astro`. Canvas UI source lives in `src/lib/canvas-ui/` because the library ships as copy-in components rather than an npm package. `src/lib/canvas-ui/README.md` records what was changed and why. Do not reformat those files.

- Product pages pick theirs with `ProductPage`'s `bodyEffect` prop; the tuning lives in `BODY_OPTIONS` in that file. All three sit over running text, so they run well below their upstream defaults — `baseStrength: 0`, `idleRipples: 0` and `dim: 0.12` respectively, each chosen so the page is legible at rest and only reacts under the pointer
- All of them need the experimental html-in-canvas API, so they run only in Chrome with `chrome://flags/#canvas-draw-element` or an origin trial token. Every other browser gets the plain HTML, untouched. That is the intended fallback, not a degraded one
- `src/components/canvas/CanvasEffect.astro` is the only entry point. It probes for support with a local copy of the check so the effect modules stay behind a dynamic import — an unsupported browser downloads ~2kB and stops, never the ~5kB shader chunk for that page
- The wrapper pins its own height and syncs it with a `ResizeObserver`, because content moves into an absolutely positioned canvas. Upstream instead stretches to `height: 100%` and assumes a fixed-size caller
- Colors are resolved from the CSS tokens at runtime through a throwaway probe span, so subtrees pinned with `.t-dark`/`.t-light` (the reel halves) resolve their own values. They are re-pushed when `data-theme` changes. Do not hardcode hex here either. GlyphRain, Grid and RetroDither want `[r, g, b]` floats rather than CSS strings, which is what `resolveTriplet` is for
- The six `*Object` components in Canvas UI are the only ones that work without the flag, and every one of them imports three.js. That is roughly 170kB gzipped against a 3.6kB page, so they stay out
- Never wrap an element that carries a `view-transition-name` — the product `<h1>` morph breaks if its element moves into a canvas
- Reduced motion skips the upgrade entirely

## ASCII art

`src/components/AsciiArt.astro` plays pieces from the [ascii-magic](https://www.ascii-magic.com/ascii) library (MIT), copied into `src/lib/ascii-magic/`. Current uses: the CI pipeline figure in `Process.astro`, the pulse divider in `StudioFooter.astro`, the fortune cookie on `/about`, a tashif.codes terminal on `/work` (written for this site, in `own/`) and the broken link cloud on the 404 page.

- The build renders one frame into a `<pre>`, so the art shows without JS and under reduced motion. The client script imports a piece once it is near the viewport and pauses it off screen
- `render.ts` folds each piece's hex palette into the text tokens by lightness, with saturated green and blue mapped to the accent. Never pass the hex colours through
- The `<pre>` uses Menlo/Consolas, not Plex Mono. The Fontsource subset has no box-drawing glyphs, and mixing fonts knocks the frames out of line
- Block-shaded pieces (the mascots, the photo halftones) turn to grey mush once the hues are folded into tokens. Prefer line-art pieces

## Indexing and metadata

`site: 'https://taf.sh'` in `astro.config.mjs` is the single source of the canonical origin, and everything below keys off it. Keep it the apex.

- `StudioLayout.astro` is the only `<head>` on the site (`Layout.astro` predates the studio rebuild and nothing renders it). It emits `<link rel="canonical">` and `og:url` from `Astro.url.pathname` resolved against `site`, plus `og:site_name`, `og:image` (the `icon-512.png` mark) and `twitter:card`. Both resolve against `site` so version preview URLs still point to the production page
- The same file emits one `ProfessionalService` JSON-LD node sitewide. Its name, email and `sameAs` profiles have to match the footer, so update both together. Pages passing `noindex` skip it
- `noindex` is a prop on `StudioLayout` and forwarded by `PageLayout`. `/proposals` sets it: that page is a client deliverable, not a landing page
- `@astrojs/sitemap` writes `sitemap-index.xml` and filters out `/proposals`. `/robots.txt` is a static file in `public/` and points at the absolute index URL
- `public/robots.txt` disallows nothing deliberately. Version previews serve the same file, and a `Disallow` would block the crawl that the Worker's `X-Robots-Tag: noindex` header depends on. For the same reason `/proposals` is noindexed by meta tag rather than by a rule: a blocked URL can still be listed without its content ever being read
- When adding a page, the sitemap and canonical tags come for free. Only reach for `noindex` if the page should stay out of the index

## Structure

- `src/layouts/StudioLayout.astro` — the HTML shell: head, metadata, theme script, page transitions, film grain. Every page goes through it, directly or via `PageLayout`
- `src/layouts/Layout.astro` — base HTML shell (fonts, meta, Nav + Footer)
- `src/components/` — `Nav.astro`, `Footer.astro`, `Logo.astro` (shell-prompt mark: pixel `>` chevron + blinking accent block cursor), `ProductPage.astro` (shared layout for product pages)
- Inline `<svg>` needs `width`/`height` attributes alongside its sizing class. An SVG with only a `viewBox` lays out at 100% of its container, so while the stylesheet is in flight the mark fills the viewport; the attributes are the CSS-less fallback and the class still wins once styles land
- `src/pages/` — `index`, `services`, `about`, `contact`, `products/{talentsync,talentsync-hr,cliniq}`, `design/` (design lab)
- New product pages should use the `ProductPage` component to stay consistent

## Design lab

`/design` is a noindexed exploration page for redesign directions. Variants live in `src/components/designs/` (self-contained `.astro` files with scoped styles, shared copy from `data.ts`) and are registered in `src/pages/design/index.astro`. Round 1: Terminal+, Blueprint, Man page, Ledger. Round 2 adds Broadsheet, Bauhaus, Zine, Tategaki, Chat, Wayfinding, Wiki, Deco, Riso. Round 3 adds Label, Patent, Teletext, Desktop, Museum, Gamebook, Ticker, Cassette. Display fonts come from `@fontsource/*` imported inside each variant, never in the main `Layout.astro`. Deep-link a variant with `/design?v=<id>` or `#<id>`; selection persists in localStorage.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
