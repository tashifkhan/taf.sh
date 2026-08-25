## Development

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
- Design tokens (warm grayscale palette) live in `src/styles/global.css` under `@theme` — use the semantic utilities: `bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-secondary`, `text-muted`, `text-faint`
- Every token is a `light-dark()` pair, so the palette follows the `color-scheme` on `<html>`. `ThemeScript.astro` (inline, in `<head>`) carries the pre-stylesheet critical block — a `color-scheme` meta, the canvas background/foreground, and `a { color: inherit }` — then applies the stored override by setting both `data-theme` and an inline `color-scheme`. Without it the UA paints white with blue/purple links until `global.css` lands. Its hex values duplicate the `--color-background`/`--color-foreground` tokens by necessity (a token can't style the page before the stylesheet exists) — keep them in sync. `ThemeToggle.astro` (in the nav) switches system/light/dark, persists to `localStorage["taf-theme"]`, and must keep that inline `color-scheme` in step since it outranks `global.css`. System is the default — no `data-theme` attribute is set. Outside that one block, never hardcode hex colors in page markup
- Teal is the single accent: `text-accent`, `bg-accent` + `text-accent-contrast` (fills), `bg-accent-soft` (tints), `border-accent`, `text-accent-strong`. Use it sparingly — `[*]` markers, `Fig N.` captions, terminal `$` prompts and cursor, primary CTAs, link hovers, focus rings
- Conventions: monospace accents with `[*]` list markers, `Fig N.` stat captions, terminal-style cards, otherwise monochrome

## Motion

Every motion the site depends on is CSS — no animation library, no client router. The two Canvas UI effects on the homepage hero are the one exception, and they are decoration that most visitors never download (see below).

- Navigation uses native **cross-document view transitions** (`@view-transition { navigation: auto }` in `global.css`). The page body sinks out and rises in; the sticky nav is pulled out of the root snapshot with `view-transition-name: site-nav` so it holds still
- Product names morph between the index list and the product `<h1>`: both ends set `view-transition-name: product-<id>` plus `view-transition-class: product-title`. New product pages must pass a matching `id` to `ProductPage` and add the same `id` to the `products` array in `index.astro`
- Theme switching runs through `document.startViewTransition({ types: ["theme"] })`, and `:active-view-transition-type(theme)` swaps the slide for a cross-fade
- Section entrances use the `.reveal` utility — a scroll-driven animation (`animation-timeline: view()`), no IntersectionObserver. Note the `--reveal-timeline` indirection in `global.css`: without it Lightning CSS folds the timeline into the `animation` shorthand, a form browsers reject
- Transition defaults (`180ms`, `--ease-site`) come from `@theme`, so bare `transition-colors` utilities are already on-brand
- Everything above is disabled under `prefers-reduced-motion: reduce`, in CSS and in the theme-toggle script

## Canvas UI effects

Two WebGL effects run on the homepage hero: Displacement on the `<h1>`, DecryptReveal on the terminal card. Both come from [Canvas UI](https://canvasui.dev), vendored into `src/lib/canvas-ui/` because the library ships shadcn-style rather than as an npm package. `src/lib/canvas-ui/README.md` records what was changed and why. Do not reformat those files.

- Both need the experimental html-in-canvas API, so they run only in Chrome with `chrome://flags/#canvas-draw-element` or an origin trial token. Every other browser gets the plain HTML, untouched. That is the intended fallback, not a degraded one
- `src/components/canvas/CanvasEffect.astro` is the only entry point. It probes for support with a local copy of the check so the effect modules stay behind a dynamic import — an unsupported browser downloads ~3.8kB and stops, never the ~27kB of shader chunks
- The wrapper pins its own height and syncs it with a `ResizeObserver`, because content moves into an absolutely positioned canvas. Upstream instead stretches to `height: 100%` and assumes a fixed-size caller
- DecryptReveal's `color` and `background` options are resolved from `--color-accent` and `--color-background` at runtime through a throwaway probe span, since reading a `light-dark()` custom property returns the unresolved function. They are re-pushed when `data-theme` changes. Do not hardcode hex here either
- Never wrap an element that carries a `view-transition-name` — the product `<h1>` morph breaks if its element moves into a canvas
- Reduced motion skips the upgrade entirely

## Structure

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
