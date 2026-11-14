// Render a composition to an MP4 with soundtrack.
// Usage: node render.mjs comp/<name>.json [--frames a:b] [--still t1,t2,...]
// Footage windows are cut to JPEG sequences with ffmpeg, then engine.js lays
// out every frame and N headless browsers capture them in parallel.
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// EXE: a Chromium binary. Defaults to the newest Playwright headless shell in the cache.
const EXE = process.env.EXE || execFileSync("sh", ["-c", "ls -d $HOME/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell | sort -V | tail -1"]).toString().trim();
const HERE = dirname(fileURLToPath(import.meta.url));
const VID = process.env.VID || "/tmp/vid";
const comp = JSON.parse(readFileSync(process.argv[2], "utf8"));
const args = process.argv.slice(3);
const opt = (k) => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; };
const OUT = `${VID}/frames/${comp.name}`;
mkdirSync(OUT, { recursive: true });
const FPS = comp.fps || 30, DPR = 1.5;
const sh = (cmd, a) => execFileSync(cmd, a, { stdio: ["ignore", "pipe", "inherit"], maxBuffer: 1 << 28 });

// ------------------------------------------------------------ footage
for (const [i, sc] of comp.scenes.entries()) {
  if (sc.type !== "demo") continue;
  const { raw, a, b, speed = 1, crop } = sc.src;
  const key = createHash("sha1").update("cfr-paisa-2:" + (sc.layout === "portrait" ? "portrait" : "") + JSON.stringify(sc.src)).digest("hex").slice(0, 10);
  const dir = `${VID}/footage/${comp.name}-${key}`;
  if (!existsSync(`${dir}/done`)) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    // Drop recorder padding, then scale once to the composition's display size.
    const width = sc.layout === "portrait" ? 684 : sc.layout === "phone" ? 468 : sc.layout === "foldable" ? 852 : 1632;
    // Normalize sparse recorder timestamps before trimming. This preserves the
    // frame already visible at the requested start, including long still spans.
    const vf = [`fps=${FPS}`, `trim=start=${a}:end=${b}`, crop ? `crop=${crop}` : null, `setpts=(PTS-STARTPTS)/${speed}`, `fps=${FPS}`, `scale=${width}:-2`, "crop=trunc(iw/2)*2:trunc(ih/2)*2", "tpad=stop_mode=clone:stop_duration=1"].filter(Boolean).join(",");
    // PNG, not JPEG. A near-black page compresses into a gray film, which is
    // the mask over the screen recordings. Chapter stills were already PNG.
    sh("ffmpeg", ["-v", "error", "-i", raw, "-vf", vf, "-frames:v", String(Math.round((b-a)/speed*FPS)), `${dir}/%05d.png`]);
    writeFileSync(`${dir}/done`, "png");
  }
  sc.frames = { dir, count: readdirSync(dir).filter((f) => f.endsWith(".png") || f.endsWith(".jpg")).length, ext: existsSync(`${dir}/00001.png`) ? "png" : "jpg" };
}
// Feature slides preview the footage that follows them.
comp.scenes.forEach((sc, i) => {
  if (sc.type === "chapter" && !sc.still) {
    const next = comp.scenes.slice(i + 1).find((s) => s.type === "demo");
    if (next) sc.still = `${next.frames.dir}/${String(Math.min(next.frames.count, Math.round(next.frames.count * 0.6))).padStart(5, "0")}.${next.frames.ext || "png"}`;
  }
});
comp.featureCount = comp.scenes.filter((s) => s.type === "chapter").length;

// ---------------------------------------------------------------- page
const vars = Object.entries(comp.theme.vars).map(([k, v]) => `--${k}:${v}`).join(";");
const html = `<!doctype html><html><head><meta charset="utf-8">
${comp.theme.fonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${comp.theme.fonts}&display=block">` : ""}
<style>${readFileSync(`${HERE}/style.css`, "utf8")}</style>
<style>:root{${vars}}${comp.theme.css || ""}</style></head>
<body><div id="stage"></div><div id="fade"></div>
<script>window.COMP=${JSON.stringify(comp)}</script>
<script>${readFileSync(`${HERE}/engine.js`, "utf8")}</script></body></html>`;
writeFileSync(`${OUT}/index.html`, html);

async function open(browser) {
  const page = await browser.newPage({ viewport: comp.format === "portrait" ? { width: 720, height: 1280 } : { width: 1280, height: 800 }, deviceScaleFactor: DPR });
  page.on("pageerror", (e) => console.error("pageerror", e.message));
  await page.goto(`file://${OUT}/index.html`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

const launch = () => chromium.launch({ executablePath: EXE, args: ["--allow-file-access-from-files", "--disable-web-security"] });
const probe = await launch();
const p0 = await open(probe);
const meta = await p0.evaluate(() => window.__meta());
writeFileSync(`${OUT}/meta.json`, JSON.stringify({ ...meta, music: comp.music, raws: comp.scenes.filter((s) => s.type === "demo").map((s) => s.src) }, null, 1));
const N = Math.ceil(meta.total * FPS);
console.log(`${comp.name}: ${meta.total.toFixed(1)}s, ${N} frames`);

if (opt("--still")) {
  for (const t of opt("--still").split(",").map(Number)) {
    await p0.evaluate((t) => window.__seek(t), t);
    await p0.screenshot({ path: `${OUT}/still-${t}.png`, type: "png" });
    console.log(`${OUT}/still-${t}.png`);
  }
  await probe.close();
  process.exit(0);
}
await probe.close();

// --------------------------------------------------------------- frames
const [from, to] = opt("--frames") ? opt("--frames").split(":").map(Number) : [0, N];
mkdirSync(`${OUT}/f`, { recursive: true });
const WORKERS = Number(process.env.WORKERS || 8);
const per = Math.ceil((to - from) / WORKERS);
let done = 0;
const t0 = Date.now();
if (!args.includes("--encode-only")) await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const a = from + w * per, b = Math.min(to, a + per);
  if (a >= b) return;
  const browser = await launch();
  const page = await open(browser);
  for (let f = a; f < b; f++) {
    await page.evaluate((t) => window.__seek(t), f / FPS);
    await page.screenshot({ path: `${OUT}/f/${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 97 });
    if (++done % 200 === 0) console.log(`${done}/${to - from} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
}));
if (opt("--frames")) process.exit(0);

// ---------------------------------------------------------------- encode
sh("ffmpeg", ["-y", "-v", "error", "-framerate", String(FPS), "-i", `${OUT}/f/%05d.jpg`, "-frames:v", String(N),
  "-c:v", "libx264", "-threads", "4", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-tune", "stillimage",
  `${OUT}/video.mp4`]);
sh("uv", ["run", "--with", "numpy", "python", `${HERE}/audio.py`, `${OUT}/meta.json`, `${OUT}/music.wav`]);
sh("ffmpeg", ["-y", "-v", "error", "-filter_threads", "1", "-i", `${OUT}/video.mp4`, "-i", `${OUT}/music.wav`, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
  "-c:a", "aac", "-b:a", "160k", "-af", "loudnorm=I=-18:TP=-1.5", "-shortest", "-movflags", "+faststart", comp.out]);
sh("ffmpeg", ["-y", "-v", "error", "-ss", String(comp.posterAt ?? 1.8), "-i", comp.out, "-frames:v", "1", "-vf", "scale=1280:-2", "-q:v", "3", comp.poster]);
console.log(JSON.stringify({ out: comp.out, seconds: +meta.total.toFixed(1), frames: N, took: Math.round((Date.now() - t0) / 1000) }));
