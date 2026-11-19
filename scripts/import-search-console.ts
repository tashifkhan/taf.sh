/*
 * Turns a Google Search Console "Performance on Search" export into the
 * dated snapshot at src/data/search-console.json.
 *
 *   bun scripts/import-search-console.ts ~/Downloads/tashif.codes-Performance-on-Search-2026-11-19.zip
 *
 * The export is for the tashif.codes domain property, so it covers every
 * subdomain (the JIIT tools, the stats APIs, the blog). Headline totals come
 * from Chart.csv, which is the daily series for the whole property. Pages.csv
 * is only used to group clicks by hostname.
 */
import { $ } from "bun";
import { readFileSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const input = process.argv[2];
if (!input) throw new Error("Pass the export zip or its unzipped folder.");
let dir = input;
if (input.endsWith(".zip")) {
	dir = await mkdtemp(join(tmpdir(), "gsc-"));
	await $`unzip -o -q ${input} -d ${dir}`;
}

// Quoted fields can hold commas and line breaks (long docs URLs wrap), so
// this walks the text character by character instead of splitting lines.
function parse(file: string) {
	const text = readFileSync(join(dir, file), "utf8").replace(/^﻿/, "");
	const rows: string[][] = [[]];
	let field = "";
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
			else if (char === '"') quoted = false;
			else field += char;
		} else if (char === '"') quoted = true;
		else if (char === ",") { rows.at(-1)!.push(field); field = ""; }
		else if (char === "\n") { rows.at(-1)!.push(field.replace(/\r$/, "")); field = ""; rows.push([]); }
		else field += char;
	}
	rows.at(-1)!.push(field);
	const [keys, ...body] = rows.filter(row => row.some(Boolean));
	return body.map(row => Object.fromEntries(keys.map((key, i) => [key, row[i] ?? ""])));
}
const int = (value: string) => Number(value.replaceAll(",", ""));
const round = (value: number, places = 1) => Math.round(value * 10 ** places) / 10 ** places;

const daily = parse("Chart.csv").map(row => ({ date: row.Date, clicks: int(row.Clicks), impressions: int(row.Impressions), position: Number(row.Position) }));
const clicks = daily.reduce((sum, day) => sum + day.clicks, 0);
const impressions = daily.reduce((sum, day) => sum + day.impressions, 0);
const position = daily.reduce((sum, day) => sum + day.position * day.impressions, 0) / impressions;

const months = new Map<string, { clicks: number; impressions: number }>();
for (const day of daily) {
	const month = day.date.slice(0, 7);
	const total = months.get(month) ?? { clicks: 0, impressions: 0 };
	total.clicks += day.clicks;
	total.impressions += day.impressions;
	months.set(month, total);
}

const sites = new Map<string, { clicks: number; impressions: number }>();
for (const row of parse("Pages.csv")) {
	const host = new URL(row["Top pages"]).hostname.replace(/^www\./, "");
	const total = sites.get(host) ?? { clicks: 0, impressions: 0 };
	total.clicks += int(row.Clicks);
	total.impressions += int(row.Impressions);
	sites.set(host, total);
}

const exportedAt = basename(input).match(/(\d{4}-\d{2}-\d{2})/)?.[1] ?? new Date().toISOString().slice(0, 10);
const snapshot = {
	property: "tashif.codes",
	scope: "Domain property, so every tashif.codes subdomain is included. Web search only.",
	exportedAt,
	from: daily[0].date,
	to: daily.at(-1)!.date,
	clicks,
	impressions,
	ctr: round((clicks / impressions) * 100, 2),
	position: round(position),
	monthly: [...months].map(([month, total]) => ({ month, ...total })),
	queries: parse("Queries.csv").slice(0, 10).map(row => ({ query: row["Top queries"], clicks: int(row.Clicks), impressions: int(row.Impressions), position: Number(row.Position) })),
	sites: [...sites].sort((a, b) => b[1].clicks - a[1].clicks).slice(0, 6).map(([host, total]) => ({ host, ...total })),
	devices: parse("Devices.csv").map(row => ({ device: row.Device, clicks: int(row.Clicks), impressions: int(row.Impressions) })),
	countries: parse("Countries.csv").slice(0, 5).map(row => ({ country: row.Country, clicks: int(row.Clicks), impressions: int(row.Impressions) })),
};
await Bun.write("src/data/search-console.json", JSON.stringify(snapshot, null, "\t") + "\n");
console.log(`Wrote ${snapshot.from} to ${snapshot.to}: ${clicks} clicks, ${impressions} impressions.`);
