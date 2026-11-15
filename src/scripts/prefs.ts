/*
 * Visitor preferences set from the settings dock. Each one lives on <html>
 * (restored before first paint by ThemeScript.astro) and in localStorage.
 *
 * Reduced motion has two sources: the OS setting, which always wins, and the
 * dock's own switch, which sets `data-reduce-motion`. Scripts call
 * motionReduced() instead of reading the media query so both count.
 */

export const KEYS = {
	theme: "taf-theme",
	accent: "taf-accent",
	reduceMotion: "taf-reduce-motion",
	haptics: "taf-haptics",
} as const;

const reduceQuery = "(prefers-reduced-motion: reduce)";

export function systemReducesMotion(): boolean {
	return matchMedia(reduceQuery).matches;
}

export function motionReduced(): boolean {
	return document.documentElement.hasAttribute("data-reduce-motion") || systemReducesMotion();
}

export function setReduceMotion(enabled: boolean): void {
	document.documentElement.toggleAttribute("data-reduce-motion", enabled);
	try {
		if (enabled) localStorage.setItem(KEYS.reduceMotion, "true");
		else localStorage.removeItem(KEYS.reduceMotion);
	} catch {}
}
