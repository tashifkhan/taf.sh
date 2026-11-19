/**
 * The landing kit for case-study pages. A page under src/pages/work wraps
 * its content in <Landing>, composes these, and adds its own markup where
 * the kit stops. Every piece reads the `--ld-*` tokens in landing.css, which
 * resolve from the site's theme tokens.
 */
export { default as Landing } from "./Landing.astro";
export { default as LandingHero } from "./LandingHero.astro";
export { default as Section } from "./Section.astro";
export { default as Shot } from "./Shot.astro";
export { default as LandingVideo } from "./LandingVideo.astro";
export { default as Pinned } from "./Pinned.astro";
export { default as MediaSwitcher } from "./MediaSwitcher.astro";
export { default as Rows } from "./Rows.astro";
export { default as Rail } from "./Rail.astro";
export { default as StoreRail } from "./StoreRail.astro";
export { default as Faq } from "./Faq.astro";
export { default as Routes } from "./Routes.astro";
export { default as Icon } from "./Icon.astro";
