/*
 * Writes src/styles/skins.css: every style's palette and every colour combo,
 * each in a light set and a dark set.
 *
 * Hand-writing this file meant repeating every value under five selectors,
 * because a palette has to follow the same three dark/light sources as the
 * base tokens in global.css: the OS preference, `data-theme` on <html>, and
 * the `.t-dark`/`.t-light` subtrees the reel pins. `scope()` writes all five.
 *
 * Run `bun run skins` after changing a palette here or in
 * scripts/skins/material-palettes.json. The Material palettes come from
 * tashif.codes, grown from one seed colour each with Material's tonal spot
 * scheme.
 */
import material from "./skins/material-palettes.json";

type Tokens = Partial<Record<TokenName, string>>;
type TokenName =
	| "background"
	| "surface"
	| "elevated"
	| "border"
	| "border-strong"
	| "foreground"
	| "secondary"
	| "muted"
	| "faint"
	| "accent"
	| "accent-strong"
	| "accent-soft"
	| "accent-contrast";

interface Pair {
	light: Tokens;
	dark: Tokens;
}

const decl = (vars: Record<string, string>, prefix = "--color-") =>
	Object.entries(vars)
		.map(([key, value]) => `\t${prefix}${key}: ${value};`)
		.join("\n");

/**
 * One palette pair under one root selector. `root` is a compound selector for
 * <html>, such as `:root[data-skin="dump"][data-color="moss"]`. Keys must
 * match between light and dark, or a light value would leak into dark mode
 * through the specificity tie between a combo's light rule and its style's
 * dark rule.
 */
function scope(root: string, pair: Pair, prefix?: string): string {
	const light = Object.keys(pair.light).sort().join();
	const dark = Object.keys(pair.dark).sort().join();
	if (light !== dark) throw new Error(`${root}: light and dark set different tokens`);
	const L = decl(pair.light as Record<string, string>, prefix);
	const D = decl(pair.dark as Record<string, string>, prefix);
	return `${root},
${root} .t-light {
${L}
}

@media (prefers-color-scheme: dark) {
	${root}:not([data-theme="light"]) {
${D.replace(/^/gm, "\t")}
	}
}

${root}[data-theme="dark"],
${root} .t-dark {
${D}
}
`;
}

const accent = (light: string, strong: string, contrast: string, alpha = 0.1) => ({
	accent: light,
	"accent-strong": strong,
	"accent-soft": `color-mix(in srgb, ${light} ${Math.round(alpha * 100)}%, transparent)`,
	"accent-contrast": contrast,
});

/* ---- Studio: the base palette lives in global.css; combos swap the accent. */

const studio = ':root:not([data-skin])';
const studioColors: Record<string, Pair> = {
	amber: { light: accent("#b45309", "#92400e", "#ffffff"), dark: accent("#fbbf24", "#fcd34d", "#241a02", 0.14) },
	indigo: { light: accent("#4338ca", "#3730a3", "#ffffff"), dark: accent("#a5b4fc", "#c7d2fe", "#12143a", 0.14) },
	rose: { light: accent("#be123c", "#9f1239", "#ffffff"), dark: accent("#fda4af", "#fecdd3", "#3a0a16", 0.14) },
};

/* ---- Classic: tashif.codes' original look. Cool grey paper, Lexend. */

const classic: Pair = {
	light: {
		background: "#eceff1",
		surface: "#ffffff",
		elevated: "#ffffff",
		border: "#dde2e7",
		"border-strong": "#c3cad2",
		foreground: "#2f3236",
		secondary: "#454a52",
		muted: "#5b6372",
		faint: "#7d8595",
		// The preview orange (#e8590c) is 3.2:1 on this paper. Text needs 4.5.
		...accent("#c2410c", "#9a3412", "#ffffff"),
	},
	dark: {
		background: "#09090f",
		surface: "#0d0e15",
		elevated: "#11131c",
		border: "#1a1d2a",
		"border-strong": "#2a2f42",
		foreground: "#dce1ec",
		secondary: "#b4bccd",
		muted: "#8f98b0",
		faint: "#6c7590",
		...accent("#fb923c", "#fdba74", "#1c0a02", 0.14),
	},
};
const classicColors: Record<string, Pair> = {
	blue: { light: accent("#1d4ed8", "#1e40af", "#ffffff"), dark: accent("#60a5fa", "#93c5fd", "#0b1220", 0.14) },
	violet: { light: accent("#6d28d9", "#5b21b6", "#ffffff"), dark: accent("#a78bfa", "#c4b5fd", "#160b33", 0.14) },
	rose: { light: accent("#be123c", "#9f1239", "#ffffff"), dark: accent("#fb7185", "#fda4af", "#33070f", 0.14) },
};

/* ---- Dump: dump-lab's zine. Warm paper, marker ink, a pink stamp, a yellow
   highlighter, Anton headings. accent-soft is the highlighter. */

const dump: Pair = {
	light: {
		background: "#f6f3ea",
		surface: "#fffef8",
		elevated: "#fffef8",
		border: "#d9d2c3",
		"border-strong": "#191713",
		foreground: "#191713",
		secondary: "#3a352e",
		muted: "#5c564e",
		faint: "#7d766b",
		// The zine's pink, darkened until it passes 4.5:1 as text on the paper.
		accent: "#c2255c",
		"accent-strong": "#9d1c4a",
		"accent-soft": "rgba(242, 225, 76, 0.5)",
		"accent-contrast": "#fffef8",
	},
	dark: {
		background: "#0c0e11",
		surface: "#15181d",
		elevated: "#191d23",
		border: "#282f38",
		"border-strong": "#3a424d",
		foreground: "#f0f3f6",
		secondary: "#c9d0d8",
		muted: "#949ea8",
		faint: "#6f7984",
		accent: "#ff578f",
		"accent-strong": "#ff8fb1",
		"accent-soft": "rgba(245, 208, 51, 0.16)",
		"accent-contrast": "#0c0e11",
	},
};
const dumpStamp = (light: string, strong: string, dark: string, darkStrong: string, soft?: [string, string]): Pair => ({
	light: { accent: light, "accent-strong": strong, "accent-soft": soft?.[0] ?? "rgba(242, 225, 76, 0.5)", "accent-contrast": "#fffef8" },
	dark: { accent: dark, "accent-strong": darkStrong, "accent-soft": soft?.[1] ?? "rgba(245, 208, 51, 0.16)", "accent-contrast": "#0c0e11" },
});
const dumpColors: Record<string, Pair> = {
	blue: dumpStamp("#1d4ed8", "#1e40af", "#7aa2ff", "#a9c2ff"),
	// Moss trades the yellow highlighter for a pink one.
	moss: dumpStamp("#1f7a4c", "#14532d", "#34d399", "#6ee7b7", ["rgba(255, 143, 177, 0.35)", "rgba(255, 143, 177, 0.16)"]),
	rust: dumpStamp("#c2410c", "#9a3412", "#fb923c", "#fdba74"),
};

/* ---- Sleeck: sleeck.dev. Lavender paper, black ink, one loud highlight,
   Space Mono headings. On paper the accent is the ink and the highlight is
   the fill text and tint; in the dark the highlight becomes the accent. */

interface SleeckPaper {
	paper: string;
	well: string;
	line: string;
	muted: string;
	highlight: string;
	dark: { paper: string; card: string; well: string; line: string; edge: string; muted: string; ink: string };
}

const sleeckPair = (p: SleeckPaper): Pair => ({
	light: {
		background: p.paper,
		surface: "#ffffff",
		elevated: "#ffffff",
		border: p.line,
		"border-strong": "#0a0714",
		foreground: "#0a0714",
		secondary: "#2a2238",
		muted: p.muted,
		faint: `color-mix(in srgb, ${p.muted} 75%, ${p.paper})`,
		accent: "#0a0714",
		"accent-strong": "#0a0714",
		"accent-soft": p.highlight,
		"accent-contrast": p.highlight,
	},
	dark: {
		background: p.dark.paper,
		surface: p.dark.card,
		elevated: p.dark.well,
		border: p.dark.line,
		"border-strong": p.dark.edge,
		foreground: p.dark.ink,
		secondary: `color-mix(in srgb, ${p.dark.ink} 82%, ${p.dark.paper})`,
		muted: p.dark.muted,
		faint: `color-mix(in srgb, ${p.dark.muted} 70%, ${p.dark.paper})`,
		accent: p.highlight,
		"accent-strong": p.highlight,
		"accent-soft": `color-mix(in srgb, ${p.highlight} 16%, transparent)`,
		"accent-contrast": "#0a0714",
	},
});

const sleeck = sleeckPair({
	paper: "#e0d6ff",
	well: "#cec1ed",
	line: "#ad9bcf",
	muted: "#51446a",
	highlight: "#c4f042",
	dark: { paper: "#1a1333", card: "#0f0c1a", well: "#241a40", line: "#45365f", edge: "#5d4a80", muted: "#b9accf", ink: "#e8e0ff" },
});
const sleeckColors: Record<string, Pair> = {
	sand: sleeckPair({
		paper: "#efe6d5",
		well: "#e0d4bd",
		line: "#bfae8e",
		muted: "#5e5340",
		highlight: "#ff6a1f",
		dark: { paper: "#1c1610", card: "#120e0a", well: "#2a2118", line: "#4a3b2a", edge: "#6b5740", muted: "#c9baa1", ink: "#f6ecda" },
	}),
	fog: sleeckPair({
		paper: "#e2e6ea",
		well: "#d0d6dc",
		line: "#a9b3bd",
		muted: "#4b5661",
		highlight: "#ff4f6d",
		dark: { paper: "#13171b", card: "#0c0f12", well: "#1e242a", line: "#353f49", edge: "#4d5a67", muted: "#aab4be", ink: "#e9eef3" },
	}),
	sage: sleeckPair({
		paper: "#dfe6d6",
		well: "#cdd7c1",
		line: "#a6b496",
		muted: "#4d5a42",
		highlight: "#f2d93b",
		dark: { paper: "#141811", card: "#0d100b", well: "#20271b", line: "#39452f", edge: "#566447", muted: "#b1bda3", ink: "#eaf1e0" },
	}),
};

/* ---- Material 3: tonal palettes. The roles go in as --md-*, and one
   mapping block turns them into the site's tokens. */

type MdPalette = Record<string, string>;
const mdPair = (palette: { light: MdPalette; dark: MdPalette }) => ({ light: palette.light, dark: palette.dark }) as Pair;
const materialMap = {
	background: "var(--md-surface)",
	surface: "var(--md-surface-container-low)",
	elevated: "var(--md-surface-container)",
	border: "var(--md-outline-variant)",
	"border-strong": "color-mix(in srgb, var(--md-on-surface-variant) 45%, var(--md-outline-variant))",
	foreground: "var(--md-on-surface)",
	secondary: "color-mix(in srgb, var(--md-on-surface) 72%, var(--md-on-surface-variant))",
	muted: "var(--md-on-surface-variant)",
	faint: "color-mix(in srgb, var(--md-on-surface-variant) 72%, var(--md-surface))",
	accent: "var(--md-primary)",
	"accent-strong": "var(--md-on-primary-container)",
	"accent-soft": "var(--md-primary-container)",
	"accent-contrast": "var(--md-on-primary)",
};

/* ---- Per-style type, corners and component rules. */

const STYLE_EXTRAS = `
/* ---------------------------------------------------------------------------
 * Type and corners. Tailwind's rounded-* utilities read --radius-*, so one
 * block per style re-cuts every card. Pills (rounded-full) are a fixed value
 * and are handled per style below.
 * ------------------------------------------------------------------------ */

:root[data-skin="classic"] {
	--font-display: "Lexend Variable", ui-sans-serif, system-ui, sans-serif;
	--font-body: "Lexend Variable", ui-sans-serif, system-ui, sans-serif;
	--font-sans: "Lexend Variable", ui-sans-serif, system-ui, sans-serif;
	--radius-2xl: 0.875rem;
	--radius-3xl: 1rem;
}

:root[data-skin="dump"] {
	--font-display: "Anton", "IBM Plex Sans", sans-serif;
	--font-body: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
	--font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
	--radius-md: 0.25rem;
	--radius-lg: 0.3rem;
	--radius-xl: 0.375rem;
	--radius-2xl: 0.375rem;
	--radius-3xl: 0.5rem;
	--skin-edge: var(--color-border-strong);
	--skin-stamp: 3px 3px 0 var(--color-border-strong);
}

:root[data-skin="sleeck"] {
	--font-display: "Space Mono", ui-monospace, monospace;
	--font-body: "DM Sans", ui-sans-serif, system-ui, sans-serif;
	--font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
	--font-mono: "Space Mono", ui-monospace, monospace;
	--radius-md: 0.125rem;
	--radius-lg: 0.2rem;
	--radius-xl: 0.25rem;
	--radius-2xl: 0.25rem;
	--radius-3xl: 0.3rem;
	--skin-edge: var(--color-border-strong);
	--skin-stamp: 4px 4px 0 var(--color-border-strong);
}

:root[data-skin="material"] {
	--font-display: "Google Sans Flex Variable", "Roboto", ui-sans-serif, system-ui, sans-serif;
	--font-body: "Google Sans Flex Variable", "Roboto", ui-sans-serif, system-ui, sans-serif;
	--font-sans: "Google Sans Flex Variable", "Roboto", ui-sans-serif, system-ui, sans-serif;
	--radius-xl: 1rem;
	--radius-2xl: 1.5rem;
	--radius-3xl: 1.75rem;
}

/* Anton ships one weight and is already tight; synthetic bold smears it. */
:root[data-skin="dump"] .font-display {
	font-weight: 400;
	letter-spacing: 0.005em;
}

:root[data-skin="sleeck"] .font-display {
	font-weight: 700;
	letter-spacing: -0.045em;
}

:root[data-skin="material"] .font-display {
	font-weight: 500;
	letter-spacing: -0.02em;
}

/* Stamped cards: an ink outline and a hard shadow with no blur. The dock
   keeps its plain edges; stamped, its dozen small controls read as noise. */
:root:is([data-skin="dump"], [data-skin="sleeck"]) :is(.rounded-xl, .rounded-2xl, .rounded-3xl).border:not([data-settings-dock] *) {
	border-width: 2px;
	border-color: var(--skin-edge);
	box-shadow: var(--skin-stamp);
}

/* Square-cut buttons instead of pills. Dots and avatars stay round. */
:root:is([data-skin="dump"], [data-skin="sleeck"]) :is(a, button).rounded-full,
:root:is([data-skin="dump"], [data-skin="sleeck"]) :is(a, button).rounded-full::before {
	border-radius: var(--radius-lg);
}

:root:is([data-skin="dump"], [data-skin="sleeck"]) :is(a, button).rounded-full.border {
	border-width: 2px;
	border-color: var(--skin-edge);
}

/* Anything round inside a squared control follows it: switch knobs, the
   arrow box on buttons, the colour swatches. Inset by the same 2px. */
:root:is([data-skin="dump"], [data-skin="sleeck"]) :is(a, button).rounded-full > .rounded-full {
	border-radius: max(1px, calc(var(--radius-lg) - 2px));
}

:root[data-skin="sleeck"] :is(a, button).rounded-full:active {
	translate: 2px 2px;
}

/* The highlighter, on selected text. */
:root:is([data-skin="dump"], [data-skin="sleeck"]) ::selection {
	background: var(--color-accent-soft);
	color: var(--color-foreground);
}

/* Material reads as tonal surfaces, not outlines. */
:root[data-skin="material"] :is(.rounded-xl, .rounded-2xl, .rounded-3xl).border:not([data-settings-dock] *) {
	border-color: transparent;
	background-color: var(--color-surface);
}
`;

/* ---- write ---- */

const out: string[] = [
	`/*
 * GENERATED by scripts/generate-skins.ts. Edit that file and run
 * \`bun run skins\`, never this one.
 *
 * Styles and colour combos for the settings dock. Studio is the base palette
 * in global.css and sets no attribute. Every rule keys off \`:root\` so it
 * outranks the base \`html[data-theme]\` and \`.t-dark\`/\`.t-light\` blocks
 * whatever the source order.
 */
`,
];

out.push("/* ---- Studio combos ---- */\n");
for (const [id, pair] of Object.entries(studioColors)) out.push(scope(`${studio}[data-color="${id}"]`, pair));

const styled: [string, Pair, Record<string, Pair>][] = [
	["classic", classic, classicColors],
	["dump", dump, dumpColors],
	["sleeck", sleeck, sleeckColors],
];
for (const [id, base, colors] of styled) {
	out.push(`/* ---- ${id[0].toUpperCase()}${id.slice(1)} ---- */\n`);
	out.push(scope(`:root[data-skin="${id}"]`, base));
	for (const [color, pair] of Object.entries(colors)) out.push(scope(`:root[data-skin="${id}"][data-color="${color}"]`, pair));
}

out.push("/* ---- Material ---- */\n");
const [first, ...rest] = Object.entries(material as Record<string, { light: MdPalette; dark: MdPalette }>);
out.push(scope(`:root[data-skin="material"]`, mdPair(first[1]), "--md-"));
for (const [color, palette] of rest) out.push(scope(`:root[data-skin="material"][data-color="${color}"]`, mdPair(palette), "--md-"));
// The mapping is declared wherever the --md-* roles change, so each subtree
// resolves its own tokens instead of inheriting the root's.
out.push(`:root[data-skin="material"],
:root[data-skin="material"] :is(.t-dark, .t-light) {
${decl(materialMap)}
}
`);

out.push(STYLE_EXTRAS.trimStart());

await Bun.write(new URL("../src/styles/skins.css", import.meta.url), out.join("\n"));
console.log("wrote src/styles/skins.css");
