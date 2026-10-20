import assert from "node:assert/strict";
import { markdownPath } from "../src/lib/crawlers";
import { canonicalPath, pageMetadata } from "../src/lib/seo";

const origin = new URL(process.argv[2] ?? "https://v2.taf.sh").origin;
assert(["https://taf.sh", "https://v2.taf.sh"].includes(origin));
const agents = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot"];
let checks = 0;
for (const [index, path] of Object.keys(pageMetadata).entries()) {
	const headers = { "User-Agent": agents[index % agents.length] };
	const html = await fetch(new URL(canonicalPath(path), origin), { headers });
	assert.equal(html.status, 200, `HTML unavailable: ${path}`);
	assert(html.headers.get("link")?.includes(markdownPath(path)), `Missing alternate header: ${path}`);
	const alternate = await fetch(new URL(markdownPath(path), origin), { headers });
	assert.equal(alternate.status, 200, `Markdown unavailable: ${path}`);
	assert(alternate.headers.get("content-type")?.startsWith("text/markdown"), `Wrong Markdown MIME: ${path}`);
	assert(alternate.headers.get("link")?.includes(`https://taf.sh${canonicalPath(path)}`), `Wrong canonical header: ${path}`);
	assert((await alternate.text()).startsWith(`Source: <https://taf.sh${canonicalPath(path)}>`));
	if (origin === "https://v2.taf.sh") {
		assert(html.headers.get("x-robots-tag")?.includes("noindex"));
		assert(alternate.headers.get("x-robots-tag")?.includes("noindex"));
	}
	checks += 2;
}
for (const path of ["/robots.txt", "/llms.txt", "/llms-full.txt"]) {
	for (const agent of agents) {
		const response = await fetch(new URL(path, origin), { headers: { "User-Agent": agent } });
		assert.equal(response.status, 200, `${agent} cannot fetch ${path}`);
		assert(response.headers.get("content-type")?.startsWith("text/plain"));
		const body = await response.text();
		assert(body.length > 100);
		if (path === "/robots.txt") assert(/User-agent: \*\s+Allow: \//.test(body));
		if (path === "/llms.txt") {
			assert(body.startsWith("# taf.sh"));
			for (const page of Object.keys(pageMetadata)) assert(body.includes(new URL(markdownPath(page), origin).href));
		}
		checks++;
	}
}
console.log(`Passed ${checks} live crawler resource checks on ${origin}. Synthetic user agents do not verify access from the providers' actual crawler IPs.`);
