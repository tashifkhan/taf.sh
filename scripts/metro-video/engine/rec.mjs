// Shared recording helpers: a visible cursor with click ripples, smooth mouse
// moves, human-paced typing, and scene markers (ms from recording start) that
// the compose step uses to cut segments.
import { chromium } from "../node_modules/playwright-core/index.mjs";
import { execFileSync } from "node:child_process";
const EXE = process.env.EXE || execFileSync("sh", ["-c", "ls -d $HOME/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell | sort -V | tail -1"]).toString().trim();

import { writeFileSync, readdirSync, renameSync, mkdirSync } from "node:fs";

const RAW = `${process.env.VID || "/tmp/vid"}/raw`;

const CURSOR = `
(() => {
  const install = () => {
    if (document.getElementById("__rec_cursor")) return;
    const c = document.createElement("div");
    c.id = "__rec_cursor";
    c.style.cssText = "position:fixed;left:0;top:0;width:22px;height:22px;margin:-3px 0 0 -3px;z-index:2147483647;pointer-events:none;transition:transform .08s;";
    c.innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2l15 8.5-6.6 1.6L8.5 19z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; }, true);
    addEventListener("mousedown", (e) => {
      c.style.transform = "scale(.85)";
      const r = document.createElement("div");
      r.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid rgba(29,158,117,.85);left:" + e.clientX + "px;top:" + e.clientY + "px;transition:transform .5s ease-out,opacity .5s ease-out;transform:scale(.3);opacity:1";
      document.documentElement.appendChild(r);
      requestAnimationFrame(() => { r.style.transform = "scale(1.4)"; r.style.opacity = "0"; });
      setTimeout(() => r.remove(), 600);
    }, true);
    addEventListener("mouseup", () => { c.style.transform = ""; }, true);
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", install) : install();
})();`;

export async function session(name, { viewport = { width: 1440, height: 900 }, scale = 1, setup } = {}) {
  const dir = `${RAW}/${name}`;
  mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  // `scale` is the device pixel ratio. The video is saved at viewport times scale, so a
  // later upscale to 1920 doesn't soften it. Layout stays in CSS pixels, so highlight
  // boxes measured as fractions of the viewport don't change.
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    recordVideo: { dir, size: { width: viewport.width * scale, height: viewport.height * scale } },
  });
  await ctx.addInitScript(CURSOR);
  if (setup) await setup(ctx);
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];
  let mx = viewport.width / 2, my = viewport.height / 2;

  const api = {
    page, ctx,
    wait: (ms) => page.waitForTimeout(ms),
    mark: (label) => { marks.push({ label, t: (Date.now() - t0) / 1000 }); console.log("mark", label, marks.at(-1).t.toFixed(2)); },
    async moveTo(target, { steps = 28 } = {}) {
      const loc = typeof target === "string" ? page.locator(target).first() : target;
      await loc.scrollIntoViewIfNeeded().catch(() => {});
      const box = await loc.boundingBox();
      if (!box) throw new Error("no box for target");
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      for (let i = 1; i <= steps; i++) {
        const k = i / steps, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        await page.mouse.move(mx + (x - mx) * e, my + (y - my) * e);
        await page.waitForTimeout(12);
      }
      mx = x; my = y;
    },
    async click(target, opts) { await api.moveTo(target, opts); await page.waitForTimeout(180); await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up(); },
    async type(text, delay = 55) { await page.keyboard.type(text, { delay }); },
    async scrollBy(dy, steps = 30) { for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await page.waitForTimeout(16); } },
    async done() {
      api.mark("end");
      await page.close(); await ctx.close(); await browser.close();
      const file = readdirSync(dir).find((f) => f.endsWith(".webm"));
      renameSync(`${dir}/${file}`, `${RAW}/${name}.webm`);
      writeFileSync(`${RAW}/${name}.marks.json`, JSON.stringify(marks, null, 1));
    },
  };
  return api;
}
