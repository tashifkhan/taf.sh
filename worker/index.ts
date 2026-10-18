/**
 * Cloudflare Worker for taf.sh
 * - Canonical host redirects (www + workers.dev → taf.sh)
 * - Serves the Astro static build via Workers Assets
 * - Reverse-proxies /ph/* to PostHog EU (same-origin analytics)
 */

const DEFAULT_CANONICAL_HOST = "taf.sh";
const API_HOST = "eu.i.posthog.com";
const ASSET_HOST = "eu-assets.i.posthog.com";

/*
 * Versioned preview deploys (`wrangler versions upload`) are served at
 * `<version-prefix>-taf-sh.<subdomain>.workers.dev`. Those have to answer for
 * themselves, otherwise the canonical redirect below sends every reviewer
 * straight to production and the preview is unreviewable. The stable
 * `taf-sh.<subdomain>.workers.dev` alias still redirects, and previews are
 * noindexed instead so nothing here costs us a duplicate-content hit.
 */
const PREVIEW_HOST = /^[0-9a-z]+-taf-sh\.[^.]+\.workers\.dev$/;

function stripPhPrefix(pathname: string): string {
	// /ph -> /  |  /ph/static/x -> /static/x  |  /ph/e/ -> /e/
	if (pathname === "/ph") return "/";
	if (pathname.startsWith("/ph/")) return pathname.slice(3) || "/";
	return pathname;
}

function canonicalRedirect(url: URL, canonicalHost: string): Response | null {
	// Each deployment serves its configured host and redirects other aliases.
	if (url.hostname === canonicalHost) return null;
	if (PREVIEW_HOST.test(url.hostname)) return null;

	const target = new URL(url.toString());
	target.protocol = "https:";
	target.hostname = canonicalHost;
	target.port = "";

	return Response.redirect(target.toString(), 301);
}

async function proxyPostHog(
	request: Request,
	ctx: ExecutionContext,
): Promise<Response> {
	const url = new URL(request.url);
	const pathname = stripPhPrefix(url.pathname);
	const pathWithSearch = pathname + url.search;

	const isAsset =
		pathname.startsWith("/static/") || pathname.startsWith("/array/");

	if (isAsset) {
		const cacheKey = new Request(url.toString(), request);
		const cached = await caches.default.match(cacheKey);
		if (cached) return cached;

		const assetRes = await fetch(`https://${ASSET_HOST}${pathWithSearch}`, {
			method: request.method,
			headers: request.headers,
			redirect: "follow",
		});

		// Cache successful asset responses at the edge
		if (assetRes.ok) {
			ctx.waitUntil(caches.default.put(cacheKey, assetRes.clone()));
		}
		return assetRes;
	}

	const ip = request.headers.get("CF-Connecting-IP") || "";
	const headers = new Headers(request.headers);
	headers.delete("cookie");
	headers.delete("host");
	headers.set("X-Forwarded-For", ip);

	const body =
		request.method !== "GET" && request.method !== "HEAD"
			? await request.arrayBuffer()
			: null;

	return fetch(`https://${API_HOST}${pathWithSearch}`, {
		method: request.method,
		headers,
		body,
		redirect: "follow",
	});
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		const redirect = canonicalRedirect(
			url,
			env.CANONICAL_HOST ?? DEFAULT_CANONICAL_HOST,
		);
		if (redirect) return redirect;

		// PostHog reverse proxy
		if (url.pathname === "/ph" || url.pathname.startsWith("/ph/")) {
			return proxyPostHog(request, ctx);
		}

		const response = await env.ASSETS.fetch(request);

		if (env.NOINDEX || PREVIEW_HOST.test(url.hostname)) {
			const headers = new Headers(response.headers);
			headers.set("X-Robots-Tag", "noindex, nofollow");
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers,
			});
		}

		return response;
	},
};
