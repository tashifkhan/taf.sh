/*
 * Class strings shared across the studio pages. Plain Tailwind, kept whole
 * so the scanner finds every utility.
 */

export const wrap = "mx-auto w-full max-w-[76rem] px-(--gutter)";
export const section = "relative py-[clamp(4.5rem,9vw,7.5rem)]";
export const head = "mb-[clamp(2.25rem,5vw,3.5rem)]";
export const headRow = "flex flex-wrap items-end justify-between gap-6";

export const kicker = "inline-flex items-center gap-2 font-mono text-xs text-accent";
/* An <em> inside a heading is the accent word: same face, teal, no italics. */
const accentWord = "[&_em]:text-accent [&_em]:not-italic";
export const h1 = `font-display text-[clamp(2.6rem,6.4vw,5.5rem)] leading-[0.95] font-[650] tracking-[-0.04em] text-foreground ${accentWord}`;
export const h2 = `mt-4 font-display text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.02] font-[650] tracking-[-0.035em] text-foreground ${accentWord}`;
export const h3 = "font-display text-xl font-semibold tracking-[-0.02em] text-foreground";
export const lede = "mt-5 max-w-xl text-base leading-7 text-secondary sm:text-[1.0625rem]";

/*
 * Pill buttons. Fixed heights with `items-center` and `leading-none` keep the
 * label and the arrow disc on one centre line; the disc is inset by the same
 * amount on every side. A fill sweeps in from the left on hover and the disc
 * turns. `isolate` keeps the sweep (z -1) above the button's own fill.
 */
export const btn =
	"group/btn relative isolate inline-flex h-11 shrink-0 items-center gap-3 overflow-hidden rounded-full pr-1.5 pl-5 font-display text-[0.9375rem] leading-none font-medium tracking-[-0.01em] whitespace-nowrap translate-x-(--mx) translate-y-(--my) transition-[color,border-color,translate] duration-500 ease-expo before:absolute before:inset-0 before:-z-1 before:origin-left before:scale-x-0 before:rounded-full before:transition-transform before:duration-500 before:ease-expo hover:before:scale-x-100";
export const btnLg = "h-13 pl-6 text-base";
export const btnSm = "h-9 pl-4 text-sm";
/* Buttons without a disc get even padding. */
export const btnPlain = "pr-5";
export const btnAccent = "bg-accent text-accent-contrast before:bg-foreground hover:text-background";
export const btnGhost =
	"border border-border-strong text-foreground before:bg-foreground hover:border-foreground hover:text-background";
export const btnArrow =
	"grid aspect-square h-[calc(100%-0.75rem)] place-items-center rounded-full bg-current/12 text-sm transition-transform duration-500 ease-expo group-hover/btn:-rotate-45";
export const iconBtn =
	"grid size-10 shrink-0 place-items-center rounded-full border border-border-strong text-foreground transition-[color,border-color,background-color,scale] duration-300 hover:border-accent hover:text-accent active:scale-95";

export const chip =
	"inline-flex h-6 items-center rounded-full border border-border px-2.5 font-mono text-[0.6875rem] leading-none text-secondary";
export const chipOn = "border-accent/40 bg-accent-soft text-accent";
export const pill =
	"inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border-strong px-4 font-display text-sm leading-none font-medium text-secondary transition-colors hover:border-foreground hover:text-foreground";

export const card = "rounded-3xl border border-border bg-surface";
export const dot = "inline-block size-[7px] shrink-0 rounded-full bg-accent animate-ping-soft motion-reduce:animate-none";
export const live = "inline-flex items-center gap-2 font-mono text-xs text-accent";
export const tile = "bg-surface p-7";
