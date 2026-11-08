// Reuse the product-video renderer while keeping this film's scenes local.
import { readFileSync, writeFileSync, mkdirSync, existsSync, symlinkSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const shared = process.env.PRODUCT_VIDEO_SCRIPTS || resolve(homedir(), '.claude/skills/product-video/scripts');
const cache = process.env.VID || resolve(here, '../../node_modules/.cache/product-video');
const work = resolve(cache, 'renderer/stats-api');
mkdirSync(work, { recursive: true });
const comp = JSON.parse(readFileSync(resolve(here, 'composition.json'), 'utf8'));
for (const sc of comp.scenes) {
  if (sc.src) sc.src.raw = resolve(here, sc.src.raw);
  if (sc.still) sc.still = resolve(here, sc.still);
}
comp.out = resolve(here, '../../public/reel/stats-api-demo.mp4');
comp.poster = resolve(here, '../../public/reel/stats-api-poster.jpg');
for (const p of comp.platforms) {
  const path = resolve(here, p.icon);
  p.iconMarkup = path.endsWith('.svg')
    ? readFileSync(path, 'utf8').replace('<svg ', '<svg fill="currentColor" width="36" height="36" ')
    : `<img width="36" height="36" alt="" src="data:image/png;base64,${readFileSync(path).toString('base64')}">`;
}
comp.theme.css += readFileSync(resolve(here, 'theme.css'), 'utf8');
const engine = readFileSync(resolve(shared, 'engine.js'), 'utf8');
const marker = '// -------------------------------------------------------------- timeline';
if (!engine.includes(marker)) throw new Error('The product-video engine timeline marker changed.');
writeFileSync(resolve(work, 'engine.js'), engine.replace(marker, readFileSync(resolve(here, 'scenes.js'), 'utf8') + '\n' + marker));
for (const file of ['render.mjs', 'style.css', 'audio.py']) copyFileSync(resolve(shared, file), resolve(work, file));
// Keep the web export below Workers Assets' 25 MiB per-file limit.
const renderer = resolve(work, 'render.mjs');
writeFileSync(renderer, readFileSync(renderer, 'utf8').replace('"-crf", "16"', '"-crf", "18"'));
if (!existsSync(resolve(work, 'node_modules'))) symlinkSync(resolve(shared, 'node_modules'), resolve(work, 'node_modules'), 'dir');
writeFileSync(resolve(work, 'composition.json'), JSON.stringify(comp));
const result = spawnSync(process.execPath, [resolve(work, 'render.mjs'), resolve(work, 'composition.json'), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, VID: cache } });
process.exit(result.status ?? 1);
