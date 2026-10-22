import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
import { socialCards } from "../src/lib/social";

const css = await readFile(new URL("../src/styles/global.css", import.meta.url), "utf8");
const dark = css.slice(css.indexOf('html[data-theme="dark"]'));
const color = (name: string) => {
	const value = dark.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]+)`))?.[1];
	if (!value) throw new Error(`Missing color token: ${name}`);
	return value;
};
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
await mkdir(new URL("../public/og", import.meta.url), { recursive: true });
for (const card of Object.values(socialCards)) {
	let tagX = 64;
	const tags = card.tags.map(tag => {
		const width = tag.length * 10 + 36;
		const markup = `<rect x="${tagX}" y="432" width="${width}" height="40" rx="8" fill="${color("surface")}" stroke="${color("border-strong")}"/><text x="${tagX + 18}" y="458" font-family="monospace" font-size="16" fill="${color("secondary")}">${escape(tag)}</text>`;
		tagX += width + 12;
		return markup;
	}).join("");
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
	<defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="${color("border-strong")}"/></pattern></defs>
	<rect width="1200" height="630" fill="${color("background")}"/>
	<rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>
	<rect x="24" y="24" width="1152" height="582" rx="22" fill="${color("background")}" stroke="${color("border-strong")}" stroke-width="2"/>
	<path d="M24 108H1176M24 514H1176" stroke="${color("border")}"/>
	<text x="64" y="77" font-family="monospace" font-size="25" fill="${color("accent")}">&gt; taf.sh</text>
	<text x="1136" y="76" text-anchor="end" font-family="monospace" font-size="17" fill="${color("secondary")}">${escape(card.label)}</text>
	${card.title.map((line, index) => `<text x="62" y="${207 + index * 74}" font-family="sans-serif" font-size="${line.length > 30 ? 49 : 58}" font-weight="bold" letter-spacing="-1.8" fill="${color(index ? "accent" : "foreground")}">${escape(line)}</text>`).join("")}
	${card.description.map((line, index) => `<text x="64" y="${343 + index * 34}" font-family="sans-serif" font-size="24" fill="${color("secondary")}">${escape(line)}</text>`).join("")}
	${tags}
	<text x="64" y="562" font-family="sans-serif" font-size="22" fill="${color("foreground")}">Tashif Ahmad Khan</text>
	<text x="64" y="586" font-family="monospace" font-size="14" fill="${color("muted")}">Independent software studio / Delhi</text>
	<text x="1136" y="570" text-anchor="end" font-family="monospace" font-size="22" fill="${color("accent")}">https://taf.sh</text>
	</svg>`;
	// Opaque sRGB JPEGs, matching the format used by tashif.codes.
	await sharp(Buffer.from(svg)).flatten({ background: color("background") }).toColourspace("srgb")
		.jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
		.toFile(new URL(`../public/og/${card.slug}.jpg`, import.meta.url).pathname);
	console.log(`Generated ${card.slug}.jpg`);
}
