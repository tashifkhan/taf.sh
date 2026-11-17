// Frame-accurate motion engine for the product demo videos.
// Everything on screen is a pure function of time: window.__seek(t) lays out
// the frame for t seconds, so render.mjs can capture any frame in any order.
// No CSS animations or transitions run, which keeps parallel workers in sync.

const C = window.COMP;
const W = C.format === "portrait" ? 720 : 1280, H = C.format === "portrait" ? 1280 : 800, FPS = C.fps || 30, TR = 0.8;
const T = C.theme;

// ------------------------------------------------------------------ math
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const outCubic = (p) => 1 - Math.pow(1 - clamp(p), 3);
const inOut = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
// Damped spring from 0 to 1. f is the natural frequency in Hz, z the damping ratio.
function spring(t, f = 1.7, z = 0.42) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
// Pop in with squash and stretch: overshoot widens, undershoot narrows.
function pop(t, f = 1.9, z = 0.36) {
  const p = spring(t, f, z), d = p - 1;
  return { p, o: clamp(t * 6), sx: Math.max(0, p * (1 + 0.55 * d)), sy: Math.max(0, p * (1 - 0.55 * d)) };
}
// Drop in from above and squash on landing.
function drop(t, dist = 70, f = 1.6, z = 0.38) {
  const p = spring(t, f, z);
  // No squash. A non-uniform scale shears the crossbar of a t into a notch
  // once the word is rasterized, and it stays visible after the word lands.
  return { o: clamp(t * 5), y: -(1 - p) * dist, sx: 1, sy: 1 };
}
const px = (n) => `${n.toFixed(2)}px`;

// ------------------------------------------------------------------- dom
const $ = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const stage = document.getElementById("stage");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Audio cues collected while building, read by build-audio.py.
const cues = [];
const cue = (t, kind, gain = 1) => cues.push({ t: +t.toFixed(3), kind, gain });

// ---------------------------------------------------------------- pieces
const tafMark = `<svg class="tafmark" viewBox="0 0 28 20" width="28" height="20"><g fill="currentColor"><rect x="0" y="0" width="4" height="4"/><rect x="4" y="4" width="4" height="4"/><rect x="8" y="8" width="4" height="4"/><rect x="4" y="12" width="4" height="4"/><rect x="0" y="16" width="4" height="4"/></g><rect class="blink" x="16" y="12" width="10" height="8" fill="var(--accent)"/></svg>`;
const productMark = C.product.icon ? `<img class="product-icon" src="${C.product.icon}" alt="Paisa">` : tafMark;

function chrome(path) {
  const el = $("div", "win");
  el.innerHTML = `<div class="bar"><i></i><i></i><i></i><div class="url"><span class="lock">●</span>${esc(C.product.host)}<b>${esc(path || "")}</b></div></div><div class="view"><img class="shot" alt=""></div>`;
  return el;
}

function words(text, cls) {
  // Splits on spaces, keeps <em> runs styled. Returns element + list of word spans.
  const box = $("div", cls);
  const list = [];
  const parts = text.replace(/<br\s*\/?>/gi, " ").split(/(<em>.*?<\/em>)/);
  for (const part of parts) {
    if (!part) continue;
    const em = part.startsWith("<em>");
    const raw = em ? part.slice(4, -5) : part;
    for (const w of raw.split(/\s+/).filter(Boolean)) {
      const s = $("span", "w" + (em ? " em" : ""), esc(w));
      box.append(s, document.createTextNode(" "));
      list.push(s);
    }
  }
  return { box, list };
}

// Chapter index shown on every scene after the intro, taf.sh style.
function hud(n) {
  const el = $("div", "hud");
  el.innerHTML = `<span class="hl">${productMark}<span>${esc(C.product.name)}</span></span><span class="hr"><em>${esc(C.product.host)}</em></span>`;
  return el;
}

// ---------------------------------------------------------------- scenes
const S = {};

S.opening = (sc) => {
  const el = $("div", "scene opening" + (C.format === "portrait" ? " portrait" : ""));
  const halo = $("div", "opening-halo");
  const copy = $("div", "opening-copy");
  const icon = $("div", "opening-icon", productMark);
  const name = $("div", "opening-name", esc(C.product.name));
  const title = $("h1", "opening-title", esc(C.format === "portrait" ? sc.title.replace(". On", ".\nOn") : sc.title));
  const body = $("p", "opening-body", esc(sc.body));
  const url = $("div", "opening-url", esc(C.product.host));
  copy.append(icon, name, title, body, url);
  el.append(halo, copy);
  cue(sc.at + 0.3, "pop", 0.35);
  return {
    el,
    update(t) {
      const enter = outCubic(t / 0.8);
      halo.style.transform = `scale(${0.92 + enter * 0.08})`;
      halo.style.opacity = enter;
      [icon, name, title, body, url].forEach((item, i) => {
        const p = outCubic((t - i * 0.14) / 0.65);
        item.style.opacity = p;
        item.style.transform = `translateY(${px((1 - p) * 22)})`;
      });
    },
  };
};

S.intro = (sc) => {
  const el = $("div", "scene intro");
  const floor = $("div", "floor");
  const orbit = $("div", "orbit");
  const shots = (sc.shots || []).map((src, i) => {
    const c = $("div", "card3d");
    c.innerHTML = `<div class="bar"><i></i><i></i><i></i></div><img src="${src}">`;
    orbit.append(c);
    return c;
  });
  // "cubes" (default) is the old spinning decoration. "caret" is a blinking
  // terminal prompt, for products that already look like a shell. "none" is nothing.
  const decor = sc.decor || "cubes";
  const cubes = decor === "cubes" ? [0, 1, 2].map((i) => {
    const c = $("div", "cube c" + i);
    for (const f of ["f", "b", "l", "r", "t", "d"]) c.append($("i", f));
    el.append(c);
    return c;
  }) : [];
  const caret = decor === "caret" ? $("div", "caret", `<span>&gt;_</span><i></i>`) : null;
  if (caret) el.append(caret);
  // "landing" is one readable window instead of the fan. The fan stacks
  // every shot on the same point, which hides the page the video opens on.
  if (sc.landing) el.classList.add("landing");
  // "deal" is the opening story: the platforms, named, each with the SVG
  // card its own host serves. Cards land one at a time on the right.
  const deck = sc.deal || [];
  if (deck.length) el.classList.add("deal");
  const board = $("div", "board");
  const dealt = deck.map((d, i) => {
    const c = $("div", "dealt");
    c.style.borderColor = d.color || "var(--line)";
    c.innerHTML = `<div class="who"><i style="background:${d.color || "var(--accent)"}"></i><b>${esc(d.name)}</b><span>${esc(d.host || "")}</span></div><img src="${d.svg}" alt="">`;
    board.append(c);
    cue(sc.at + 0.55 + i * 0.12, "pop", 0.4);
    return c;
  });
  const copy = $("div", "copy");
  const pre = $("div", "pre", `${productMark}<span>${esc(sc.pre || "taf.sh presents")}</span>`);
  const kick = $("div", "kicker", esc(sc.kicker));
  const title = words(sc.title, "title");
  const tag = $("p", "tagline", esc(sc.tagline));
  const url = $("div", "chip", `<span>$</span> open ${esc(C.product.host)}`);
  copy.append(pre, kick, title.box, tag, url);
  el.append(floor, orbit, board, copy);
  title.list.forEach((_, i) => cue(sc.at + 0.55 + i * 0.07, "pop", 0.35));
  return {
    el,
    update(t) {
      floor.style.backgroundPosition = `0 ${px(t * 40)}`;
      // Flat fan. A Y-orbit resamples every screenshot and the page type goes soft.
      // A landing intro is one window, slid in from the right, so the page reads.
      orbit.style.transform = sc.landing ? "none" : `translate(-50%,-50%)`;
      dealt.forEach((c, i) => {
        const e = pop(t - 0.45 - i * 0.1, 1.6, 0.38);
        c.style.opacity = e.o;
        c.style.zIndex = String(20 + i);
        c.style.transform = `translateY(${px((1 - Math.min(e.p, 1.15)) * -46)}) scale(${e.sx.toFixed(3)},${e.sy.toFixed(3)})`;
      });
      shots.forEach((c, i) => {
        if (sc.landing) {
          const e = spring(t - 0.2, 0.9, 0.55);
          c.style.opacity = clamp(e * 1.4);
          c.style.zIndex = "1";
          c.style.transform = `translate(${px((1 - Math.min(e, 1)) * 80)},0) scale(${(0.985 + Math.min(e, 1) * 0.015).toFixed(3)})`;
          return;
        }
        const e = spring(t - 0.3 - i * 0.1, 1.2, 0.5);
        const spread = (i - (shots.length - 1) / 2) * 46;
        const lift = i * 28;
        c.style.opacity = clamp(e * 1.2);
        c.style.zIndex = String(i + 1);
        c.style.transform = `translate(${px(spread)},${px(lift - 70)}) scale(${(0.94 + e * 0.06).toFixed(3)})`;
      });
      cubes.forEach((c, i) => {
        const e = pop(t - 0.8 - i * 0.2, 1.4, 0.4);
        c.style.opacity = e.o;
        c.style.transform = `translate3d(0,${px(Math.sin(t * 1.1 + i * 2) * 12)},0) scale3d(${e.sx},${e.sy},1) rotateX(${(t * 38 + i * 40).toFixed(1)}deg) rotateY(${(t * 52 + i * 70).toFixed(1)}deg)`;
      });
      if (caret) {
        const e = pop(t - 0.7, 1.4, 0.4);
        caret.style.opacity = e.o;
        caret.style.transform = `scale(${e.sx},${e.sy})`;
        caret.querySelector("i").style.opacity = Math.floor(t * 2) % 2 === 0 ? 1 : 0.15;
      }
      const pr = outCubic((t - 0.1) / 0.6);
      pre.style.opacity = pr; pre.style.transform = `translateY(${px((1 - pr) * 14)})`;
      const k = pop(t - 0.3);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => {
        const d = drop(t - 0.55 - i * 0.07, 80);
        w.style.opacity = d.o;
        w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`;
      });
      const tp = outCubic((t - 1.3) / 0.7);
      tag.style.opacity = tp; tag.style.transform = `translateY(${px((1 - tp) * 22)})`;
      const u = pop(t - 1.8);
      url.style.opacity = u.o; url.style.transform = `scale(${u.sx},${u.sy})`;
    },
  };
};

S.chapter = (sc) => {
  const el = $("div", "scene chapter");
  el.append(hud(sc.n));
  const big = $("div", "bignum", String(sc.n).padStart(2, "0"));
  const copy = $("div", "copy");
  const kick = $("div", "kicker", `Feature ${String(sc.n).padStart(2, "0")} / ${String(C.featureCount).padStart(2, "0")}`);
  const title = words(sc.title, "title");
  const body = $("p", "body", esc(sc.body));
  const pts = $("ul", "points");
  const items = (sc.points || []).map((p) => { const li = $("li", null, `<b>[*]</b>${esc(p)}`); pts.append(li); return li; });
  copy.append(kick, title.box, body, pts);
  const tilt = $("div", "tilt");
  const win = chrome(sc.path);
  win.querySelector("img").src = sc.still;
  const glow = $("div", "glow");
  tilt.append(glow, win);
  el.append(big, tilt, copy);
  // Progress strip of every feature, current one lit.
  const prog = $("div", "prog");
  for (let i = 1; i <= C.featureCount; i++) prog.append($("i", i === sc.n ? "on" : i < sc.n ? "done" : ""));
  el.append(prog);
  title.list.forEach((_, i) => cue(sc.at + 0.45 + i * 0.06, "pop", 0.25));
  items.forEach((_, i) => cue(sc.at + 1.4 + i * 0.32, "tick", 0.6));
  return {
    el,
    update(t) {
      const b = outCubic((t - 0.1) / 0.9);
      big.style.opacity = b; big.style.transform = `translateX(${px((1 - b) * -60)})`;
      const k = pop(t - 0.25);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => {
        const d = drop(t - 0.45 - i * 0.06, 60);
        w.style.opacity = d.o;
        w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`;
      });
      const bp = outCubic((t - 0.95) / 0.6);
      body.style.opacity = bp; body.style.transform = `translateY(${px((1 - bp) * 16)})`;
      items.forEach((li, i) => {
        const e = pop(t - 1.4 - i * 0.32, 2.1, 0.4);
        li.style.opacity = e.o;
        li.style.transform = `translateX(${px((1 - e.p) * 40)}) scale(${e.sx},${e.sy})`;
      });
      const e = spring(t - 0.2, 0.9, 0.55);
      tilt.style.opacity = clamp(e * 1.4);
      // No rotate. A 3D tilt resamples the screenshot and the page type washes out.
      tilt.style.transform = `translate(${px((1 - e) * 80)},0) scale(${(0.98 + Math.min(e, 1) * 0.02).toFixed(3)})`;
    },
  };
};

S.demo = (sc) => {
  const el = $("div", "scene demo " + (sc.layout === "phone" ? "native-phone" : sc.layout || "desktop"));
  el.append(hud(sc.n));
  const win = chrome(sc.path);
  const img = win.querySelector("img.shot");
  const view = win.querySelector(".view");
  const spot = $("div", "spot");
  view.append(spot);
  const rings = (sc.highlights || []).map((h) => {
    const r = $("div", "ring");
    const lab = $("div", "label " + (h.side || "below"), esc(h.label));
    el.append(lab);
    lab.className = "highlight-note";
    view.append(r);
    cue(sc.at + h.at, "tick", 0.9);
    cue(sc.at + h.at + 0.12, "pop", 0.5);
    return { h, r, lab };
  });
  const cursor = $("div", "cursor", `<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2l7 19 2.6-7.4L20 11z" fill="#fff" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg><i></i>`);
  view.append(cursor);
  const cap = $("div", "caption", `<b>${String(sc.n).padStart(2, "0")}</b><span>${esc(sc.caption)}</span>`);
  el.append(win, cap);
  cue(sc.at + 0.5, "pop", 0.4);
  if (sc.layout === "portrait") {
    const header = $("div", "portrait-header");
    header.innerHTML = `<small>${productMark}</small><h2>${esc(sc.title || "")}</h2><p>${esc(sc.body || "")}</p>`;
    el.append(header);
  }

  if (sc.layout && sc.layout !== "desktop" && sc.layout !== "portrait") {
    const copy = $("div", "device-copy");
    copy.innerHTML = `<div class="kicker">${esc(sc.kicker || "Native Android")}</div><h2>${sc.title || ""}</h2><p>${esc(sc.body || "")}</p><ul>${(sc.points || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul>`;
    el.append(copy);
  }
  // Cursor path: rest at lower right, glide to each highlight shortly before it lights up.
  const stops = [{ t: 0, x: 0.78, y: 0.82 }];
  for (const { h } of rings) stops.push({ t: h.at - 0.7, x: stops.at(-1).x, y: stops.at(-1).y }, { t: h.at - 0.05, x: h.box[0] + h.box[2] / 2, y: h.box[1] + h.box[3] / 2 });
  return {
    el,
    frames: sc.frames,
    update(t) {
      const VW = view.clientWidth, VH = view.clientHeight;
      const i = Math.min(sc.frames.count - 1, Math.max(0, Math.floor(t * FPS)));
      const src = `${sc.frames.dir}/${String(i + 1).padStart(5, "0")}.${sc.frames.ext || "jpg"}`;
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      let dim = 0;
      for (const { h, r, lab } of rings) {
        const lt = t - h.at, len = h.dur || 2.4;
        const on = lt >= 0 && lt < len + 0.5;
        r.style.display = on ? "block" : "none";
        lab.style.display = on ? "block" : "none";
        if (!on) continue;
        const e = pop(lt, 2.2, 0.38);
        const out = clamp((lt - len) / 0.35);
        const [x, y, w, hh] = h.box;
        // `track` is how fast the target moves, in viewport heights per second,
        // measured from `trackFrom` (default: the moment the ring appears). A
        // page scrolling upward is negative, so the ring rides the content
        // instead of staying glued to the screen.
        const dy = (h.track || 0) * (t - (h.trackFrom ?? h.at));
        r.style.left = px(Math.max(4,x * VW)); r.style.top = px(Math.max(4,(y + dy) * VH)); r.style.width = px(Math.min(w * VW,VW-x*VW-4)); r.style.height = px(Math.min(hh * VH,VH-(y+dy)*VH-4));
        r.style.opacity = e.o * (1 - out);
        r.style.transform = "none";
        const l = pop(lt - 0.15, 2, 0.35);
        lab.style.transform = "none";
        lab.style.opacity = l.o;
        dim = Math.max(dim, clamp(lt / 0.3) * (1 - out));
        if (dim > 0) { spot.style.left = r.style.left; spot.style.top = r.style.top; spot.style.width = r.style.width; spot.style.height = r.style.height; }
      }
      spot.style.opacity = 0;
      // cursor
      let a = stops[0], b = stops[0];
      for (let k = 0; k < stops.length; k++) { if (stops[k].t <= t) a = stops[k]; if (stops[k].t > t) { b = stops[k]; break; } b = stops[k]; }
      const p = b.t > a.t ? inOut((t - a.t) / (b.t - a.t)) : 1;
      const cx = lerp(a.x, b.x, p) * VW, cy = lerp(a.y, b.y, p) * VH;
      let click = 0;
      for (const { h } of rings) { const d = t - h.at; if (d >= 0 && d < 0.6) click = d / 0.6; }
      cursor.style.opacity = rings.length && C.cursor !== false ? clamp((t - 0.3) / 0.4) : 0;
      cursor.style.transform = `translate(${px(cx)},${px(cy)}) scale(${click > 0 && click < 0.25 ? 0.82 : 1})`;
      const ring = cursor.querySelector("i");
      ring.style.opacity = click > 0 ? 1 - click : 0;
      ring.style.transform = `translate(-50%,-50%) scale(${0.3 + click * 1.6})`;
      const c = pop(t - 0.5, 1.8, 0.4);
      cap.style.opacity = c.o;
      cap.style.transform = `translateY(${px((1 - c.p) * 30)}) scale(${c.sx},${c.sy})`;
    },
  };
};

S.arch = (sc) => {
  const el = $("div", "scene arch");
  el.append(hud(0));
  const head = $("div", "copy");
  const kick = $("div", "kicker", esc(sc.kicker || "Under the hood"));
  const title = words(sc.title, "title");
  head.append(kick, title.box);
  const cam = $("div", "cam");
  const plane = $("div", "plane" + (sc.rows > 4 ? " tall" : ""));
  const PW = 1120, PH = sc.rows > 4 ? 560 : 470;
  const cols = sc.cols || 5, rows = sc.rows || 3;
  // A full service list needs shorter cards, but each card still has to hold
  // its kind, name and subtitle. 46px clipped the subtitle.
  const NW = rows > 4 ? 168 : 176, NH = rows > 4 ? 58 : 74;
  const pos = (n) => ({ x: 30 + (n.x / (cols - 1)) * (PW - 60 - NW), y: 20 + (n.y / (rows - 1)) * (PH - 40 - NH) });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", PW); svg.setAttribute("height", PH); svg.setAttribute("class", "wires");
  plane.append(svg);
  const nodes = {};
  sc.nodes.forEach((n, i) => {
    const p = pos(n);
    const box = $("div", "node" + (n.hot ? " hot" : "") + (rows > 4 ? " dense" : ""));
    box.innerHTML = `<small>${esc(n.kind || "")}</small><b>${esc(n.label)}</b><span>${esc(n.sub || "")}</span>`;
    box.style.left = px(p.x); box.style.top = px(p.y);
    const shadow = $("div", "nshadow");
    shadow.style.left = px(p.x); shadow.style.top = px(p.y);
    plane.append(shadow, box);
    nodes[n.id] = { n, p, box, shadow, at: 0.9 + i * 0.16 };
    cue(sc.at + nodes[n.id].at, "pop", 0.45);
  });
  const edges = sc.edges.map((e, i) => {
    const A = nodes[e.from], B = nodes[e.to];
    const ax = A.p.x + NW / 2, ay = A.p.y + NH / 2, bx = B.p.x + NW / 2, by = B.p.y + NH / 2;
    // Leave from the facing side of each node.
    // A column of services feeding one node to the side is still a sideways
    // connection. Comparing the two distances calls it vertical and the wire
    // then leaves through the top or bottom and misses the card.
    const horiz = Math.abs(B.n.x - A.n.x) >= Math.abs(B.n.y - A.n.y);
    const sx = horiz ? ax + Math.sign(bx - ax) * NW / 2 : ax, sy = horiz ? ay : ay + Math.sign(by - ay) * NH / 2;
    const tx = horiz ? bx - Math.sign(bx - ax) * NW / 2 : bx, ty = horiz ? by : by - Math.sign(by - ay) * NH / 2;
    const mx = (sx + tx) / 2, my = (sy + ty) / 2;
    const d = horiz ? `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}` : `M${sx},${sy} C${sx},${my} ${tx},${my} ${tx},${ty}`;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.append(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    const dots = [0, 1].map(() => { const c = document.createElementNS("http://www.w3.org/2000/svg", "circle"); c.setAttribute("r", 4.5); svg.append(c); return c; });
    const lab = $("div", "elabel", esc(e.label || ""));
    const mid = path.getPointAtLength(len / 2);
    lab.style.left = px(mid.x); lab.style.top = px(mid.y);
    if (e.label && len > 110) plane.append(lab);
    const at = Math.max(A.at, B.at) + 0.35 + i * 0.05;
    return { path, len, dots, lab, at, speed: 0.55 + (i % 3) * 0.12 };
  });
  cam.append(plane);
  el.append(head, cam);
  return {
    el,
    update(t) {
      const k = pop(t - 0.25);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => { const d = drop(t - 0.4 - i * 0.06, 60); w.style.opacity = d.o; w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`; });
      // Camera swings from an isometric view to a readable three-quarter view.
      const c = inOut((t - 0.3) / 3.2);
      plane.style.transform = `translate(-50%,-50%) rotateX(${lerp(56, 22, c).toFixed(2)}deg) rotateZ(${lerp(-30, -4, c).toFixed(2)}deg) rotateY(${(Math.sin(t * 0.5) * 2).toFixed(2)}deg)`;
      for (const id in nodes) {
        const { box, shadow, at } = nodes[id];
        const e = pop(t - at, 1.9, 0.38);
        const lift = 26 * clamp(e.p, 0, 1.3);
        box.style.opacity = e.o;
        box.style.transform = `translateZ(${px(lift)}) scale(${e.sx},${e.sy})`;
        shadow.style.opacity = e.o * 0.55;
        shadow.style.transform = `scale(${0.9 + 0.1 * clamp(e.p)})`;
      }
      for (const e of edges) {
        const p = outCubic((t - e.at) / 0.7);
        e.path.style.strokeDashoffset = (1 - p) * e.len;
        e.path.style.opacity = p > 0 ? 1 : 0;
        e.lab.style.opacity = clamp((t - e.at - 0.4) / 0.4);
        e.dots.forEach((d, j) => {
          const f = ((t - e.at) * e.speed + j * 0.5) % 1;
          if (p < 1) { d.style.opacity = 0; return; }
          const q = e.path.getPointAtLength(f * e.len);
          d.setAttribute("cx", q.x); d.setAttribute("cy", q.y);
          d.style.opacity = Math.sin(f * Math.PI);
        });
      }
    },
  };
};

// A generated result typed out, for features whose output the recording doesn't show.
S.gen = (sc) => {
  const el = $("div", "scene gen");
  el.append(hud(sc.n));
  const app = $("div", "app");
  const left = $("div", "pane in");
  left.append($("div", "ph", esc(sc.inputTitle || "Details")));
  const fields = sc.fields.map((f) => {
    const row = $("div", "field", `<label>${esc(f[0])}</label><div class="val"><span></span><i class="caret"></i></div>`);
    left.append(row);
    return { row, val: row.querySelector("span"), caret: row.querySelector(".caret"), text: f[1] };
  });
  const btn = $("div", "btn", esc(sc.button || "Generate"));
  left.append(btn);
  const right = $("div", "pane out");
  right.append($("div", "ph", esc(sc.outputTitle || "Result")));
  const sk = $("div", "skel", "<i></i><i></i><i></i><i></i>");
  const out = $("div", "outtext");
  right.append(sk, out);
  app.append(left, right);
  const cap = $("div", "caption", `<b>${String(sc.n).padStart(2, "0")}</b><span>${esc(sc.caption)}</span>`);
  el.append(app, cap);
  // Timeline inside the scene.
  let at = 0.6;
  const plan = fields.map((f) => { const s = at; at += 0.25 + f.text.length * 0.022; return s; });
  const click = at + 0.3, ready = click + 1.1;
  const full = sc.output;
  const typeRate = Math.max(70, full.length / Math.max(1, sc.dur - ready - 1.2));
  cue(sc.at + click, "tick", 1); cue(sc.at + ready, "pop", 0.6);
  return {
    el,
    update(t) {
      const a = spring(t - 0.15, 1.3, 0.55);
      app.style.opacity = clamp(a * 1.5);
      app.style.transform = `translateY(${px((1 - a) * 60)}) rotateX(${((1 - a) * 14).toFixed(2)}deg)`;
      fields.forEach((f, i) => {
        const n = Math.floor(clamp((t - plan[i]) / (f.text.length * 0.022), 0, 1) * f.text.length);
        f.val.textContent = f.text.slice(0, n);
        const active = t >= plan[i] && (i === fields.length - 1 ? t < click : t < plan[i + 1]);
        f.caret.style.opacity = active && Math.floor(t * 2.5) % 2 === 0 ? 1 : 0;
        f.row.classList.toggle("focus", active);
      });
      const bp = t >= click ? pop(t - click, 2.4, 0.3) : { sx: 1, sy: 1 };
      btn.style.transform = t >= click && t < click + 0.12 ? "scale(.92,.86)" : `scale(${bp.sx},${bp.sy})`;
      btn.classList.toggle("busy", t >= click && t < ready);
      sk.style.opacity = t >= click && t < ready ? 1 : 0;
      sk.style.backgroundPosition = `${px(-400 + ((t * 600) % 800))} 0`;
      const n = t >= ready ? Math.floor((t - ready) * typeRate) : 0;
      out.innerHTML = esc(full.slice(0, n)).replace(/\n/g, "<br>") + (t >= ready && n < full.length ? '<i class="caret on"></i>' : "");
      const c = pop(t - 0.5, 1.8, 0.4);
      cap.style.opacity = c.o; cap.style.transform = `translateY(${px((1 - c.p) * 30)}) scale(${c.sx},${c.sy})`;
    },
  };
};

// Big numbers that count up, for framing the problem.
S.stats = (sc) => {
  const el = $("div", "scene stats");
  el.append(hud(0));
  const head = $("div", "copy");
  const kick = $("div", "kicker", esc(sc.kicker));
  const title = words(sc.title, "title");
  head.append(kick, title.box);
  const row = $("div", "statrow");
  const cards = sc.items.map((it, i) => {
    const c = $("div", "stat", `<b></b><span>${esc(it.label)}</span>`);
    row.append(c);
    cue(sc.at + 1.2 + i * 0.45, "pop", 0.7);
    return { c, num: c.querySelector("b"), it };
  });
  const foot = $("p", "statfoot", sc.foot || "");
  // One line, or a list. A list is how a scene names every host instead of one.
  const hosts = sc.links || (sc.link ? [sc.link] : []);
  const link = $("div", "statlink" + (hosts.length > 1 ? " many" : ""));
  hosts.forEach((h) => link.append($("span", null, esc(h))));
  el.append(head, row, foot, link);
  title.list.forEach((_, i) => cue(sc.at + 0.45 + i * 0.06, "pop", 0.25));
  return {
    el,
    update(t) {
      const k = pop(t - 0.25);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => { const d = drop(t - 0.45 - i * 0.06, 60); w.style.opacity = d.o; w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`; });
      cards.forEach(({ c, num, it }, i) => {
        const at = 1.2 + i * 0.45;
        const e = pop(t - at, 1.7, 0.36);
        c.style.opacity = e.o;
        c.style.transform = `translateY(${px((1 - e.p) * 50)}) scale(${e.sx},${e.sy})`;
        const p = outCubic((t - at) / 1.1);
        num.textContent = it.text || `${it.prefix || ""}${Math.round((it.n || 0) * p).toLocaleString("en-US")}${it.suffix || ""}`;
      });
      const f = outCubic((t - 2.6) / 0.7);
      foot.style.opacity = f; foot.style.transform = `translateY(${px((1 - f) * 16)})`;
      const lk = outCubic((t - 3.3) / 0.6);
      link.style.opacity = lk; link.style.transform = `translateY(${px((1 - lk) * 12)})`;
    },
  };
};

// A design-direction scene: a section-by-section CPS posture map.
S.posture = (sc) => {
  const el = $("div", "scene posture");
  el.append(hud(0));
  const copy = $("div", "copy");
  const kick = $("div", "kicker", esc(sc.kicker));
  const title = words(sc.title, "title");
  const body = $("p", "body", esc(sc.body));
  const pts = $("ul", "points");
  const items = (sc.points || []).map((p) => { const li = $("li", null, `<b>[*]</b>${esc(p)}`); pts.append(li); return li; });
  copy.append(kick, title.box, body, pts);
  const map = $("div", "pmap");
  const tag = $("div", "ptag", esc(sc.tag || "Design direction"));
  map.append(tag);
  const cells = [];
  sc.rows.forEach((r, ri) => {
    const row = $("div", "prow");
    row.append($("label", null, `<b>${ri + 1}</b>${esc(r.name)}`));
    const strip = $("div", "pcells");
    [...r.cells].forEach((ch, ci) => {
      const cell = $("i", ch === "r" ? "red" : ch === "a" ? "amber" : "green");
      strip.append(cell);
      cells.push({ cell, at: 0.9 + ri * 0.12 + ci * 0.03, focus: r.focus === ci });
    });
    row.append(strip);
    map.append(row);
  });
  const detail = $("div", "pdetail", `<div class="pdh"><span class="amber"></span>${esc(sc.detail.title)}</div>${sc.detail.clauses.map((c) => `<div class="pclause"><span class="red"></span><div><b>${esc(c[0])}</b><small>${esc(c[1])}</small></div></div>`).join("")}`);
  map.append(detail);
  el.append(copy, map);
  const focusAt = 4.2;
  title.list.forEach((_, i) => cue(sc.at + 0.45 + i * 0.06, "pop", 0.25));
  items.forEach((_, i) => cue(sc.at + 1.6 + i * 0.3, "tick", 0.5));
  cue(sc.at + focusAt, "pop", 0.9);
  return {
    el,
    update(t) {
      const k = pop(t - 0.25);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => { const d = drop(t - 0.45 - i * 0.06, 60); w.style.opacity = d.o; w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`; });
      const bp = outCubic((t - 1.0) / 0.6);
      body.style.opacity = bp; body.style.transform = `translateY(${px((1 - bp) * 16)})`;
      items.forEach((li, i) => { const e = pop(t - 1.6 - i * 0.3, 2.1, 0.4); li.style.opacity = e.o; li.style.transform = `translateX(${px((1 - e.p) * 40)}) scale(${e.sx},${e.sy})`; });
      const m = spring(t - 0.2, 1, 0.55);
      map.style.opacity = clamp(m * 1.5);
      map.style.transform = `translateX(${px((1 - m) * 200)}) rotateY(${(lerp(-40, -10, m) + Math.sin(t * 0.7) * 2).toFixed(2)}deg) rotateX(${lerp(14, 5, m).toFixed(2)}deg)`;
      const tg = pop(t - 0.7);
      tag.style.opacity = tg.o; tag.style.transform = `scale(${tg.sx},${tg.sy})`;
      for (const c of cells) {
        const e = pop(t - c.at, 2.4, 0.4);
        c.cell.style.opacity = e.o;
        const f = c.focus && t > focusAt ? pop(t - focusAt, 2, 0.35) : null;
        c.cell.style.transform = f ? `scale(${1 + 0.5 * f.sx},${1 + 0.5 * f.sy})` : `scale(${e.sx},${e.sy})`;
        c.cell.classList.toggle("focus", !!f);
      }
      const d = pop(t - focusAt - 0.25, 1.8, 0.4);
      detail.style.opacity = d.o;
      detail.style.transform = `translateY(${px((1 - d.p) * 30)}) scale(${d.sx},${d.sy})`;
    },
  };
};

// The patient's side: a phone in 3D with a WhatsApp thread popping in.
S.chat = (sc) => {
  const el = $("div", "scene chat");
  el.append(hud(sc.n));
  const copy = $("div", "copy");
  const kick = $("div", "kicker", esc(sc.kicker));
  const title = words(sc.title, "title");
  const body = $("p", "body", esc(sc.body));
  copy.append(kick, title.box, body);
  const rig = $("div", "rig");
  const phone = $("div", "phone");
  phone.innerHTML = `<div class="notch"></div><div class="ph-head"><span class="av">${sc.avatar || "R"}</span><span><b>${esc(sc.contact)}</b><small>online</small></span></div>`;
  const thread = $("div", "thread");
  phone.append(thread);
  const shadow = $("div", "pshadow");
  rig.append(shadow, phone);
  el.append(copy, rig);
  const msgs = sc.messages.map((m) => {
    const b = $("div", "msg " + m.from, `${esc(m.text).replace(/\n/g, "<br>")}${m.buttons ? `<div class="btns">${m.buttons.map((x) => `<span>${esc(x)}</span>`).join("")}</div>` : ""}<small>${esc(m.time || "")}</small>`);
    const dots = $("div", "msg bot typing", "<i></i><i></i><i></i>");
    thread.append(dots, b);
    cue(sc.at + m.at, "pop", m.from === "me" ? 0.5 : 0.7);
    return { m, b, dots };
  });
  title.list.forEach((_, i) => cue(sc.at + 0.45 + i * 0.06, "pop", 0.25));
  return {
    el,
    update(t) {
      const k = pop(t - 0.25);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => { const d = drop(t - 0.45 - i * 0.06, 60); w.style.opacity = d.o; w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`; });
      const bp = outCubic((t - 0.95) / 0.6);
      body.style.opacity = bp; body.style.transform = `translateY(${px((1 - bp) * 16)})`;
      const e = spring(t - 0.15, 1, 0.5);
      rig.style.opacity = clamp(e * 1.5);
      rig.style.transform = `translate(${px((1 - e) * 300)},${px(Math.sin(t * 1.3) * 7)}) rotateY(${(lerp(-60, -16, e) + Math.sin(t * 0.8) * 3).toFixed(2)}deg) rotateX(${lerp(20, 5, e).toFixed(2)}deg) rotateZ(${lerp(-8, -2, e).toFixed(2)}deg)`;
      let h = 0;
      for (const { m, b, dots } of msgs) {
        const typing = m.from === "bot" && t >= m.at - 0.9 && t < m.at;
        dots.style.display = typing ? "inline-flex" : "none";
        if (typing) [...dots.children].forEach((d, i) => (d.style.transform = `translateY(${px(Math.sin(t * 10 - i * 0.9) * -3)})`));
        const on = t >= m.at;
        b.style.display = on ? "block" : "none";
        if (!on) continue;
        const p = pop(t - m.at, 2.1, 0.4);
        b.style.opacity = p.o;
        b.style.transform = `scale(${p.sx},${p.sy})`;
        b.querySelectorAll(".btns span").forEach((s, i) => { const q = pop(t - m.at - 0.35 - i * 0.12, 2.3, 0.4); s.style.transform = `scale(${q.sx},${q.sy})`; s.style.opacity = q.o; });
      }
      // Keep the newest message in view, matching the app.
      const over = thread.scrollHeight - thread.clientHeight;
      thread.scrollTop = over > 0 ? over : 0;
    },
  };
};

S.outro = (sc) => {
  const el = $("div", "scene outro" + (sc.trace ? " trace" : ""));
  const copy = $("div", "copy");
  const kick = $("div", "kicker", esc(sc.kicker));
  const title = words(sc.title, "title");
  // A trace close types the platforms into a terminal. No screenshot.
  // Other videos keep the URL chip under the title.
  const line = sc.trace ? null : $("div", "chip big", `${productMark}<span>${esc(sc.url)}</span>`);
  copy.append(kick, title.box);
  if (line) copy.append(line);
  const names = (sc.trace || []).map((t) => (typeof t === "string" ? { name: t, status: "wired" } : t));
  const term = names.length ? $("div", "term") : null;
  const rows = names.map((t) => {
    const row = $("div", "row");
    const left = $("b");
    const right = $("em");
    row.append(left, right);
    term.append(row);
    return { ...t, left, right, row };
  });
  const prompt = term ? $("div", "prompt", `<span>$</span> open ${esc(sc.url)}<i></i>`) : null;
  if (term) term.append(prompt);
  const tilt = sc.still && !term ? $("div", "tilt") : null;
  if (tilt) {
    const win = chrome(sc.path || "");
    win.querySelector("img").src = sc.still;
    tilt.append(win);
  }
  const stack = $("div", "stackrow");
  const chips = (sc.stack || []).map((s) => { const c = $("span", null, esc(s)); stack.append(c); return c; });
  const sign = $("div", "sign", `${tafMark}<span>${sc.sign || "<b>built by taf.sh</b> · me@taf.sh"}</span>`);
  el.append(copy, stack, sign);
  if (term) el.append(term);
  if (tilt) el.append(tilt);
  title.list.forEach((_, i) => cue(sc.at + 0.4 + i * 0.07, "pop", 0.3));
  rows.forEach((_, i) => cue(sc.at + 1.05 + i * 0.32, "tick", 0.35));
  if (prompt) cue(sc.at + 1.05 + rows.length * 0.32, "pop", 0.5);
  chips.forEach((_, i) => cue(sc.at + (term ? 3.7 : 1.6) + i * 0.09, "tick", 0.3));
  return {
    el,
    update(t) {
      const k = pop(t - 0.2);
      kick.style.opacity = k.o; kick.style.transform = `scale(${k.sx},${k.sy})`;
      title.list.forEach((w, i) => { const d = drop(t - 0.35 - i * 0.06, 60); w.style.opacity = d.o; w.style.transform = `translateY(${px(d.y)}) scale(${d.sx},${d.sy})`; });
      if (line) {
        const l = pop(t - 1.1);
        line.style.opacity = l.o; line.style.transform = `scale(${l.sx},${l.sy})`;
      }
      if (tilt) {
        const e = spring(t - 0.3, 0.9, 0.55);
        tilt.style.opacity = clamp(e * 1.4);
        tilt.style.transform = `translate(${px((1 - e) * 60)},0)`;
      }
      if (term) {
        const e = spring(t - 0.45, 1, 0.55);
        term.style.opacity = clamp(e * 1.4);
        term.style.transform = `translateY(${px((1 - e) * 28)})`;
        rows.forEach(({ name, status, left, right, row }, i) => {
          const at = 0.95 + i * 0.32;
          const typed = Math.round(clamp((t - at) / 0.28) * name.length);
          const done = typed >= name.length;
          left.textContent = name.slice(0, typed) + (done ? "" : "▍");
          right.textContent = done && t > at + 0.34 ? status : "";
          row.style.opacity = t >= at ? 1 : 0.28;
        });
        const pat = 0.95 + rows.length * 0.32;
        const on = t >= pat;
        prompt.style.opacity = on ? 1 : 0;
        const caret = prompt.querySelector("i");
        caret.style.opacity = on && Math.floor(t * 2) % 2 === 0 ? 1 : 0;
      }
      const chipAt = term ? 3.55 : 1.5;
      chips.forEach((c, i) => { const p = pop(t - chipAt - i * 0.08, 2.2, 0.4); c.style.opacity = p.o; c.style.transform = `translateY(${px((1 - p.p) * 16)}) scale(${p.sx},${p.sy})`; });
      const s = outCubic((t - (term ? 4.15 : 2.0)) / 0.6);
      sign.style.opacity = s; sign.style.transform = `translateY(${px((1 - s) * 16)})`;
    },
  };
};

// -------------------------------------------------------------- timeline
let at = 0;
const built = C.scenes.map((sc, i) => {
  if (sc.type === "demo") sc.dur = sc.frames.count / FPS + (sc.hold ?? 0.3);
  sc.at = at;
  const s = S[sc.type](sc);
  const wrap = $("div", "wrap");
  wrap.append(s.el);
  stage.append(wrap);
  const item = { sc, s, wrap, start: at, end: at + sc.dur };
  if (i > 0) cue(at - 0.15, "whoosh", 1);
  at += sc.dur - TR;
  return item;
});
const TOTAL = built.at(-1).end;
cue(0, "riser", 1);

function placeWrap(it, t) {
  const lt = t - it.start;
  const next = built[built.indexOf(it) + 1];
  const visible = t >= it.start && t < it.end;
  it.wrap.style.display = visible ? "block" : "none";
  if (!visible) return;
  let tf = "", filt = "", rad = 0;
  if (it.start > 0 && lt < TR + 0.6) {
    // Slide over from the right, the way taf.sh pages arrive, with a squish as it lands.
    const p = spring(lt, 1.15, 0.62);
    const sq = Math.sin(Math.PI * clamp(lt / (TR + 0.2))) * 0.05;
    tf = `translateX(${px((1 - p) * W)}) rotateY(${((1 - p) * -18).toFixed(2)}deg) scale(${1 - sq},${1 + sq * 0.6})`;
    rad = 28 * clamp(1 - p);
  }
  if (next && t >= next.start) {
    // Pull back while the next scene covers it.
    const q = outCubic((t - next.start) / TR);
    tf = `translateX(${px(-q * W * 0.12)}) scale(${1 - 0.14 * q}) rotateY(${(q * 10).toFixed(2)}deg)`;
    filt = `brightness(${(1 - 0.55 * q).toFixed(3)})`;
    rad = 28 * q;
  }
  it.wrap.style.transform = tf;
  it.wrap.style.filter = filt;
  it.wrap.style.borderRadius = px(rad);
  it.wrap.style.zIndex = String(built.indexOf(it));
  it.s.update(lt);
}

const fadeEl = document.getElementById("fade");
window.__seek = async (t) => {
  for (const it of built) placeWrap(it, t);
  fadeEl.style.opacity = Math.max(1 - clamp(t / 0.6), clamp((t - (TOTAL - 0.9)) / 0.9));
  const imgs = [...stage.querySelectorAll("img")].filter((i) => i.offsetParent && i.getAttribute("src"));
  await Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? null : i.decode().catch(() => null))));
};
window.__meta = () => ({ total: TOTAL, fps: FPS, cues: cues.sort((a, b) => a.t - b.t), scenes: built.map((b) => ({ type: b.sc.type, start: b.start, end: b.end, audio: b.sc.audio || null })) });
