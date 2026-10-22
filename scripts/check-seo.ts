import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { reel } from "../src/components/studio/data";
import { canonicalPath, normalizePath, pageMetadata } from "../src/lib/seo";

const root = new URL("../dist/", import.meta.url).pathname;
const files: string[] = [];
async function walk(dir: string) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const file = join(dir, entry.name);
		if (entry.isDirectory()) await walk(file);
		else if (file.endsWith(".html")) files.push(file);
	}
}
await walk(root);
const sitemap = await readFile(join(root, "sitemap-0.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const seenTitles = new Set<string>();
const seenDescriptions = new Set<string>();
let checked = 0;
for (const file of files) {
	const path = normalizePath(`/${file.slice(root.length).replace(/index\.html$/, "").replace(/^404\.html$/, "404")}`);
	if (path === "/products/cliniq") continue;
	const html = await readFile(file, "utf8");
	const meta = new Map<string, string>();
	const links: string[] = [];
	const ids = new Set<string>();
	let title = "";
	let json = "";
	let canonical = "";
	let h1 = 0;
	await new HTMLRewriter()
		.on("title", { text(chunk) { title += chunk.text; } })
		.on("meta", { element(element) { meta.set(element.getAttribute("name") ?? element.getAttribute("property") ?? "", element.getAttribute("content") ?? ""); } })
		.on('link[rel="canonical"]', { element(element) { canonical = element.getAttribute("href") ?? ""; } })
		.on("a[href], img[src]", { element(element) { links.push(element.getAttribute("href") ?? element.getAttribute("src") ?? ""); } })
		.on("[id]", { element(element) { ids.add(element.getAttribute("id")!); } })
		.on("h1", { element() { h1++; } })
		.on('script[type="application/ld+json"]', { text(chunk) { json += chunk.text; } })
		.transform(new Response(html)).text();
	assert(title && !seenTitles.has(title), `Missing or duplicate title: ${file}`);
	assert(meta.get("description") && !seenDescriptions.has(meta.get("description")!), `Missing or duplicate description: ${file}`);
	seenTitles.add(title);
	seenDescriptions.add(meta.get("description")!);
	assert.equal(h1, 1, `Expected one h1: ${file}`);
	assert.equal(canonical, `https://taf.sh${canonicalPath(path)}`, `Canonical: ${file}`);
	assert.equal(meta.get("og:url"), canonical);
	assert.equal(meta.get("og:title"), title);
	assert.equal(meta.get("twitter:title"), title);
	assert.equal(meta.get("twitter:description"), meta.get("description"));
	assert.equal(meta.get("twitter:card"), "summary_large_image");
	const social = new URL(meta.get("og:image")!);
	assert.equal(social.origin, "https://taf.sh", `Wrong social image host: ${file}`);
	assert.equal(meta.get("og:image:secure_url"), social.href);
	assert.equal(meta.get("twitter:image"), social.href);
	assert.equal(meta.get("og:image:type"), "image/jpeg");
	assert(!meta.has("og:video"), `Unexpected video preview: ${file}`);
	const image = await sharp(join(root, social.pathname)).metadata();
	assert.equal(image.format, "jpeg");
	assert.equal(image.space, "srgb");
	assert.equal(image.hasAlpha, false);
	assert.equal(image.width, 1200);
	assert.equal(image.height, 630);
	const noindex = meta.get("robots")?.includes("noindex");
	if (noindex) {
		assert(!sitemapUrls.includes(canonical), `Noindexed URL in sitemap: ${canonical}`);
		assert.equal(json, "", `Noindexed page has public schema: ${file}`);
	} else {
		assert(sitemapUrls.includes(canonical), `Canonical missing from sitemap: ${canonical}`);
		const schema = JSON.parse(json);
		assert.equal(schema["@context"], "https://schema.org");
		const nodes = schema["@graph"];
		const definitions = new Set(nodes.map((node: Record<string, unknown>) => node["@id"]));
		assert.equal(definitions.size, nodes.length, `Duplicate schema IDs: ${file}`);
		function checkReferences(value: unknown) {
			if (!value || typeof value !== "object") return;
			const object = value as Record<string, unknown>;
			if (Object.keys(object).length === 1 && object["@id"]) assert(definitions.has(object["@id"]), `Unresolved schema reference ${object["@id"]}: ${file}`);
			for (const child of Object.values(object)) checkReferences(child);
		}
		checkReferences(nodes);
	}
	for (const href of links) {
		const url = new URL(href, canonical);
		if (url.origin !== "https://taf.sh") continue;
		if (url.pathname === new URL(canonical).pathname && url.hash) {
			assert(ids.has(decodeURIComponent(url.hash.slice(1))), `Broken fragment ${href}: ${file}`);
			continue;
		}
		const target = join(root, decodeURIComponent(url.pathname));
		const exists = await stat(target).catch(() => null);
		assert(exists?.isFile() || await stat(join(target, "index.html")).catch(() => null), `Broken internal link ${href}: ${file}`);
	}
	if (path === "/work") for (const project of reel) assert(html.includes(project.href.replaceAll("&", "&amp;")) || html.includes(project.href), `Missing project link: ${project.name}`);
	console.log(`SEO checked ${path}`);
	checked++;
}
assert.equal(sitemapUrls.length, Object.keys(pageMetadata).length, "Unexpected sitemap entries");
assert((await readFile(join(root, "robots.txt"), "utf8")).includes("Sitemap: https://taf.sh/sitemap-index.xml"));
console.log(`Passed: ${checked} pages, ${sitemapUrls.length} indexable URLs, social images, schema references and internal links.`);
