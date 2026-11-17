// Native phone footage for the product-video engine. No CSS animation clocks.
// The upstream diagram engine divides by rows - 1. Center a single row.
for (const scene of C.scenes) {
  if (scene.type === 'arch' && scene.rows === 1) {
    scene.rows = 3;
    scene.nodes.forEach((node) => { node.y = 1; });
  }
}
S.opening = (sc) => {
  const el = $("div", "scene opening");
  const halo = $("div", "opening-halo");
  const copy = $("div", "opening-copy");
  const icon = $("div", "opening-icon", C.product.icon ? `<img class="product-icon" src="${C.product.icon}" alt="">` : "");
  const name = $("div", "opening-name", esc(C.product.name));
  const title = $("h1", "opening-title", esc(sc.title));
  const body = $("p", "opening-body", esc(sc.body));
  const url = $("div", "opening-url", esc(C.product.host));
  copy.append(icon, name, title, body, url);
  el.append(halo, copy);
  cue(sc.at + 0.3, "pop", 0.35);
  return { el, update(t) {
    const enter = outCubic(t / 0.8);
    halo.style.transform = `scale(${0.92 + enter * 0.08})`;
    halo.style.opacity = enter;
    [icon, name, title, body, url].forEach((item, i) => {
      const p = outCubic((t - i * 0.14) / 0.65);
      item.style.opacity = p;
      item.style.transform = `translateY(${px((1 - p) * 22)})`;
    });
  }};
};

S.close = (sc) => {
  const el = $("div", "scene close-scene");
  const wash = $("div", "close-wash");
  const seam = $("div", "close-seam");
  const copy = $("div", "close-copy");
  const icon = $("div", "close-icon", C.product.icon ? `<img src="${C.product.icon}" alt="">` : "");
  const name = $("div", "close-name", esc(C.product.name));
  const title = words(sc.title, "close-title");
  const body = $("p", "close-body", esc(sc.body || ""));
  const url = $("div", "close-url", esc(sc.url));
  const list = $("div", "close-facts");
  const facts = (sc.facts || []).map((f) => {
    const row = $("div", "close-fact", `<span>${esc(f.k)}</span><b>${esc(f.v)}</b>`);
    list.append(row);
    return row;
  });
  copy.append(icon, name, title.box, body, list, url);
  const by = $("div", "close-by", `<svg viewBox="0 0 42 30" fill="none"><path d="M0 0H6V6H0V0Z M6 6H12V12H6V6Z M12 12H18V18H12V12Z M6 18H12V24H6V18Z M0 24H6V30H0V24Z" fill="currentColor"/><rect x="24" width="18" height="30" fill="var(--accent)"/></svg><b>${esc(sc.by || "")}</b>`);
  const phones = (sc.phones || []).map((p, i) => {
    const group = $("div", "close-device device-" + i);
    const android = i === 1;
    const frame = $("div", "native-bezel" + (android ? " android-bezel" : ""));
    const shot = $("img", "native-screen");
    shot.src = p.still;
    frame.append(shot, $("div", "native-reflection"));
    group.append(frame);
    return group;
  });
  el.append(wash, seam, copy, ...phones, by);
  title.list.forEach((_, i) => cue(sc.at + 0.35 + i * 0.06, "pop", 0.22));
  facts.forEach((_, i) => cue(sc.at + 1.0 + i * 0.12, "tick", 0.25));
  return { el, update(t) {
    wash.style.opacity = outCubic(t / 0.8);
    const stitch = outCubic((t - 0.2) / 0.9);
    seam.style.transform = `scaleX(${stitch})`;
    seam.style.opacity = stitch;
    [icon, name].forEach((item, i) => {
      const p = outCubic((t - i * 0.08) / 0.5);
      item.style.opacity = p;
      item.style.transform = `translateY(${px((1 - p) * 16)})`;
    });
    title.list.forEach((w, i) => {
      const d = drop(t - 0.25 - i * 0.06, 36, 1.5, 0.6);
      w.style.opacity = d.o;
      w.style.transform = `translateY(${px(d.y)})`;
    });
    const b = outCubic((t - 0.7) / 0.5);
    body.style.opacity = b;
    const u = pop(t - 1.5, 1.8, 0.45);
    url.style.opacity = u.o;
    url.style.transform = `scale(${u.sx},${u.sy})`;
    by.style.opacity = outCubic((t - 1.8) / 0.6);
    phones.forEach((group, i) => {
      const e = spring(t - 0.25 - i * 0.12, 0.85, 0.62);
      group.style.opacity = clamp(e * 1.3);
      group.style.transform = `translateY(${px((1 - e) * 48)})`;
    });
    facts.forEach((row, i) => {
      const p = outCubic((t - 0.95 - i * 0.12) / 0.5);
      row.style.opacity = p;
      row.style.transform = `translateX(${px((1 - p) * 14)})`;
    });
  }};
};

S.phone = (sc) => {
  if (sc.frames) sc.dur = sc.frames.count / FPS + (sc.hold ?? 0.5);
  const el = $("div", "scene native-phone" + (sc.dual ? " dual" : ""));
  el.append(hud(sc.n));
  const copy = $("div", "native-copy");
  const kick = $("div", "kicker", esc(sc.kicker || `Chapter ${sc.n} / 4`));
  const title = words(sc.title, "native-title");
  const body = $("p", "native-body", esc(sc.body || ""));
  const points = $("div", "native-points");
  const bullets = (sc.points || []).map((p) => {
    const li = $("div", "native-point", `<i></i><span>${esc(p)}</span>`);
    points.append(li); return li;
  });
  const label = $("div", "native-note", esc(sc.note ?? "Sample data"));
  copy.append(kick, title.box, body, points, label);
  const phones = (sc.phones || [{ platform: sc.platform, still: sc.still }]).map((p, i) => {
    const group = $("div", "native-device device-" + i);
    const name = $("div", "native-platform", esc(p.platform || "iOS"));
    const android = /android/i.test(p.platform || sc.platform || "");
    const frame = $("div", "native-bezel" + (android ? " android-bezel" : ""));
    const shot = $("img", "native-screen");
    shot.src = p.still || sc.still || "";
    const reflection = $("div", "native-reflection");
    frame.append(shot, reflection);
    if (sc.showPlatform) group.append(name);
    group.append(frame);
    el.append(group);
    return { group, shot, frames: p.frames || (i === (sc.activePhone ?? 0) ? sc.frames : null), timeline: p.timeline };
  });
  const strip = $("div", "native-strip");
  for (let i = 1; i <= 4; i++) strip.append($("i", i === sc.n ? "active" : ""));
  el.append(copy, strip);
  title.list.forEach((_, i) => cue(sc.at + 0.35 + i * 0.055, "pop", 0.16));
  return { el, update(t) {
    kick.style.opacity = clamp(t * 3);
    title.list.forEach((w, i) => {
      const d = drop(t - 0.25 - i * 0.055, 25, 1.6, 0.65);
      w.style.opacity = d.o;
      w.style.transform = `translateY(${px(d.y)})`;
    });
    body.style.opacity = outCubic((t - 0.7) / 0.65);
    bullets.forEach((li, i) => {
      const p = outCubic((t - 1.1 - i * 0.35) / 0.55);
      li.style.opacity = p;
      li.style.transform = `translateX(${px((1-p)*14)})`;
    });
    label.style.opacity = outCubic((t - 0.9) / 0.6);
    phones.forEach(({group, shot, frames, timeline}, i) => {
      const p = outCubic((t - 0.12) / 0.9);
      group.style.opacity = p;
      group.style.transform = `translateY(${px((1-p)*38)})`;
      if (frames) {
        let sourceTime = Math.max(0, t);
        if (timeline) {
          sourceTime = timeline[0][1];
          for (let j = 1; j < timeline.length; j++) {
            const [end, value] = timeline[j];
            const [start, previous] = timeline[j - 1];
            if (t >= end) sourceTime = value;
            else {
              sourceTime = previous + (value - previous) * clamp((t - start) / (end - start));
              break;
            }
          }
        }
        const f = Math.min(frames.count, Math.floor(sourceTime * FPS) + 1);
        shot.src = `${frames.dir}/${String(f).padStart(5,"0")}.${frames.ext || "png"}`;
      }
    });
  }};
};
