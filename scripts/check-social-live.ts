import assert from "node:assert/strict";
import sharp from "sharp";
import { socialCards } from "../src/lib/social";

const origin = process.argv[2] ?? "https://v2.taf.sh";
assert(["https://taf.sh", "https://v2.taf.sh"].includes(origin));
const agents = ["facebookexternalhit/1.1", "Twitterbot/1.0", "WhatsApp/2.24.1"];
const images = new Set<string>();
for (const path of Object.keys(socialCards)) {
	const response = await fetch(`${origin}${path === "/" ? "/" : `${path}/`}`, {
		headers: { "User-Agent": agents[images.size % agents.length] },
	});
	assert.equal(response.status, 200, `Page: ${path}`);
	const html = await response.text();
	const metadata = new Map<string, string>();
	await new HTMLRewriter().on("meta", { element(element) {
		metadata.set(element.getAttribute("property") ?? element.getAttribute("name") ?? "", element.getAttribute("content") ?? "");
	} }).transform(new Response(html)).text();
	const image = metadata.get("og:image");
	assert(image && new URL(image).origin === origin, `Social image must load from the deployed host: ${path}`);
	assert.equal(metadata.get("og:image:secure_url"), image);
	assert.equal(metadata.get("twitter:image"), image);
	assert.equal(metadata.get("og:image:type"), "image/jpeg");
	assert(!metadata.has("og:video"));
	images.add(image);
}
for (const image of images) {
	const response = await fetch(image, { headers: { "User-Agent": "facebookexternalhit/1.1" } });
	assert.equal(response.status, 200, `Image: ${image}`);
	assert.equal(response.headers.get("Content-Type")?.split(";")[0], "image/jpeg", image);
	const buffer = Buffer.from(await response.arrayBuffer());
	const metadata = await sharp(buffer).metadata();
	assert.equal(metadata.width, 1200);
	assert.equal(metadata.height, 630);
	assert.equal(metadata.hasAlpha, false);
	console.log(`Live social card verified: ${image}`);
}
console.log(`Passed: ${Object.keys(socialCards).length} live pages and ${images.size} JPEG cards on ${origin}.`);
