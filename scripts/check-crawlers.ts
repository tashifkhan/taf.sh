import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { products, reel } from "../src/components/studio/data";
import { markdownPath } from "../src/lib/crawlers";
import { canonicalPath, pageMetadata } from "../src/lib/seo";

const root = new URL("../dist/", import.meta.url).pathname;
const guide = await readFile(join(root, "llms.txt"), "utf8");
const full = await readFile(join(root, "llms-full.txt"), "utf8");
const headers = await readFile(join(root, "_headers"), "utf8");
assert(guide.startsWith("# taf.sh\n\n> "));
assert(guide.includes("https://tashif.codes/") && guide.includes("https://github.com/tashifkhan"));
assert(guide.includes("document.modelContext") && guide.includes("start_contact"));
assert(guide.includes("team work") && guide.includes("Status: In development."));
assert(headers.includes("Content-Type: text/markdown; charset=utf-8"));

for (const [path, metadata] of Object.entries(pageMetadata)) {
	const canonical = `https://taf.sh${canonicalPath(path)}`;
	const markdown = await readFile(join(root, markdownPath(path)), "utf8");
	assert(markdown.startsWith(`Source: <${canonical}>`), `Missing canonical source: ${path}`);
	assert(/^# .+/m.test(markdown), `Missing h1: ${path}`);
	assert(markdown.length > 500, `Missing page content: ${path}`);
	assert(!/<(?:script|style|svg|canvas|form)[\s>]/i.test(markdown), `Markup leaked: ${path}`);
	assert(full.includes(markdown), `Page missing from complete text: ${path}`);
	assert(guide.includes(markdownPath(path)), `Page missing from guide: ${metadata.label}`);
	assert(headers.includes(`Link: <${canonical}>; rel="canonical"`));
	const html = await readFile(join(root, canonicalPath(path), "index.html"), "utf8");
	let alternate = "", describedby = "";
	await new HTMLRewriter().on("link", { element(node) {
		if (node.getAttribute("rel") === "alternate" && node.getAttribute("type") === "text/markdown") alternate = node.getAttribute("href") ?? "";
		if (node.getAttribute("rel") === "describedby") describedby = node.getAttribute("href") ?? "";
	} }).transform(new Response(html)).text();
	assert.equal(alternate, markdownPath(path));
	assert.equal(describedby, "/llms.txt");
}
for (const path of ["proposals", "404", "products/cliniq"]) {
	assert.equal(await stat(join(root, path, "index.md")).catch(() => null), null, `Exported excluded page: ${path}`);
	assert(!guide.includes(`/${path}/`) && !full.includes(`Source: <https://taf.sh/${path}/>`));
}
const home = await readFile(join(root, "index.md"), "utf8");
assert.equal(home.match(/^# /gm)?.length, 1, "Duplicated homepage headline");
assert(home.includes("# Products built end to end, then kept running."));
assert(home.includes("Projects live right now: 51"));
assert(!home.includes("p95 38ms") && !home.includes("wireframe 0/7"), "Exported animation telemetry as facts");
const work = await readFile(join(root, "work/index.md"), "utf8");
for (const item of reel) assert(work.includes(item.name), `Missing project: ${item.name}`);
for (const product of products) assert(guide.includes(`Status: ${product.status}.`));
const services = await readFile(join(root, "services/index.md"), "utf8");
assert(services.includes("Who will do the work, and who owns the code?"));
console.log(`Crawler checks passed: ${Object.keys(pageMetadata).length} Markdown pages, discovery links, product status and excluded deliverables.`);
