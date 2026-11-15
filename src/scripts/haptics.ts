/*
 * Haptic taps on controls, ported from tashif.codes. `web-haptics` (~2.5kB
 * gzipped) is only fetched once a visitor with haptics on first touches the
 * page, so desktop visitors and anyone who turned it off never download it.
 * The import starts on pointerdown, which leaves it loaded by the time the
 * click lands: the iOS path needs the tap's user activation, and an import
 * that resolved after it would lose that.
 */
import type { WebHaptics } from "web-haptics";
import { KEYS, systemReducesMotion } from "./prefs";

// One short pulse per kind. Browsers cannot set motor amplitude, so
// intensity 1 keeps the duration honest instead of faking strength.
const patterns = {
	selection: [{ duration: 4, intensity: 1 }],
	light: [{ duration: 6, intensity: 1 }],
	error: [{ duration: 10, intensity: 1 }],
};
export type HapticKind = keyof typeof patterns;

let engine: WebHaptics | undefined;
let loading: Promise<WebHaptics | undefined> | undefined;
let lastPulse = -Infinity;
let requests = 0;

const load = () =>
	(loading ??= import("web-haptics")
		.then((mod) => (engine = new mod.WebHaptics({ debug: false, showSwitch: false })))
		.catch(() => undefined));

/** On unless the visitor turned it off. Reduced motion turns the default off. */
export function hapticsEnabled(): boolean {
	try {
		const saved = localStorage.getItem(KEYS.haptics);
		if (saved !== null) return saved === "true";
	} catch {}
	return !systemReducesMotion();
}

export function setHapticsEnabled(enabled: boolean): void {
	try {
		localStorage.setItem(KEYS.haptics, String(enabled));
	} catch {}
	if (enabled) void load();
	else engine?.cancel();
}

export function trigger(kind: HapticKind = "light"): void {
	requests++;
	if (document.visibilityState === "hidden" || !hapticsEnabled()) return;
	// Coalesce a control's own call with the delegate's fallback.
	const now = performance.now();
	if (now - lastPulse < 100) return;
	lastPulse = now;
	try {
		if (engine) void engine.trigger(patterns[kind]).catch(() => {});
		else void load();
	} catch {}
}

const controls =
	'a[href], button, summary, [role="button"], [role="tab"], [role="switch"], [role="radio"], [data-haptic]';
const quiet = '[disabled], [aria-disabled="true"], [inert], [data-haptic="off"], [data-haptic="manual"]';

let installed = false;

/** One delegated listener covers every control on the page. */
export function installHaptics(): void {
	if (installed) return;
	installed = true;

	document.addEventListener(
		"pointerdown",
		() => {
			if (hapticsEnabled()) void load();
		},
		{ capture: true, passive: true },
	);

	document.addEventListener(
		"click",
		(event) => {
			if (!event.isTrusted || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
			if (!(event.target instanceof Element)) return;
			const control = event.target.closest<HTMLElement>(controls);
			if (!control || control.closest(quiet)) return;
			if (control.matches('[aria-current="page"], [aria-pressed="true"], [role="radio"][aria-checked="true"]')) return;
			const kind: HapticKind = control.matches('summary, [role="tab"], [role="switch"], [role="radio"], [aria-pressed], [aria-expanded]')
				? "selection"
				: "light";
			const before = requests;
			// Let a control's own handler claim the pulse first.
			setTimeout(() => {
				if (requests === before) trigger(kind);
			}, 0);
		},
		true,
	);

	document.addEventListener(
		"invalid",
		(event) => {
			if (event.isTrusted && navigator.userActivation?.isActive) trigger("error");
		},
		true,
	);

	const cancel = () => {
		engine?.cancel();
		lastPulse = -Infinity;
	};
	document.addEventListener("visibilitychange", () => document.hidden && cancel());
	addEventListener("pagehide", cancel);
}
