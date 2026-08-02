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
- Fonts: IBM Plex Sans / IBM Plex Mono via `@fontsource/*`, imported in `src/layouts/Layout.astro`
- Design tokens (warm grayscale palette) live in `src/styles/global.css` under `@theme` — use the semantic utilities: `bg-background`, `bg-surface`, `border-border`, `text-foreground`, `text-secondary`, `text-muted`, `text-faint`
- Every token is a `light-dark()` pair, so the palette follows the `color-scheme` on `<html>`. `ThemeScript.astro` (inline, in `<head>`) applies the stored override before paint; `ThemeToggle.astro` (in the nav) switches system/light/dark and persists to `localStorage["taf-theme"]`. System is the default — no `data-theme` attribute is set. Never hardcode hex colors in page markup
- Teal is the single accent: `text-accent`, `bg-accent` + `text-accent-contrast` (fills), `bg-accent-soft` (tints), `border-accent`, `text-accent-strong`. Use it sparingly — `[*]` markers, `Fig N.` captions, terminal `$` prompts and cursor, primary CTAs, link hovers, focus rings
- Conventions: monospace accents with `[*]` list markers, `Fig N.` stat captions, terminal-style cards, otherwise monochrome

## Structure

- `src/layouts/Layout.astro` — base HTML shell (fonts, meta, Nav + Footer)
- `src/components/` — `Nav.astro`, `Footer.astro`, `Logo.astro` (shell-prompt mark: pixel `>` chevron + blinking accent block cursor), `ProductPage.astro` (shared layout for product pages)
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
