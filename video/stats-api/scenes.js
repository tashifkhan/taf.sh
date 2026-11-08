// These scenes extend the shared frame-accurate engine before its timeline builds.
const brand = (p) => `<span class="brand-icon" style="color:${p.color}">${p.iconMarkup}</span>`;
const platforms = C.platforms;

function enterTitle(title, t, at = 0.45) {
  title.list.forEach((word, i) => {
    const p = outCubic((t - at - i * 0.055) / 0.55);
    word.style.opacity = p;
    word.style.transform = `translateY(${px((1 - p) * 24)})`;
  });
}

S.platformIntro = (sc) => {
  const el = $('div', 'scene platformIntro');
  const mast = $('div', 'mast', `${tafMark}<span>taf.sh</span><small>digital shenanigans / developer tools</small><b>01 / STATS API</b>`);
  const copy = $('div', 'copy');
  const kicker = $('div', 'kicker', esc(sc.kicker));
  const title = words(sc.title, 'title');
  const body = $('p', 'body', esc(sc.tagline));
  const url = $('div', 'chip', '<span>$</span> open taf.sh');
  copy.append(kicker, title.box, body, url);
  const board = $('div', 'platform-board');
  const heading = $('div', 'board-heading', '<span>PLATFORM ADAPTERS</span><b>07 PUBLIC + 02 SELF-HOSTED</b>');
  const tiles = platforms.map((p, i) => {
    const tile = $('div', 'platform-tile' + (p.selfHosted ? ' self-hosted' : ''), `${brand(p)}<b>${esc(p.name)}</b><strong>${esc(p.value)}</strong><small>${esc(p.detail)}</small>`);
    tile.style.setProperty('--brand', p.color);
    board.append(tile);
    cue(sc.at + 0.5 + i * 0.075, 'tick', 0.22);
    return tile;
  });
  const foot = $('div', 'intro-foot', '<span>JSON FOR YOUR APP</span><i></i><span>SVG FOR YOUR README</span><b>Same response envelope across every platform.</b>');
  el.append(mast, copy, heading, board, foot);
  return { el, update(t) {
    mast.style.opacity = outCubic(t / 0.7);
    kicker.style.opacity = outCubic((t - 0.25) / 0.5);
    enterTitle(title, t);
    body.style.opacity = outCubic((t - 0.95) / 0.6);
    url.style.opacity = outCubic((t - 1.3) / 0.6);
    heading.style.opacity = outCubic((t - 0.35) / 0.6);
    tiles.forEach((tile, i) => {
      const p = outCubic((t - 0.45 - i * 0.075) / 0.65);
      tile.style.opacity = p;
      tile.style.transform = `translateY(${px((1 - p) * 24)})`;
    });
    foot.style.opacity = outCubic((t - 1.4) / 0.7);
  }};
};

S.platformSchema = (sc) => {
  const el = $('div', 'scene platformSchema');
  el.append(hud(0));
  const copy = $('div', 'copy');
  const kick = $('div', 'kicker', esc(sc.kicker));
  const title = words(sc.title, 'title');
  copy.append(kick, title.box);
  const grid = $('div', 'schema-platforms');
  const tiles = platforms.map((p, i) => {
    const tile = $('div', 'schema-platform', `${brand(p)}<b>${esc(p.name)}</b><small>${p.selfHosted ? 'self-hosted Git' : 'public platform'}</small>`);
    grid.append(tile);
    cue(sc.at + 0.65 + i * 0.08, 'tick', 0.18);
    return tile;
  });
  const arrow = $('div', 'schema-arrow', '<span></span><b>→</b>');
  const payload = $('div', 'schema-payload', '<div class="payload-head"><i></i>200 OK <span>application/json</span></div><pre>{\n  "status": "success",\n  "platform": "…",\n  "username": "…",\n  "cached": false,\n  "data": { … }\n}</pre><p>Platform-specific data.<br>The same five outer fields.</p>');
  const note = $('div', 'schema-note', 'Forgejo and Gitea use the shared self-hosted Git adapter.');
  el.append(copy, grid, arrow, payload, note);
  return { el, update(t) {
    kick.style.opacity = outCubic((t - 0.2) / 0.5);
    enterTitle(title, t);
    tiles.forEach((tile, i) => {
      const p = outCubic((t - 0.6 - i * 0.08) / 0.6);
      tile.style.opacity = p;
      tile.style.transform = `translateY(${px((1 - p) * 20)})`;
    });
    const p = outCubic((t - 1.5) / 0.8);
    arrow.style.opacity = p;
    payload.style.opacity = p;
    payload.style.transform = `translateX(${px((1 - p) * 24)})`;
    note.style.opacity = outCubic((t - 2.1) / 0.7);
  }};
};

S.contact = (sc) => {
  const el = $('div', 'scene contact');
  const mast = $('div', 'mast', `${tafMark}<span>taf.sh</span><small>digital shenanigans / developer tools</small><b>STATS API</b>`);
  const copy = $('div', 'copy');
  const kick = $('div', 'kicker', esc(sc.kicker));
  const title = words(sc.title, 'title');
  copy.append(kick, title.box);
  const routes = $('div', 'api-routes');
  const routeHeading = $('div', 'routes-heading', 'PUBLIC APIS');
  const rows = platforms.filter(p => !p.selfHosted).map(p => {
    const row = $('div', 'api-route', `${brand(p)}<span>${esc(p.route)}</span>`);
    routes.append(row);
    return row;
  });
  const self = $('div', 'self-options', `<span>SELF-HOSTED GIT</span>${platforms.filter(p => p.selfHosted).map(p => `<b>${brand(p)}${esc(p.name)}</b>`).join('')}`);
  const contact = $('div', 'contact-card', `<small>BUILT BY</small>${tafMark}<strong>${esc(sc.site)}</strong><span class="contact-rule"></span><small>LET'S BUILD SOMETHING</small><b>${esc(sc.email)}</b>`);
  const foot = $('div', 'contact-foot', '<span>FastAPI / Pydantic / Redis</span><b>Consistent JSON. Shareable SVG cards.</b>');
  el.append(mast, copy, routeHeading, routes, self, contact, foot);
  return { el, update(t) {
    mast.style.opacity = outCubic(t / 0.7);
    kick.style.opacity = outCubic((t - 0.2) / 0.5);
    enterTitle(title, t, 0.35);
    const c = outCubic((t - 0.65) / 0.7);
    contact.style.opacity = c;
    contact.style.transform = `translateY(${px((1 - c) * 24)})`;
    routeHeading.style.opacity = outCubic((t - 0.9) / 0.6);
    rows.forEach((row, i) => {
      const p = outCubic((t - 1.0 - i * 0.08) / 0.5);
      row.style.opacity = p;
      row.style.transform = `translateX(${px((1 - p) * 12)})`;
    });
    self.style.opacity = outCubic((t - 1.7) / 0.6);
    foot.style.opacity = outCubic((t - 1.9) / 0.6);
  }};
};
