// Public, aggregate analytics only. Refresh with bun scripts/refresh-web-presence.ts.
const api = "https://tashif.codes/projects/stats/api/v1/stats?slugs=dashboard&days=0";
async function request(refresh = false) {
	const response = await fetch(api + (refresh ? "&refresh=true" : ""), { signal: AbortSignal.timeout(30_000) });
	if (!response.ok) throw new Error(`Stats returned ${response.status}`);
	const payload = await response.json();
	return payload.results?.find((result: { slug: string }) => result.slug === "dashboard");
}
let project = await request();
if (project?.cache?.stale && !project.cache.refreshing && !project.cache.retry_after) project = await request(true);
for (let attempt = 0; project?.cache?.refreshing && attempt < 8; attempt++) {
	await Bun.sleep(2000);
	project = await request();
}
if (!project?.data?.timeseries?.length) throw new Error("Missing tashif.codes timeseries");
if (project.error || project.cache?.stale || project.cache?.refreshing || project.cache?.refresh_error) {
	throw new Error("Stats cache is not fresh. Retry after the source refreshes.");
}
const data = project.data;
const monthly = new Map<string, number>();
const days = [...data.timeseries].sort((a, b) => a.date.localeCompare(b.date));
for (const day of days) {
	if (!Number.isFinite(day.pageviews) || day.pageviews < 0) throw new Error("Invalid pageview count");
	const month = day.date.slice(0, 7);
	monthly.set(month, (monthly.get(month) ?? 0) + day.pageviews);
}
const google = data.stats.referrer.find((row: { key: string }) => row.key === "google.com");
if (!Number.isFinite(google?.pageviews)) throw new Error("Missing Google referral count");
const snapshot = {
	site: "https://tashif.codes",
	source: "https://tashif.codes/projects/stats?project=dashboard",
	api,
	capturedAt: data.metadata.export_date,
	from: days[0].date.slice(0, 10),
	to: days.at(-1).date.slice(0, 10),
	pageviews: days.reduce((sum, day) => sum + day.pageviews, 0),
	googleReferralPageviews: google.pageviews,
	monthly: [...monthly].map(([month, pageviews]) => ({ month, pageviews })),
};
await Bun.write(new URL("../src/data/web-presence.json", import.meta.url), JSON.stringify(snapshot, null, 2) + "\n");
console.log(`Saved tashif.codes snapshot: ${snapshot.pageviews} pageviews through ${snapshot.to}`);
