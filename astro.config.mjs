// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	/*
	 * The canonical origin. Two things depend on it: the <link rel="canonical">
	 * and og:url tags every page emits, and the sitemap the integration below
	 * writes. Keep it set to the production origin.
	 */
	site: 'https://taf.sh',
	integrations: [
		sitemap({
			// Client proposals are private deliverables, so they stay out of the
			// sitemap and carry their own noindex meta tag.
			filter: (page) => !['/proposals', '/404', '/products/cliniq'].includes(new URL(page).pathname.replace(/\/+$/, '')),
		}),
	],
	// CliniQ was renamed to rah.clinic; keep the old product URL working.
	redirects: {
		'/products/cliniq': '/products/rah-clinic',
	},
	server: {
		// Dev only: lets the server answer when reached through `tailscale serve`
		// (https://<machine>.<tailnet>.ts.net). Production is the Worker build.
		allowedHosts: ['.ts.net'],
		// IPv4 loopback, which is where `tailscale serve` proxies to. Node
		// otherwise binds `localhost` to ::1 only and the proxy gets a 502.
		host: '127.0.0.1',
	},
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
