/*
 * tashif-codes: a terminal that fetches tashif.codes and lists its project
 * subdomains. Written for taf.sh on the ascii-magic kit, not an upstream
 * piece. The traffic figures come from the same snapshot the case study uses,
 * so the two can't drift apart.
 */
import { Grid, palette } from "../lib/kit.js";
import snapshot from "../../../data/web-presence.json";

const n = (v) => new Intl.NumberFormat("en-US").format(v);
const since = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(snapshot.from));

// 0 frame, 1 label, 2 value, 3 prompt
export const meta = {
	slug: "tashif-codes",
	name: "tashif.codes",
	cols: 56, rows: 14, fps: 12,
	palette: palette(["#30363d", "#8b949e", "#e6edf3", "#7ee787"]),
};

/* Each step either types a command or prints lines. Times are in seconds. */
const SCRIPT = [
	{ cmd: "curl -s tashif.codes" },
	{ out: [
		["", "projects and engineering blog"],
		["", ""],
		["projects", "51 live"],
		["pageviews", `${n(snapshot.pageviews)} since ${since}`],
		["via google", n(snapshot.googleReferralPageviews)],
		["blog", "tashif.codes/blog"],
	] },
	{ cmd: "ls *.tashif.codes" },
	{ out: [
		["", "talentsync  jiit-timetable  ncr-metro"],
		["", "wikispark  github-stats  paisa"],
	] },
];
const TYPE = 0.07, LINE = 0.18, PAUSE = 0.6, HOLD = 20;

/* Lay the script out once: the row and start time of every line. */
const lines = [];
let at = 0.8, row = 0;
for (const step of SCRIPT) {
	if (step.cmd) {
		lines.push({ row: row++, t: at, cmd: step.cmd });
		at += step.cmd.length * TYPE + PAUSE;
	} else {
		for (const [k, v] of step.out) { lines.push({ row: row++, t: at, k, v }); at += LINE; }
		at += PAUSE;
	}
}
const CYCLE = at + HOLD;

export default function create() {
	const g = new Grid(meta.cols, meta.rows);
	return (t) => {
		const s = t % CYCLE;
		g.clear();
		g.box(0, 0, meta.cols, meta.rows, "round", "0");
		g.text(2, 0, " ~/tashif.codes ", "1");
		let cursor = null;
		for (const l of lines) {
			if (s < l.t) break;
			const y = l.row + 2;
			if (l.cmd) {
				const shown = l.cmd.slice(0, Math.floor((s - l.t) / TYPE));
				g.text(2, y, "$", "3");
				g.text(4, y, shown, "2");
				cursor = [4 + shown.length, y];
			} else {
				cursor = null;
				if (l.k) g.text(4, y, l.k, "1");
				g.text(l.k ? 16 : 4, y, l.v, l.k ? "2" : "1");
			}
		}
		// Once everything has printed, a fresh prompt waits with a blinking cursor.
		if (s >= at - PAUSE) {
			const y = lines[lines.length - 1].row + 3;
			g.text(2, y, "$", "3");
			cursor = Math.floor(s * 2) % 2 ? null : [4, y];
		}
		if (cursor) g.set(cursor[0], cursor[1], "█", "3");
		return g.frame();
	};
}
