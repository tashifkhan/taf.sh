// Native phone footage for the product-video engine. No CSS animation clocks.
// The upstream diagram engine divides by rows - 1. Center a single row.
for (const scene of C.scenes) {
  if (scene.type === 'arch' && scene.rows === 1) {
    scene.rows = 3;
    scene.nodes.forEach((node) => { node.y = 1; });
  }
}
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
    return { group, shot, animated: sc.frames && i === (sc.activePhone ?? 0) };
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
    phones.forEach(({group, shot, animated}, i) => {
      const p = outCubic((t - 0.12 - i * 0.18) / 0.9);
      group.style.opacity = p;
      group.style.transform = `translateY(${px((1-p)*38)})`;
      if (animated) {
        const f = Math.min(sc.frames.count, Math.floor(Math.max(0,t) * FPS) + 1);
        shot.src = `${sc.frames.dir}/${String(f).padStart(5,"0")}.${sc.frames.ext || "png"}`;
      }
    });
  }};
};
