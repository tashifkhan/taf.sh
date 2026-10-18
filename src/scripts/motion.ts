/*
 * The heavier motion layer for the studio pages: effects that read the native
 * scroll position (velocity marquees, the word scrub), cursor-driven ones
 * (variable-weight proximity, card tilt) and the text tricks (scramble, slot
 * digits). None of it takes over scrolling: the wheel always moves the page
 * at the browser's own speed.
 *
 * Everything here is skipped under prefers-reduced-motion; the page reads
 * fine without any of it.
 */

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(sel));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------- velocity marquees */

/*
 * Each [data-marquee] drifts at a base speed in its own direction, and scroll
 * velocity is added on top, so flicking the page sends the type racing. The
 * skew follows velocity and eases back to zero.
 */
export function marquees() {
	const tracks = $$("[data-marquee]").map((el) => ({
		el,
		dir: Number(el.dataset.marquee) || 1,
		x: 0,
		skew: 0,
		half: 0,
		visible: true,
	}));
	if (!tracks.length) return;

	const measure = () => tracks.forEach((t) => (t.half = t.el.scrollWidth / 2));
	measure();
	addEventListener("resize", measure);
	document.fonts?.ready.then(measure);

	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			const t = tracks.find((t) => t.el === e.target);
			if (t) t.visible = e.isIntersecting;
		}
	});
	tracks.forEach((t) => io.observe(t.el));

	if (reduced) return;
	let last = scrollY;
	let v = 0;
	const frame = () => {
		// Scroll speed in px/frame, smoothed so a single jump doesn't jolt it.
		v = lerp(v, scrollY - last, 0.2);
		last = scrollY;
		for (const t of tracks) {
			if (!t.visible || !t.half) continue;
			t.x -= (0.55 + Math.abs(v) * 0.35) * t.dir * Math.sign(v || 1);
			// Wrap within one copy so the loop is seamless in both directions.
			if (t.x <= -t.half) t.x += t.half;
			if (t.x > 0) t.x -= t.half;
			t.skew = lerp(t.skew, clamp(v * -0.35, -14, 14), 0.12);
			t.el.style.transform = `translate3d(${t.x}px,0,0)`;
			t.el.style.setProperty("--skew", `${t.skew.toFixed(2)}deg`);
		}
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}

/* ------------------------------------------- variable-weight proximity */

/*
 * Letters near the cursor get heavier and relax back as it leaves. Each
 * letter eases toward its target every frame, so a fast swipe leaves a wake
 * instead of snapping. Inter Tight's weight axis runs 100–900.
 */
const presets = {
	hero: { near: 850, far: 650, radius: 220 },
	wordmark: { near: 900, far: 700, radius: 300 },
};

export function proximity() {
	if (reduced || !finePointer) return;
	$$("[data-proximity]").forEach((root) => {
		const axes = root.matches("[data-wordmark]") ? presets.wordmark : presets.hero;
		const letters = $$("[data-l]", root).map((el) => ({ el, g: axes.far }));
		let mx = -1e4;
		let my = -1e4;
		let running = false;
		let visible = false;

		new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible) start();
		}).observe(root);

		addEventListener("pointermove", (e) => {
			mx = e.clientX;
			my = e.clientY;
			start();
		});
		document.addEventListener("pointerleave", () => {
			mx = my = -1e4;
		});

		const start = () => {
			// The hero's letters animate in with CSS first; don't fight that.
			if (running || !visible || !document.documentElement.classList.contains("is-ready")) return;
			running = true;
			requestAnimationFrame(frame);
		};

		const frame = () => {
			let moving = false;
			for (const l of letters) {
				const r = l.el.getBoundingClientRect();
				const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
				const t = 1 - clamp(d / axes.radius);
				const target = lerp(axes.far, axes.near, t * t * (3 - 2 * t));
				l.g = lerp(l.g, target, 0.18);
				if (Math.abs(l.g - target) > 1) moving = true;
				l.el.style.fontWeight = String(Math.round(l.g));
			}
			running = moving && visible;
			if (running) requestAnimationFrame(frame);
		};
	});
}

/* ---------------------------------------------------------- card tilt */

export function tilt() {
	if (reduced || !finePointer) return;
	$$("[data-tilt]").forEach((card) => {
		card.addEventListener("pointermove", (e) => {
			const r = card.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			card.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
			card.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
		});
		card.addEventListener("pointerleave", () => {
			card.style.setProperty("--rx", "0deg");
			card.style.setProperty("--ry", "0deg");
		});
	});
}

/* ------------------------------------------------------- text scramble */

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$abcdefxyz0123456789";

/** Resolve `el`'s text left to right through random glyphs. */
function scramble(el: HTMLElement, text: string, ms = 650) {
	const start = performance.now();
	const len = text.length;
	const frame = (now: number) => {
		const p = clamp((now - start) / ms);
		const settled = Math.floor(p * len);
		let out = text.slice(0, settled);
		for (let i = settled; i < len; i++) {
			out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
		}
		el.textContent = out;
		if (p < 1) requestAnimationFrame(frame);
		else el.textContent = text;
	};
	requestAnimationFrame(frame);
}

export function scrambles() {
	if (reduced) return;
	$$("[data-scramble]").forEach((el) => {
		const text = (el.textContent ?? "").trim();
		if (!text) return;
		// Fix the width so neighbours don't shuffle while glyphs change.
		el.style.minWidth = `${el.getBoundingClientRect().width}px`;
		const io = new IntersectionObserver(([e]) => {
			if (!e.isIntersecting) return;
			io.disconnect();
			scramble(el, text, 900);
		});
		io.observe(el);
		const host = el.closest("a, button") ?? el;
		host.addEventListener("pointerenter", () => scramble(el, text));
	});
}

/* -------------------------------------------------------- slot digits */

/*
 * Each digit becomes a column of 0–9 twice over; landing on the second pass
 * means every digit spins a full turn before it settles.
 */
export function slots() {
	const els = $$("[data-slot]");
	if (!els.length) return;
	const strips: { strip: HTMLElement; to: number }[] = [];

	els.forEach((el) => {
		const value = el.dataset.slot ?? el.textContent ?? "";
		el.setAttribute("aria-label", value);
		el.textContent = "";
		[...value].forEach((ch, i) => {
			const cell = document.createElement("span");
			cell.className = "inline-block h-[1em] overflow-hidden align-top leading-none";
			cell.setAttribute("aria-hidden", "true");
			const strip = document.createElement("span");
			strip.className = "flex flex-col transition-transform ease-expo";
			strip.style.transitionDuration = `${1600 + i * 250}ms`;
			for (let k = 0; k < 20; k++) {
				const d = document.createElement("span");
				d.className = "block h-[1em] leading-none";
				d.textContent = String(k % 10);
				strip.append(d);
			}
			cell.append(strip);
			el.append(cell);
			strips.push({ strip, to: 10 + Number(ch) });
		});
	});

	const go = () => strips.forEach(({ strip, to }) => (strip.style.transform = `translateY(-${to}em)`));
	if (reduced) return go();
	const host = els[0].closest("[data-stats]") ?? els[0];
	const io = new IntersectionObserver(([e]) => {
		if (!e.isIntersecting || !document.documentElement.classList.contains("is-ready")) return;
		io.disconnect();
		go();
	});
	// Re-check once boot finishes, in case the stats were already on screen.
	new MutationObserver(() => {
		if (document.documentElement.classList.contains("is-ready")) {
			io.disconnect();
			io.observe(host);
		}
	}).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
	io.observe(host);
}
