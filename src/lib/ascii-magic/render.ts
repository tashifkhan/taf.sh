/*
 * Turns an ascii-magic frame into HTML in the site's own palette. The pieces
 * ship GitHub-dark hex colours; each one is folded into a text token by
 * lightness, so a piece reads in both themes. Saturated greens and blues
 * become the teal accent. Every other hue drops to grey.
 */

type Frame = string | { text: string; color: string; palette?: Record<string, string> };

export interface Piece {
	meta: { slug: string; cols: number; rows: number; fps: number; palette?: Record<string, string> };
	default: () => (t: number) => Frame;
}

/* Literal class names, so the Tailwind scanner keeps them. */
const ACCENT = "text-accent";
const TIERS = ["text-faint", "text-muted", "text-secondary", "text-foreground"];

function tone(hex: string): string {
	const n = parseInt(hex.slice(1, 7), 16);
	const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	let h = 0;
	if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	h = (h * 60 + 360) % 360;
	if (s > 0.45 && l > 0.35 && h >= 100 && h <= 215) return ACCENT;
	return TIERS[l > 0.72 ? 3 : l > 0.5 ? 2 : l > 0.3 ? 1 : 0];
}

/* Quiet pieces sit two steps lower and never use the accent, for art that runs behind other content. */
const QUIET: Record<string, string> = {
	"text-accent": "text-muted", "text-foreground": "text-muted", "text-secondary": "text-faint", "text-muted": "text-faint", "text-faint": "text-faint",
};

const cache = new Map<string, string>();
const toneOf = (hex: string) => {
	let c = cache.get(hex);
	if (!c) cache.set(hex, (c = tone(hex)));
	return c;
};

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
/* Braille and the long diagonals fall back to a wider font in Menlo and Consolas, so each is boxed to one cell. */
const WIDE = /[\u2800-\u28FF\u27CB\u27CD]/g;
const esc = (s: string) =>
	s.replace(/[&<>]/g, c => ESC[c]).replace(WIDE, c => `<i style="display:inline-block;width:1ch;overflow:hidden;vertical-align:top;font-style:normal">${c}</i>`);

/** One frame as HTML: runs of the same tone share a span. */
export function frameHTML(frame: Frame, palette: Record<string, string> = {}, quiet = false): string {
	if (typeof frame === "string") return esc(frame);
	const pal = frame.palette || palette;
	const T = frame.text.split("\n"), C = frame.color.split("\n");
	let out = "";
	for (let y = 0; y < T.length; y++) {
		const t = [...T[y]], c = [...C[y]];
		let run = "", cls = "";
		const flush = () => {
			if (run) out += cls ? `<span class="${cls}">${esc(run)}</span>` : esc(run);
			run = "";
		};
		for (let x = 0; x < t.length; x++) {
			const hex = c[x] && c[x] !== " " ? pal[c[x]] : undefined;
			const next = hex ? (quiet ? QUIET[toneOf(hex)] : toneOf(hex)) : "";
			if (next !== cls) { flush(); cls = next; }
			run += t[x];
		}
		flush();
		if (y < T.length - 1) out += "\n";
	}
	return out;
}
