// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	build: {
		/*
		 * Inline every stylesheet rather than linking it (Astro's default only
		 * inlines bundles under 4kB). A linked stylesheet is a second round trip
		 * that races the HTML, and Firefox only suppresses painting for ~250ms
		 * before it gives up and renders unstyled markup — which is exactly the
		 * flash this avoids. The whole payload is ~35kB raw / ~8kB over the wire,
		 * small enough that shipping it per page beats a cross-page cache hit.
		 */
		inlineStylesheets: 'always',
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
