import snapshot from "./web-presence.json";

export const webPresence = snapshot;
export const formatCount = (value: number) => new Intl.NumberFormat("en-US").format(value);
export const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", {
	day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
}).format(new Date(value));

const maximum = Math.max(...snapshot.monthly.map(row => row.pageviews));
export const trafficPoints = snapshot.monthly.map((row, index) =>
	`${(index / (snapshot.monthly.length - 1) * 600).toFixed(1)},${(100 - row.pageviews / maximum * 90).toFixed(1)}`
).join(" ");
