import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { email, products } from "../src/components/studio/data";
import { markdownPath } from "../src/lib/crawlers";
import { normalizePath, pageMetadata, studioDescription } from "../src/lib/seo";
import { pageMarkdown } from "./crawler-markdown";

const root = new URL("../dist/", import.meta.url).pathname;
const sitemapIndex = await readFile(join(root, "sitemap-index.xml"), "utf8");
const locations = (xml: string) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replaceAll("&amp;", "&"));
const pages: { source: URL; path: string; markdown: string }[] = [];
const origin = "https://taf.sh";

// Only sitemap pages qualify. Never export proposal pages or other noindexed
// deliverables, even if a future sitemap configuration includes one by mistake.
for (const sitemap of locations(sitemapIndex)) {
	for (const location of locations(await readFile(join(root, new URL(sitemap).pathname), "utf8"))) {
		const source = new URL(location);
		const path = normalizePath(source.pathname);
		assert(pageMetadata[path], `Missing public page metadata: ${path}`);
		const html = await readFile(join(root, source.pathname, "index.html"), "utf8");
		let noindex = false;
		await new HTMLRewriter().on('meta[name="robots"]', { element(node) {
			noindex ||= /noindex/i.test(node.getAttribute("content") ?? "");
		} }).transform(new Response(html)).text();
		assert(!noindex, `Refusing to export noindexed page: ${path}`);
		const markdown = pageMarkdown(html, source);
		const target = join(root, markdownPath(path));
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, markdown);
		pages.push({ source, path, markdown });
	}
}
assert.equal(pages.length, Object.keys(pageMetadata).length, "Public route list and sitemap differ");

const entry = (path: string) => {
	const page = pageMetadata[path];
	assert(pages.some(item => item.path === path), `Missing exported route: ${path}`);
	return `- [${page.label}](${new URL(markdownPath(path), origin).href}): ${page.description}`;
};

const guide = `# taf.sh

> ${studioDescription}

taf.sh is Tashif Ahmad Khan's independent software studio and consultancy. tashif.codes is his personal portfolio and engineering blog. The pages below describe his services, studio products and selected team work. Contact him at ${email}.

The Markdown pages contain the public website's main content, generated from its HTML on each build. Each includes its canonical HTML source for attribution. Product availability is listed below. Systematic Reasoning and ForgeIQX are team work, where Tashif is a founding engineer, rather than products owned by taf.sh.

## In-browser tools (WebMCP)

When an agent is visiting this site in a live tab, the page registers tools on document.modelContext. They are not HTTP APIs. Crawlers that never run JavaScript should keep using the Markdown pages above. The static tool list is at /.well-known/webmcp.json (also /webmcp.json).

Tools: get_studio_overview, list_services, get_service, list_work, get_product, get_about, get_contact, copy_studio_email, start_contact.

start_contact drafts a message to ${email}, fills the contact form when it is on the page, and opens the visitor's mail app. It does not send mail. In-chat agents such as Grok should show the returned draft and send it from the user's mailbox after they confirm.

## Studio and services

${["/", "/about", "/services", "/contact", "/work", "/work/tashif-codes"].map(entry).join("\n")}

## Products and team work

${products.map(product => `${entry(product.href)} Status: ${product.status}.`).join("\n")}

## Optional

- [WebMCP tool list](${new URL("/.well-known/webmcp.json", origin).href}): Names, descriptions and input schemas for the in-tab tools.
- [Complete public website text](${new URL("/llms-full.txt", origin).href}): All ${pages.length} public pages in one file, with source URLs.
- [Personal portfolio](https://tashif.codes/): Tashif's wider project directory, apps and developer tools.
- [Personal portfolio crawler guide](https://tashif.codes/llms.txt): Pages and in-browser WebMCP tools on tashif.codes.
- [Engineering blog](https://tashif.codes/blog): Technical posts and project implementation notes.
- [GitHub](https://github.com/tashifkhan): Public source code by Tashif Ahmad Khan.
`;
await writeFile(join(root, "llms.txt"), guide);
await writeFile(join(root, "llms-full.txt"), `# taf.sh public website\n\n${studioDescription}\n\n${pages.map(page => page.markdown).join("\n---\n\n")}`);

// Workers Assets reads this file. Explicit MIME types avoid treating Markdown
// as an opaque download. Canonical headers identify the original HTML page.
const headers = [
	...pages.map(page => `${markdownPath(page.path)}\n  Content-Type: text/markdown; charset=utf-8\n  Link: <${page.source.href}>; rel="canonical"`),
	...pages.map(page => `${page.source.pathname}\n  Link: <${markdownPath(page.path)}>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"`),
	"/llms.txt\n  Content-Type: text/plain; charset=utf-8",
	"/llms-full.txt\n  Content-Type: text/plain; charset=utf-8",
	"/.well-known/webmcp.json\n  Content-Type: application/json; charset=utf-8",
	"/webmcp.json\n  Content-Type: application/json; charset=utf-8",
	"/*\n  Permissions-Policy: tools=self",
].join("\n\n");
const existingHeaders = await readFile(join(root, "_headers"), "utf8").catch(error => {
	if (error.code !== "ENOENT") throw error;
	return "";
});
const marker = "# Generated crawler content headers";
// Regenerating in an existing build must not append duplicate rules.
await writeFile(join(root, "_headers"), `${existingHeaders.split(marker)[0].trimEnd()}\n\n${marker}\n${headers}\n`.trimStart());
console.log(`Generated llms.txt, llms-full.txt and ${pages.length} public Markdown pages.`);
