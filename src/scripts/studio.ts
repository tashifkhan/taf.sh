/*
 * Every interaction on the studio homepage, wired up in boot(). The heavier
 * scroll and cursor effects live in motion.ts; this file holds the page
 * logic (boot, header, demos, carousel, form, work, reel).
 */
import {
	marquees,
	proximity,
	tilt,
	scrambles,
	slots,
} from "./motion";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	root.querySelector<T>(sel as string) as T | null;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
	Array.from(root.querySelectorAll<T>(sel as string));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Run `fn` while `el` is on screen, stop it when it leaves. */
function whileVisible(el: Element, fn: (alive: () => boolean) => Promise<void> | void) {
	let token = 0;
	new IntersectionObserver(
		([entry]) => {
			token++;
			if (!entry.isIntersecting) return;
			const mine = token;
			fn(() => mine === token);
		},
		{ threshold: 0.25 },
	).observe(el);
}

function onceVisible(el: Element, fn: () => void, threshold = 0.3) {
	const io = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			io.disconnect();
			fn();
		},
		{ threshold },
	);
	io.observe(el);
}

function tween(ms: number, step: (t: number) => void) {
	return new Promise<void>((resolve) => {
		if (reduced) {
			step(1);
			return resolve();
		}
		const start = performance.now();
		const frame = (now: number) => {
			const t = clamp((now - start) / ms);
			step(easeOut(t));
			t < 1 ? requestAnimationFrame(frame) : resolve();
		};
		requestAnimationFrame(frame);
	});
}

/* -------------------------------------------------------------- header */

function header() {
	const head = $("[data-header]");
	const progress = $("[data-progress]");
	let last = scrollY;
	let ticking = false;

	const update = () => {
		ticking = false;
		const y = scrollY;
		const max = document.documentElement.scrollHeight - innerHeight;
		progress?.style.setProperty("--p", String(max > 0 ? y / max : 0));
		head?.classList.toggle("is-scrolled", y > 10);
		// Hide on the way down, return on the way up. Ignore jitter.
		if (Math.abs(y - last) > 6) {
			head?.classList.toggle("is-hidden", y > last && y > 400);
			last = y;
		}
	};
	addEventListener("scroll", () => {
		if (!ticking) requestAnimationFrame(update);
		ticking = true;
	}, { passive: true });
	update();

	// Active section in the nav.
	const links = $$<HTMLAnchorElement>("[data-nav-link]");
	// Links are "#build" on the homepage and "/#build" elsewhere; only the
	// hash names a section, and only the homepage has them.
	const hashOf = (a: HTMLAnchorElement) => new URL(a.href).hash;
	const sections = links
		.map((a) => (hashOf(a) ? document.getElementById(hashOf(a).slice(1)) : null))
		.filter((el): el is HTMLElement => !!el);
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				links.forEach((a) => a.classList.toggle("is-active", hashOf(a) === `#${e.target.id}`));
			}
		},
		{ rootMargin: "-45% 0px -50% 0px" },
	);
	sections.forEach((s) => io.observe(s));

	// Full-screen menu.
	const menu = $("[data-menu]");
	const open = $("[data-menu-open]");
	const setOpen = (on: boolean) => {
		if (!menu || !open) return;
		menu.inert = !on;
		menu.classList.toggle("is-open", on);
		open.setAttribute("aria-expanded", String(on));
		document.body.style.overflow = on ? "hidden" : "";
		if (on) $<HTMLAnchorElement>("[data-menu-link]", menu)?.focus();
		else open.focus();
	};
	open?.addEventListener("click", () => setOpen(true));
	$("[data-menu-close]")?.addEventListener("click", () => setOpen(false));
	$$("[data-menu-link]").forEach((a) => a.addEventListener("click", () => setOpen(false)));
	addEventListener("keydown", (e) => {
		if (!menu?.classList.contains("is-open")) return;
		if (e.key === "Escape") return setOpen(false);
		if (e.key !== "Tab") return;
		const items = $$<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]', menu);
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last?.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first?.focus();
		}
	});
}

/* --------------------------------------------------------------- clock */

function clocks() {
	const els = $$("[data-clock]");
	const fmt = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Kolkata",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
	const tick = () => {
		const t = fmt.format(new Date());
		els.forEach((el) => (el.textContent = t));
	};
	tick();
	setInterval(tick, 1000);
}

/* ---------------------------------------------------------- hero field */

function heroField() {
	const hero = $("[data-hero]");
	const canvas = $<HTMLCanvasElement>("[data-field]");
	if (!hero || !canvas) return;

	const ctx = canvas.getContext("2d")!;
	const gap = 28;
	let w = 0;
	let h = 0;
	let dpr = 1;
	let mx = -9999;
	let my = -9999;
	let raf = 0;
	let visible = true;
	let fg = "#888";
	let accent = "#4fd1c5";

	// Tokens are plain values scoped by media query / data-theme, so read the
	// resolved value off a probe element in the right subtree.
	const readColors = () => {
		const probe = document.createElement("span");
		probe.style.cssText = "position:absolute;visibility:hidden;color:var(--color-faint);background:var(--color-accent)";
		document.body.append(probe);
		const cs = getComputedStyle(probe);
		fg = cs.color;
		accent = cs.backgroundColor;
		probe.remove();
	};

	const resize = () => {
		dpr = Math.min(devicePixelRatio, 2);
		w = canvas.clientWidth;
		h = canvas.clientHeight;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		draw();
	};

	const draw = () => {
		raf = 0;
		ctx.clearRect(0, 0, w, h);
		for (let x = gap / 2; x < w; x += gap) {
			for (let y = gap / 2; y < h; y += gap) {
				const dx = x - mx;
				const dy = y - my;
				const d = Math.sqrt(dx * dx + dy * dy);
				const near = clamp(1 - d / 180);
				// Dots lean away from the pointer and pick up the accent.
				const push = near * 10;
				const px = x + (d ? (dx / d) * push : 0);
				const py = y + (d ? (dy / d) * push : 0);
				ctx.fillStyle = near > 0.05 ? accent : fg;
				ctx.globalAlpha = 0.35 + near * 0.65;
				const r = 1 + near * 1.6;
				ctx.fillRect(px - r / 2, py - r / 2, r, r);
			}
		}
		ctx.globalAlpha = 1;
	};

	const schedule = () => {
		if (!raf && visible) raf = requestAnimationFrame(draw);
	};

	hero.addEventListener("pointermove", (e) => {
		const rect = canvas.getBoundingClientRect();
		mx = e.clientX - rect.left;
		my = e.clientY - rect.top;
		if (!reduced) schedule();
	});
	hero.addEventListener("pointerleave", () => {
		mx = my = -9999;
		schedule();
	});

	new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
	// Resizing the backing store inside the observer callback trips the
	// "ResizeObserver loop" warning, so defer it a frame.
	new ResizeObserver(() => requestAnimationFrame(resize)).observe(canvas);
	new MutationObserver(() => {
		readColors();
		draw();
	}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style"] });
	matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
		readColors();
		draw();
	});
	readColors();
	resize();

	// Blueprint geometry + headline stroke-to-fill intro (adapted from thebuildco.studio).
	const geo = $("[data-geo]");
	const geom = $("[data-geom]");
	const coords = $("[data-coords]");
	const vhEl = $("[data-vh]");
	const updateVh = () => {
		if (vhEl) vhEl.textContent = `h ${innerHeight.toLocaleString("en-US")} px`;
	};
	updateVh();
	addEventListener("resize", updateVh);

	if (!reduced) {
		addEventListener(
			"pointermove",
			(e) => {
				if (scrollY > innerHeight * 1.4) return;
				const nx = e.clientX / innerWidth - 0.5;
				const ny = e.clientY / innerHeight - 0.5;
				if (geom) geom.style.transform = `translate3d(${(nx * -26).toFixed(1)}px,${(ny * -18).toFixed(1)}px,0)`;
				if (coords) {
					coords.textContent = `x ${String(Math.round(e.clientX)).padStart(4, "0")} · y ${String(Math.round(e.clientY + scrollY)).padStart(4, "0")}`;
				}
			},
			{ passive: true },
		);
		addEventListener(
			"scroll",
			() => {
				if (geo && scrollY < innerHeight * 1.5) {
					geo.style.transform = `translate3d(0,${(scrollY * 0.35).toFixed(1)}px,0)`;
				}
			},
			{ passive: true },
		);
	}

	// Draw in the SVG blueprint strokes.
	$$<SVGGeometryElement>("[data-geo-d]", hero).forEach((shape, i) => {
		if (reduced) return;
		let len = 0;
		try {
			len = shape.getTotalLength();
		} catch {
			return;
		}
		const dash = shape.getAttribute("stroke-dasharray");
		shape.style.strokeDasharray = `${len} ${len}`;
		shape.style.strokeDashoffset = String(len);
		setTimeout(() => {
			shape.style.transition = "stroke-dashoffset 2.1s cubic-bezier(0.6,0,0.2,1)";
			shape.style.strokeDashoffset = "0";
			if (dash) {
				setTimeout(() => {
					shape.style.transition = "";
					shape.style.strokeDasharray = dash;
					shape.style.strokeDashoffset = "";
				}, 2200);
			}
		}, 120 + i * 110);
	});

	// Type in the top kicker.
	const kickerEl = $<HTMLElement>("[data-hero-kicker]", hero);
	if (kickerEl && !reduced) {
		const full = kickerEl.dataset.heroKicker ?? kickerEl.textContent ?? "";
		kickerEl.textContent = "";
		tween(950, (t) => {
			const n = Math.round(full.length * t);
			kickerEl.textContent = full.slice(0, n) + (t > 0 && t < 1 ? "_" : "");
		});
	}

	// Headline dimension callouts + stroke-to-fill wipe.
	const h1 = $<HTMLElement>("[data-hero-h1]", hero);
	const fill = $<HTMLElement>("[data-hf]", hero);
	const out = $<HTMLElement>("[data-ho]", hero);
	if (h1 && fill && out) {
		if (reduced) {
			fill.style.clipPath = "none";
			out.style.opacity = "0";
			h1.setAttribute("data-live", "");
			return;
		}
		const runIntro = () => {
			const hd = $$<HTMLElement>("[data-hd]", h1);
			const hl = $$<HTMLElement>("[data-hl]", h1);
			const fs = parseFloat(getComputedStyle(h1).fontSize);
			const labels = [
				`w ${h1.offsetWidth.toLocaleString("en-US")}.0 px`,
				`cap ${(fs * 0.7).toFixed(1)}\n${Math.round(fs)} / lh .98`,
			];
			hl.forEach((el, i) => {
				const txt = labels[i] ?? "";
				let n = 0;
				const iv = setInterval(() => {
					n++;
					el.textContent = txt.slice(0, n);
					if (n >= txt.length) clearInterval(iv);
				}, 26);
			});
			requestAnimationFrame(() =>
				hd.forEach((el, i) => {
					el.style.transition = `transform 0.85s cubic-bezier(0.7,0,0.2,1) ${i * 0.055}s`;
					el.style.transform = "scale(1,1)";
				}),
			);
			setTimeout(() => {
				fill.style.transition = "clip-path 1.15s cubic-bezier(0.7,0,0.2,1)";
				fill.style.clipPath = "inset(-0.08em 0 -0.15em 0)";
				out.style.opacity = "0";
			}, 950);
			setTimeout(() => {
				hd.forEach((el) => {
					el.style.transition = "transform 0.65s cubic-bezier(0.7,0,0.2,1), opacity 0.65s";
					el.style.transform = "";
					el.style.opacity = "0";
				});
				hl.forEach((el) => {
					el.style.transition = "opacity 0.45s";
					el.style.opacity = "0";
				});
				h1.setAttribute("data-live", "");
			}, 2350);
		};
		if (document.fonts?.ready) document.fonts.ready.then(runIntro);
		else runIntro();
	}
}

/* -------------------------------------------------- split headings */

function splitHeadings() {
	// Each word rises out of its own clipped box once the heading scrolls in.
	const outer = "inline-block overflow-clip pb-[0.1em] -mb-[0.1em] align-top";
	const inner =
		"inline-block translate-y-[110%] rotate-6 transition-[translate,rotate] duration-1000 ease-expo [transition-delay:calc(var(--wi)*60ms)] in-[.is-in]:translate-y-0 in-[.is-in]:rotate-0 motion-reduce:translate-y-0 motion-reduce:rotate-0 motion-reduce:transition-none";
	const wrapWord = (html: string, i: number) =>
		`<span class="${outer}" aria-hidden="true"><span class="${inner}" style="--wi:${i}">${html}</span></span>`;

	$$("[data-split]").forEach((h) => {
		h.setAttribute("aria-label", (h.textContent ?? "").replace(/\s+/g, " ").trim());
		const parts: string[] = [];
		let i = 0;
		h.childNodes.forEach((node) => {
			if (node.nodeType === Node.TEXT_NODE) {
				for (const w of (node.textContent ?? "").split(/\s+/).filter(Boolean)) parts.push(wrapWord(w, i++));
			} else if (node instanceof HTMLElement) {
				// An <em> stays one unit so it keeps its serif styling.
				parts.push(wrapWord(node.outerHTML, i++));
			}
		});
		h.innerHTML = parts.join(" ");
		onceVisible(h, () => h.classList.add("is-in"), 0.4);
	});

	const mark = $("[data-wordmark]");
	if (mark) onceVisible(mark, () => mark.classList.add("is-in"), 0.2);
}

/* ------------------------------------------------- service demos */

function demos() {
	const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
	const backOut = (t: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
	};

	const periods: Record<string, number> = { web: 6, api: 2.6, int: 7, ai: 6.5 };
	type TileState = {
		k: string;
		el: HTMLElement;
		ph: number;
		sp: number;
		spT: number;
		vis: boolean;
		period: number;
		blocks: { f: HTMLElement | null; on: boolean }[];
		ws: HTMLElement | null;
		route: HTMLElement | null;
		pk: HTMLElement[];
		lat: HTMLElement[];
		apir: HTMLElement | null;
		lastJ: number;
		plugs: HTMLElement[];
		is: HTMLElement | null;
		tok: HTMLElement[];
		as: HTMLElement | null;
		shown: number;
	};

	const tiles: Record<string, TileState> = {};
	$$<HTMLElement>("[data-tile]").forEach((t) => {
		const k = t.dataset.tile ?? "";
		tiles[k] = {
			k,
			el: t,
			ph: 0,
			sp: 1,
			spT: 1,
			vis: false,
			period: periods[k] ?? 6,
			blocks: $$("[data-wb]", t).map((b) => ({ f: $("[data-wf]", b), on: false })),
			ws: $("[data-ws]", t),
			route: $("[data-route]", t),
			pk: $$("[data-pk]", t),
			lat: $$("[data-lat]", t),
			apir: $("[data-apir]", t),
			lastJ: 0,
			plugs: $$("[data-plug]", t),
			is: $("[data-is]", t),
			tok: $$("[data-tok]", t),
			as: $("[data-as]", t),
			shown: -1,
		};
		t.addEventListener("pointerenter", () => (tiles[k].spT = 2.8));
		t.addEventListener("pointerleave", () => (tiles[k].spT = 1));
	});

	const stepTile = (d: TileState, now: number) => {
		if (d.k === "web") {
			let c = 0;
			d.blocks.forEach((b, idx) => {
				const on = d.ph > 0.06 + idx * 0.085 && d.ph < 0.9;
				if (on) c++;
				if (on !== b.on && b.f) {
					b.on = on;
					b.f.style.opacity = on ? "1" : "0";
					b.f.style.transform = on ? "scale(1)" : "scale(0.95)";
				}
			});
			const txt = `${c === d.blocks.length ? "layout" : "wireframe"} ${c}/${d.blocks.length}`;
			if (d.ws && d.ws.textContent !== txt) d.ws.textContent = txt;
		} else if (d.k === "api") {
			const W = d.route?.offsetWidth || 220;
			d.pk.forEach((p, idx) => {
				const q = (d.ph + idx / 3) % 1;
				const fw = q < 0.5;
				const x = fw ? q * 2 * W : (1 - (q - 0.5) * 2) * W;
				p.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
				p.style.opacity = fw ? "1" : "0.7";
			});
			if (now - d.lastJ > 380 / d.sp) {
				d.lastJ = now;
				const f = d.sp > 1.5 ? 0.65 : 1;
				const v = [8 + Math.random() * 6, 20 + Math.random() * 14, 2 + Math.random() * 3].map((x) => x * f);
				d.lat.forEach((el, idx) => (el.textContent = `${idx === 2 ? v[idx].toFixed(1) : Math.round(v[idx])}ms`));
				if (d.apir) {
					d.apir.textContent = `p95 ${Math.round((v[0] + v[1] + v[2]) * 1.15)}ms · ${Math.round(2000 * d.sp + Math.random() * 280).toLocaleString("en-US")} req/m`;
				}
			}
		} else if (d.k === "int") {
			let c = 0;
			d.plugs.forEach((p, idx) => {
				const q = (d.ph + idx * 0.25) % 1;
				let y = 0;
				let o = 1;
				if (q < 0.14) {
					const v = q / 0.14;
					y = -20 * (1 - backOut(v));
					o = clamp(v * 2);
				} else if (q > 0.9) {
					const v = (q - 0.9) / 0.1;
					y = -20 * v;
					o = 1 - v;
				}
				if (q >= 0.14 && q <= 0.9) c++;
				p.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
				p.style.opacity = o.toFixed(3);
			});
			const txt = `linked ${c}/4`;
			if (d.is && d.is.textContent !== txt) d.is.textContent = txt;
		} else if (d.k === "ai") {
			const N = d.tok.length;
			const shown = Math.floor(clamp(d.ph / 0.8) * N);
			if (shown !== d.shown) {
				d.shown = shown;
				d.tok.forEach((el, idx) => {
					el.style.opacity = idx < shown ? "1" : "0";
					el.style.backgroundColor =
						shown < N && idx === shown - 1
							? "var(--color-accent-soft)"
							: "transparent";
				});
				if (d.as) d.as.textContent = `${shown} tok · ${Math.round(52 * d.sp)} tok/s`;
			}

		}
	};

	if (reduced) {
		const fin: Record<string, number> = { web: 0.8, api: 0.3, int: 0.5, ai: 0.85 };
		Object.values(tiles).forEach((d) => {
			d.ph = fin[d.k] ?? 0.75;
			stepTile(d, 0);
		});
		return;
	}

	let tk = 0;
	let lt = performance.now();
	const tick = (now: number) => {
		const dt = Math.min(0.05, (now - lt) / 1000);
		lt = now;
		let any = false;
		for (const k in tiles) {
			const d = tiles[k];
			if (!d.vis) continue;
			any = true;
			d.sp += (d.spT - d.sp) * Math.min(1, dt * 5);
			d.ph = (d.ph + (dt * d.sp) / d.period) % 1;
			stepTile(d, now);
		}
		tk = any ? requestAnimationFrame(tick) : 0;
	};
	const startTick = () => {
		if (!tk) {
			lt = performance.now();
			tk = requestAnimationFrame(tick);
		}
	};

	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				const k = (e.target as HTMLElement).dataset.tile;
				if (k && tiles[k]) tiles[k].vis = e.isIntersecting;
			});
			startTick();
		},
		{ rootMargin: "80px" },
	);
	Object.values(tiles).forEach((d) => io.observe(d.el));

	// Spotlight position for every card.
	$$("[data-spotlight]").forEach((c) =>
		c.addEventListener("pointermove", (e) => {
			const r = c.getBoundingClientRect();
			c.style.setProperty("--sx", `${e.clientX - r.left}px`);
			c.style.setProperty("--sy", `${e.clientY - r.top}px`);
		}),
	);
}

/* ------------------------------------------------ work hover preview */

function workPreview() {
	const card = $("[data-preview-card]");
	const img = $<HTMLImageElement>("[data-preview-img]");
	const nameEl = $("[data-preview-name-el]");
	const metaEl = $("[data-preview-meta-el]");
	if (!card || !img || !finePointer) return;

	// Keep the floating card on <body> so no ancestor transform or will-change
	// on [data-page] can hijack its fixed viewport coordinates.
	if (card.parentElement !== document.body) document.body.append(card);

	let x = 0;
	let y = 0;
	let tx = 0;
	let ty = 0;
	let raf = 0;

	const targetPos = (e: PointerEvent) => {
		const cw = 336;
		const ch = 240;
		const rightSpace = innerWidth - e.clientX;
		const nx = rightSpace > cw + 40 ? e.clientX + 24 : e.clientX - cw - 24;
		const ny = clamp(e.clientY - ch / 2, 16, innerHeight - ch - 16);
		return [nx, ny] as const;
	};

	const paint = (tiltDeg = 0) => {
		card.style.setProperty("--px", `${x.toFixed(1)}px`);
		card.style.setProperty("--py", `${y.toFixed(1)}px`);
		card.style.setProperty("--pr", `${tiltDeg.toFixed(2)}deg`);
	};

	const loop = () => {
		x += (tx - x) * 0.18;
		y += (ty - y) * 0.18;
		const tilt = clamp((tx - x) / 36, -1, 1) * 5;
		paint(tilt);
		raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.4 ? requestAnimationFrame(loop) : 0;
	};

	$$("[data-preview]").forEach((row) => {
		const src = row.dataset.preview;
		if (!src) return;
		row.addEventListener("pointerenter", (e) => {
			img.src = src;
			if (nameEl) nameEl.textContent = row.dataset.previewName ?? "";
			if (metaEl) metaEl.textContent = row.dataset.previewMeta ?? "";
			const [nx, ny] = targetPos(e);
			x = tx = nx;
			y = ty = ny;
			paint(0);
			card.classList.add("on");
		});
		row.addEventListener("pointermove", (e) => {
			[tx, ty] = targetPos(e);
			if (!raf) raf = requestAnimationFrame(loop);
		});
		row.addEventListener("pointerleave", () => card.classList.remove("on"));
	});
}

/* ---------------------------------------------------- notes carousel */

function notesCarousel() {
	const slides = $$("[data-note]");
	const bars = $$("[data-note-bars] > span");
	const index = $("[data-note-index]");
	const root = $("[data-notes]");
	if (!slides.length || !root) return;

	const ms = 6500;
	let current = 0;
	let timer = 0;
	let paused = false;

	const show = (i: number) => {
		current = (i + slides.length) % slides.length;
		slides.forEach((s, j) => s.setAttribute("aria-hidden", String(j !== current)));
		bars.forEach((b, j) => {
			b.classList.toggle("done", j < current);
			b.classList.remove("run");
		});
		// Restart the running bar's animation.
		void bars[current]?.offsetWidth;
		if (!reduced) bars[current]?.classList.add("run");
		if (index) index.textContent = String(current + 1).padStart(2, "0");
		schedule();
	};
	const schedule = () => {
		clearTimeout(timer);
		if (!reduced && !paused) timer = window.setTimeout(() => show(current + 1), ms);
	};

	$("[data-note-prev]")?.addEventListener("click", () => show(current - 1));
	$("[data-note-next]")?.addEventListener("click", () => show(current + 1));
	root.addEventListener("pointerenter", () => {
		paused = true;
		clearTimeout(timer);
	});
	root.addEventListener("pointerleave", () => {
		paused = false;
		show(current);
	});

	// Swipe on touch.
	let sx = 0;
	root.addEventListener("pointerdown", (e) => (sx = e.clientX));
	root.addEventListener("pointerup", (e) => {
		const d = e.clientX - sx;
		if (Math.abs(d) > 40) show(current + (d < 0 ? 1 : -1));
	});

	whileVisible(root, (alive) => {
		if (alive()) show(current);
	});
}

/* ---------------------------------------------------------- contact */

function contactForm() {
	$$<HTMLButtonElement>("[data-copy-email]").forEach((btn) => {
		const addr = btn.dataset.copyEmail ?? "";
		const initial = btn.textContent ?? "copy address";
		let t = 0;
		btn.addEventListener("click", async () => {
			try {
				await navigator.clipboard.writeText(addr);
				btn.textContent = "copied ✓";
				clearTimeout(t);
				t = window.setTimeout(() => (btn.textContent = initial), 1800);
			} catch {}
		});
	});

	const wrap = $("[data-form-wrap]");
	const form = $<HTMLFormElement>("[data-form]");
	const error = $("[data-form-error]");
	if (!wrap || !form || !error) return;

	form.addEventListener("submit", (e) => {
		e.preventDefault();
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const mail = String(data.get("email") ?? "").trim();
		const brief = String(data.get("brief") ?? "").trim();
		const budget = String(data.get("budget") ?? "");

		const fields: [string, boolean, string][] = [
			["name", !!name, "Add your name so I know who's writing."],
			["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail), "That email doesn't look right."],
			["brief", brief.length >= 20, "Give the brief a sentence or two, at least 20 characters."],
		];
		let firstBad: HTMLElement | null = null;
		error.textContent = "";
		for (const [field, ok, msg] of fields) {
			const input = form.elements.namedItem(field) as HTMLElement;
			input.setAttribute("aria-invalid", String(!ok));
			if (!ok && !firstBad) {
				firstBad = input;
				// Re-set on the next frame so the shake replays on repeat errors.
				requestAnimationFrame(() => (error.textContent = msg));
			}
		}
		if (firstBad) return firstBad.focus();

		const ref = `taf-${Date.now().toString(36).slice(-4)}`;
		const subject = `Project brief from ${name} [${ref}]`;
		const body = `${brief}\n\nBudget: ${budget}\nReply to: ${mail}\nRef: ${ref}`;
		location.href = `mailto:${form.action.replace(/^mailto:/, "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

		$("[data-done-name]")!.textContent = name.split(" ")[0];
		$("[data-done-ref]")!.textContent = ref;
		wrap.dataset.state = "sent";
		$("[data-form-done]")?.focus();
	});

	$("[data-form-reset]")?.addEventListener("click", () => {
		form.reset();
		wrap.dataset.state = "idle";
		(form.elements.namedItem("name") as HTMLElement).focus();
	});
}

/* ----------------------------------------------------------- galleries */

/*
 * Screenshot carousels (Gallery.astro): arrows, swipe through native
 * scroll-snap, a live counter, and a wipe-in the first time each one scrolls
 * into view.
 */
function galleries() {
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				e.target.classList.add("in");
				io.unobserve(e.target);
			}
		},
		{ threshold: 0.15 },
	);
	const watch = (g: Element) => io.observe(g);

	$$("[data-gallery]").forEach((g) => {
		const track = $("[data-gallery-track]", g)!;
		const prev = $<HTMLButtonElement>("[data-gallery-prev]", g);
		const next = $<HTMLButtonElement>("[data-gallery-next]", g);
		const index = $("[data-gallery-index]", g);
		const count = track.children.length;
		const at = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
		const sync = () => {
			const i = at();
			if (index) index.textContent = String(i + 1).padStart(2, "0");
			if (prev) prev.disabled = i <= 0;
			if (next) next.disabled = i >= count - 1;
		};
		const go = (dir: number) =>
			track.scrollTo({ left: (at() + dir) * track.clientWidth, behavior: reduced ? "auto" : "smooth" });
		prev?.addEventListener("click", () => go(-1));
		next?.addEventListener("click", () => go(1));
		track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
		sync();
		watch(g);
	});
}

/* --------------------------------------------------------------- work */

/*
 * The work section: filter chips show one group or both, and the index in
 * the sticky column highlights whichever project is in the middle of the
 * screen.
 */
function workIndex() {
	const root = $("#work");
	if (!root) return;
	const links = $$<HTMLAnchorElement>("[data-work-link]", root);
	const projects = $$("[data-project]", root);

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				links.forEach((l) => l.classList.toggle("is-active", l.hash === `#${e.target.id}`));
			}
		},
		{ rootMargin: "-45% 0px -50% 0px" },
	);
	projects.forEach((p) => io.observe(p));

	const filters = $$<HTMLButtonElement>("[data-filter]", root);
	filters.forEach((btn) =>
		btn.addEventListener("click", () => {
			const group = btn.dataset.filter;
			filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
			const show = (g?: string) => group === "all" || g === group;
			$$("[data-group-section]", root).forEach((el) => (el.hidden = !show(el.dataset.groupSection)));
			$$("[data-index-group]", root).forEach((el) => (el.hidden = !show(el.dataset.indexGroup)));
			// Keep the section top in view so the change is visible.
			if (root.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
		}),
	);
}

/* --------------------------------------------------------------- reel */

/*
 * The slide-over work view. Opening: <html> gets `reel-open` (the page
 * shrinks into the left half, see index.astro), the dialog gets `is-open` a
 * frame later so its panels transition in. Closing runs the same in reverse
 * and only then calls dialog.close(), so Esc animates too. A trigger with
 * data-reel-target opens the view scrolled to that project.
 */
function reel() {
	const dialog = $<HTMLDialogElement>("[data-reel]");
	const list = $("[data-reel-list]");
	if (!dialog || !list) return;
	const root = document.documentElement;
	const page = $<HTMLElement>("[data-page]");
	const panel = $<HTMLElement>("[data-reel-panel]", dialog);
	const handle = $<HTMLElement>("[data-reel-handle]", dialog);
	const bg = $<HTMLElement>("[data-wlbg]", dialog);
	const wlItems = $$<HTMLElement>("[data-wl]", dialog);
	const E = "cubic-bezier(0.76,0,0.24,1)";
	const O = "cubic-bezier(0.2,0.8,0.2,1)";
	let timers: number[] = [];
	let isClosing = false;
	let isExpanded = false;
	let baseScrollTop = 0;

	const isMobile = () => innerWidth < 1024;
	const peekPx = () => Math.round(innerHeight * 0.34);

	const setExpanded = (expanded: boolean) => {
		isExpanded = expanded;
		dialog.classList.toggle("is-expanded", expanded);
		panel?.style.removeProperty("--sheet-y");
		if (!expanded) baseScrollTop = list.scrollTop;
		if (page && isMobile() && dialog.classList.contains("is-open") && !isClosing && !reduced) {
			page.style.transform = expanded ? "scale(0.9)" : "scale(0.94)";
			page.style.opacity = expanded ? "0.18" : "0.42";
		}
	};

	const clearTimers = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};
	const later = (fn: () => void, ms: number) => {
		timers.push(window.setTimeout(fn, ms));
	};

	const cleanupPage = () => {
		if (!page) return;
		page.style.transition = "none";
		page.style.clipPath = "";
		page.style.transformOrigin = "";
		page.style.transform = "";
		page.style.opacity = "";
		void page.offsetWidth;
		page.style.transition = "";
	};

	const applySplit = (openState: boolean, then?: () => void) => {
		clearTimers();
		if (!page || reduced) {
			if (openState) {
				root.classList.add("reel-open");
				document.body.style.overflow = "hidden";
				if (!dialog.open) dialog.showModal();
				dialog.classList.add("is-open");
				if (bg) bg.style.opacity = "1";
				wlItems.forEach((i) => (i.style.opacity = "1"));
			} else {
				dialog.classList.remove("is-open");
				root.classList.remove("reel-open");
				dialog.close();
				document.body.style.overflow = "";
				then?.();
			}
			return;
		}

		const vw = root.clientWidth;
		const vh = innerHeight;
		const mobile = innerWidth < 1024;
		const sy = scrollY;
		const top = Math.max(0, sy - page.offsetTop);
		const H = page.offsetHeight;
		const bot = Math.max(0, H - top - vh);

		if (mobile) {
			if (openState) {
				isExpanded = false;
				dialog.classList.remove("is-expanded", "is-dragging");
				panel?.style.removeProperty("--sheet-y");
				root.classList.add("reel-open");
				document.body.style.overflow = "hidden";
				page.style.transition = "none";
				page.style.transformOrigin = `50% ${top + vh / 2}px`;
				page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round 0px)`;
				if (!dialog.open) dialog.showModal();
				void page.offsetWidth;
				void dialog.offsetWidth;
				dialog.classList.add("is-open");
				page.style.transition = `transform 0.65s ${E}, clip-path 0.65s ${E}, opacity 0.65s`;
				page.style.transform = "scale(0.94)";
				page.style.opacity = "0.42";
				page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round 24px)`;
			} else {
				dialog.classList.remove("is-open", "is-expanded", "is-dragging");
				panel?.style.removeProperty("--sheet-y");
				root.classList.remove("reel-open");
				page.style.transition = `transform 0.65s ${E}, clip-path 0.65s ${E}, opacity 0.65s`;
				page.style.transform = "";
				page.style.opacity = "";
				page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round 0px)`;
				later(() => {
					dialog.close();
					cleanupPage();
					document.body.style.overflow = "";
					isClosing = false;
					then?.();
				}, 660);
			}
			return;
		}

		const colW = vw * 0.42;
		const pad = 18;
		const sc = (colW - pad * 2) / vw;
		const cTop = (vh - vh * sc) / 2;
		const rad = 14;
		const cardClip = `inset(${cTop.toFixed(1)}px ${pad}px ${cTop.toFixed(1)}px ${pad}px round ${rad}px)`;

		if (openState) {
			root.classList.add("reel-open");
			document.body.style.overflow = "hidden";
			page.style.transition = "none";
			page.style.transformOrigin = "0 0";
			page.style.opacity = "1";
			page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round 0px)`;
			if (bg) {
				bg.style.transition = "none";
				bg.style.clipPath = cardClip;
				bg.style.opacity = "0";
			}
			wlItems.forEach((i) => {
				i.style.transition = "none";
				i.style.opacity = "0";
				i.style.transform = "translate3d(0,32px,0)";
			});
			if (!dialog.open) dialog.showModal();
			void page.offsetWidth;
			void dialog.offsetWidth;
			dialog.classList.add("is-open");
			page.style.transition = `transform 0.82s ${E}, clip-path 0.82s ${E}, opacity 0.22s`;
			page.style.transform = `translate3d(${pad}px,${(cTop + top * (1 - sc)).toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
			page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round ${(rad / sc).toFixed(1)}px)`;

			later(() => {
				if (bg) {
					bg.style.transition = "opacity 0.22s";
					bg.style.opacity = "1";
				}
				page.style.opacity = "0";
			}, 820);

			later(() => {
				if (bg) {
					bg.style.transition = `clip-path 0.72s ${E}`;
					bg.style.clipPath = "inset(0px 0px 0px 0px round 0px)";
				}
				wlItems.forEach((i, k) => {
					const d = (0.14 + k * 0.065).toFixed(2);
					i.style.transition = `opacity 0.55s ${O} ${d}s, transform 0.85s ${O} ${d}s`;
					i.style.opacity = "1";
					i.style.transform = "none";
				});
			}, 1020);
		} else {
			dialog.classList.remove("is-open");
			wlItems.forEach((i) => {
				i.style.transition = `opacity 0.2s, transform 0.28s ${E}`;
				i.style.opacity = "0";
				i.style.transform = "translate3d(0,-14px,0)";
			});
			if (bg) {
				bg.style.transition = `clip-path 0.52s ${E} 0.1s`;
				bg.style.clipPath = cardClip;
			}
			later(() => {
				page.style.transition = "opacity 0.2s";
				page.style.opacity = "1";
				if (bg) {
					bg.style.transition = "opacity 0.2s";
					bg.style.opacity = "0";
				}
			}, 620);
			later(() => {
				page.style.transition = `transform 0.8s ${E}, clip-path 0.8s ${E}`;
				page.style.transform = "";
				page.style.clipPath = `inset(${top}px 0 ${bot}px 0 round 0px)`;
				root.classList.remove("reel-open");
			}, 800);
			later(() => {
				dialog.close();
				cleanupPage();
				document.body.style.overflow = "";
				isClosing = false;
				then?.();
			}, 1620);
		}
	};

	const open = (target?: string) => {
		if (dialog.open && !isClosing) return;
		isClosing = false;
		applySplit(true);
		list.focus({ preventScroll: true });
		const el = target ? document.getElementById(target) : null;
		list.scrollTop = el ? el.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop - 24 : 0;
		baseScrollTop = list.scrollTop;
		requestAnimationFrame(() => (baseScrollTop = list.scrollTop));
	};

	const close = (then?: () => void) => {
		if (!dialog.open || isClosing) return then?.();
		isClosing = true;
		applySplit(false, then);
	};

	$$("[data-reel-open]").forEach((b) => b.addEventListener("click", () => open(b.dataset.reelTarget)));
	$$("[data-reel-close]", dialog).forEach((b) => b.addEventListener("click", () => close()));
	$("[data-reel-contact]", dialog)?.addEventListener("click", () =>
		close(() => document.getElementById("contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })),
	);
	// Tap on the exposed backdrop above the mobile sheet closes the reel.
	dialog.addEventListener("click", (e) => {
		if (!isMobile() || !dialog.open || isClosing) return;
		const t = e.target as Node;
		if (panel && !panel.contains(t)) close();
	});

	// Mobile sheet: expand to full screen on scroll, pull up/down via handle or overscroll.
	let dragging = false;
	let dragMoved = false;
	let startX = 0;
	let startY = 0;
	let lastY = 0;
	let startT = 0;
	let startExpanded = false;
	let fromHandle = false;

	list.addEventListener(
		"scroll",
		() => {
			if (!isMobile() || !dialog.classList.contains("is-open") || isClosing || dragging || isExpanded) return;
			if (list.scrollTop > baseScrollTop + 8) setExpanded(true);
		},
		{ passive: true },
	);
	panel?.addEventListener(
		"wheel",
		(e) => {
			if (!isMobile() || !dialog.classList.contains("is-open") || isClosing || isExpanded) return;
			if (e.deltaY > 8) setExpanded(true);
		},
		{ passive: true },
	);

	const beginDrag = (x: number, y: number, target: Element | null) => {
		if (!isMobile() || !dialog.classList.contains("is-open") || isClosing || !panel) return false;
		if (target?.closest("[data-gallery], video")) return false;
		dragging = false;
		dragMoved = false;
		startX = x;
		startY = lastY = y;
		startT = performance.now();
		startExpanded = isExpanded;
		fromHandle = !!target?.closest("[data-reel-handle], [data-reel-header]");
		if (target?.closest("button:not([data-reel-handle]), a")) fromHandle = false;
		return true;
	};

	const moveDrag = (x: number, y: number, ev?: Event) => {
		if (!panel || !isMobile()) return;
		const dx = x - startX;
		const dy = y - startY;
		lastY = y;

		if (!dragging) {
			if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) return;
			const atTop = list.scrollTop <= 2;
			const canPullUp = !startExpanded && dy < -8;
			const canPullDown = (fromHandle || atTop) && dy > 8;
			const canHandleDrag = fromHandle && Math.abs(dy) > 6;
			if (!canPullUp && !canPullDown && !canHandleDrag) return;
			dragging = true;
			dragMoved = true;
			dialog.classList.add("is-dragging");
		}

		if (ev?.cancelable) ev.preventDefault();
		const baseY = startExpanded ? 0 : peekPx();
		const nextY = Math.max(0, baseY + dy);
		dialog.classList.toggle("is-expanded", nextY <= 4);
		panel.style.setProperty("--sheet-y", `${nextY.toFixed(1)}px`);
	};

	const endDrag = () => {
		if (!dragging || !panel) return;
		dragging = false;
		dialog.classList.remove("is-dragging");
		const dy = lastY - startY;
		const dt = Math.max(16, performance.now() - startT);
		const vy = dy / dt; // px/ms (+ down, - up)

		if (!startExpanded) {
			if (dy < -36 || vy < -0.3) setExpanded(true);
			else if (dy > 68 || vy > 0.45) close();
			else setExpanded(false);
		} else {
			if (dy > peekPx() + 68 || vy > 0.85) close();
			else if (dy > 56 || vy > 0.32) setExpanded(false);
			else setExpanded(true);
		}
	};

	let touchActive = false;
	panel?.addEventListener(
		"touchstart",
		(e) => {
			if (e.touches.length !== 1) return;
			const t = e.touches[0];
			touchActive = beginDrag(t.clientX, t.clientY, e.target as Element);
		},
		{ passive: true },
	);
	panel?.addEventListener(
		"touchmove",
		(e) => {
			if (!touchActive || e.touches.length !== 1) return;
			const t = e.touches[0];
			moveDrag(t.clientX, t.clientY, e);
		},
		{ passive: false },
	);
	const finishTouch = () => {
		if (!touchActive) return;
		touchActive = false;
		endDrag();
	};
	panel?.addEventListener("touchend", finishTouch);
	panel?.addEventListener("touchcancel", finishTouch);

	// Pointer drag on the handle bar (also works with mouse in mobile DevTools).
	let pointerId: number | null = null;
	handle?.addEventListener("pointerdown", (e) => {
		if (e.pointerType === "touch" || !beginDrag(e.clientX, e.clientY, handle)) return;
		pointerId = e.pointerId;
		handle.setPointerCapture(e.pointerId);
	});
	handle?.addEventListener("pointermove", (e) => {
		if (pointerId !== e.pointerId) return;
		moveDrag(e.clientX, e.clientY, e);
	});
	const finishPointer = (e: PointerEvent) => {
		if (pointerId !== e.pointerId) return;
		pointerId = null;
		endDrag();
	};
	handle?.addEventListener("pointerup", finishPointer);
	handle?.addEventListener("pointercancel", finishPointer);
	handle?.addEventListener("click", () => {
		if (dragMoved) {
			dragMoved = false;
			return;
		}
		if (isMobile()) setExpanded(!isExpanded);
	});
	handle?.addEventListener("keydown", (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			setExpanded(!isExpanded);
		}
	});

	// Esc is caught as a key first: Chrome only lets a dialog's `cancel` be
	// prevented after user activation, and otherwise closes it instantly.
	dialog.addEventListener("keydown", (e) => {
		if (e.key !== "Escape") return;
		e.preventDefault();
		close();
	});
	dialog.addEventListener("cancel", (e) => {
		e.preventDefault();
		close();
	});
	// However it closed, never leave the page shrunk or locked.
	dialog.addEventListener("close", () => {
		clearTimers();
		isClosing = false;
		isExpanded = false;
		dragging = false;
		dialog.classList.remove("is-open", "is-expanded", "is-dragging");
		panel?.style.removeProperty("--sheet-y");
		root.classList.remove("reel-open");
		cleanupPage();
		document.body.style.overflow = "";
		$$<HTMLVideoElement>("video", dialog).forEach((v) => v.pause());
	});

	const projects = $$("[data-reel-project]", list);
	const filters = $$<HTMLButtonElement>("[data-reel-filter]", dialog);
	filters.forEach((btn) =>
		btn.addEventListener("click", () => {
			const group = btn.dataset.reelFilter;
			filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
			$$("[data-reel-section]", list).forEach((sec) => {
				sec.hidden = group !== "all" && sec.dataset.reelSection !== group;
			});
			let n = 0;
			projects.forEach((p) => {
				p.hidden = group !== "all" && p.dataset.group !== group;
				if (p.hidden) return;
				p.style.setProperty("--n", String(n++));
				// Replay the entrance for the new set.
				p.style.transition = "none";
				p.style.opacity = "0";
				p.style.translate = "0 1.5rem";
				void p.offsetWidth;
				p.style.transition = "";
				p.style.opacity = "";
				p.style.translate = "";
			});
			list.scrollTop = 0;
		}),
	);

	// A one-time nudge towards the work, a while into the first visit.
	const toast = $("[data-toast]");
	if (toast && !localStorage.getItem("taf-toast")) {
		setTimeout(() => {
			if (!dialog.open) toast.hidden = false;
		}, 9000);
		$$("[data-toast-close]").forEach((b) =>
			b.addEventListener("click", () => {
				toast.hidden = true;
				localStorage.setItem("taf-toast", "1");
			}),
		);
	}
}

/* ------------------------------------------------- cursor + magnetic */

function cursor() {
	if (!finePointer || reduced) return;
	const dot = $("[data-cursor-dot]");
	const label = $("[data-cursor-label]");
	if (!dot || !label) return;

	let x = -100;
	let y = -100;
	let cx = x;
	let cy = y;
	const loop = () => {
		cx += (x - cx) * 0.22;
		cy += (y - cy) * 0.22;
		dot.style.setProperty("--cx", `${cx}px`);
		dot.style.setProperty("--cy", `${cy}px`);
		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

	addEventListener("pointermove", (e) => {
		x = e.clientX;
		y = e.clientY;
		const t = e.target as Element;
		const labelled = t.closest<HTMLElement>("[data-cursor]");
		const interactive = t.closest("a, button, input, textarea, label");
		const text = labelled?.dataset.cursor;
		dot.classList.toggle("is-label", !!text && text !== "home");
		dot.classList.toggle("is-hover", !text && !!interactive);
		label.textContent = text && text !== "home" ? text : "";
	});
	document.addEventListener("pointerleave", () => dot.classList.add("is-hidden"));
	document.addEventListener("pointerenter", () => dot.classList.remove("is-hidden"));

	$$("[data-magnetic]").forEach((el) => {
		el.addEventListener("pointermove", (e) => {
			const r = el.getBoundingClientRect();
			el.style.setProperty("--mx", `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
			el.style.setProperty("--my", `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
		});
		el.addEventListener("pointerleave", () => {
			el.style.setProperty("--mx", "0px");
			el.style.setProperty("--my", "0px");
		});
	});
}

/* --------------------------------------------------------------- boot */

/** Shared page chrome, galleries and the contact form, without homepage demos. */
export function bootPage() {
	splitHeadings();
	scrambles();
	header();
	clocks();
	proximity();
	contactForm();
	galleries();
	cursor();
	requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
}

export function boot() {
	splitHeadings();
	scrambles();
	header();
	clocks();
	heroField();
	slots();
	proximity();
	marquees();
	demos();
	tilt();
	workPreview();
	notesCarousel();
	contactForm();
	galleries();
	workIndex();
	reel();
	cursor();

	requestAnimationFrame(() => {
		document.documentElement.classList.add("is-ready");
		// The hero letters finish their CSS entrance, then hand over to the
		// proximity effect, which needs their transitions off.
		const h1 = $("[data-hero] h1");
		if (h1) setTimeout(() => h1.setAttribute("data-live", ""), 1600);
	});
}
