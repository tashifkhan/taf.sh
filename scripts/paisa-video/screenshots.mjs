// Compose real Paisa captures into portrait store artwork and wide gallery cards.
// This browser only renders local artwork. It does not interact with the app.
import { chromium } from './engine/node_modules/playwright-core/index.mjs';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(import.meta.url));
const site = resolve(root, '../..');
const out = resolve(site, 'public/reel');
const work = process.env.VID || '/tmp/paisa-video';
mkdirSync(`${work}/artwork`, { recursive: true });
const data = (p, type = 'image/png') => `data:${type};base64,${readFileSync(p).toString('base64')}`;
const asset = name => data(`${root}/${name}.png`);
const font = (name, file) => `@font-face{font-family:'${name}';src:url('${data(`${site}/node_modules/@fontsource/${file}`, 'font/woff2')}')}`;
const crop = (name, source, box) => {
  const file = `${work}/artwork/${name}.png`;
  execFileSync('ffmpeg', ['-v','error','-y','-i',`${root}/${source}.png`,'-vf',`crop=${box}`,'-frames:v','1',file]);
  return data(file);
};
const budgets = [
  crop('monthly','desktop-budgets','760:190:530:126'),
  crop('food','desktop-budgets','760:190:1310:126'),
  crop('shopping','desktop-budgets','760:190:530:326'),
  crop('transport','desktop-budgets','760:190:1310:326'),
];
const backup = crop('backup-settings','desktop-backup','1600:1570:1260:110');
const record = crop('record-summary','desktop-detail','960:850:1920:0');
const phone = (src, cls = '') => `<div class="device phone ${cls}"><img src="${asset(src)}"></div>`;
const fold = (src, cls = '') => `<div class="device fold ${cls}"><img src="${asset(src)}"></div>`;
const web = (src, cls = '') => `<div class="browser ${cls}"><div class="chrome"><i></i><i></i><i></i><span>Paisa · Kotlin / Wasm</span></div><img src="${asset(src)}"></div>`;
const panels = [
  { id:'01', cls:'hero', tag:'A little more clarity', title:'Your money.<br>Your <em>business.</em>', body:'Keep your expenses on your device.<br>No Paisa account required.', art:phone('phone-home'), note:'A local record of everyday spending', platform:'Native Android' },
  { id:'02', cls:'entry', tag:'For the everyday spend', title:'Coffee. Lunch.<br><em>Logged.</em>', body:'Add the amount, category and account.<br>Save the record on your device.', art:phone('phone-add'), note:'Manual entry works without an AI service', platform:'Native Android' },
  { id:'03', cls:'adaptive', tag:'Made for a little more room', title:'Unfold.<br>See <em>more.</em>', body:'Open a transaction beside your records.<br>The layout adapts to the inner display.', art:fold('foldable-detail'), note:'The list stays. The details open beside it.', platform:'Android · foldable' },
  { id:'04', cls:'analytics', tag:'Follow the spending', title:'Where did<br>it <em>go?</em>', body:'Compare the month. Inspect categories.<br>Review the original transactions.', art:fold('foldable-analytics'), note:'Monthly totals, category charts and a heatmap', platform:'Android · foldable' },
  { id:'05', cls:'budgets dark', tag:'Give spending a limit', title:'A budget for<br><em>your life.</em>', body:'Set monthly caps for the categories<br>you want to watch.', art:`<div class="budget-stack">${budgets.map((s,i)=>`<div class="budget b${i}"><img src="${s}"></div>`).join('')}</div>`, note:'Real category budgets in Paisa', platform:'Kotlin Multiplatform' },
  { id:'06', cls:'desktop', tag:'The bigger picture', title:'Same Paisa.<br>More <em>space.</em>', body:'Search the original records.<br>Open the details beside the results.', art:`${web('desktop-detail')}<div class="record-preview"><img src="${record}"></div>`, note:'Compose Multiplatform in your browser', platform:'Web · Kotlin / Wasm' },
  { id:'07', cls:'backup', tag:'You choose what leaves', title:'Your records.<br>Your <em>choice.</em>', body:'Keep them local, export a file, or connect<br>your own Drive or Nextcloud backup.', art:`<div class="settings"><img src="${backup}"></div>`, note:'Backup and sync are optional', platform:'Your backup destinations' },
  { id:'08', cls:'family dark', tag:'Paisa', title:'At home on<br><em>your screen.</em>', body:'Native Android on phones and foldables.<br>Compose in the browser.', art:`${web('desktop-home')}${fold('foldable-home')}${phone('phone-saved')}`, note:'Open source · github.com/tashifkhan/Paisa', platform:'Phone · foldable · web' },
];
const css = `
${font('Bricolage','bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2')}
${font('BricolageBody','bricolage-grotesque/files/bricolage-grotesque-latin-400-normal.woff2')}
*{box-sizing:border-box}body{margin:0;background:#f7f6ed;font-family:BricolageBody,sans-serif;color:#153b2d}
.panel{width:1242px;height:2688px;position:relative;overflow:hidden;background:#f7f6ed;--green:#235c42}
.brand{position:absolute;left:88px;right:88px;top:82px;display:flex;align-items:center;justify-content:space-between;font:700 42px Bricolage;letter-spacing:-1.5px}
.brand .mark{display:inline-flex;width:56px;height:56px;border-radius:16px;overflow:hidden;align-items:center;justify-content:center;margin-right:13px;vertical-align:-10px}
.mark img{width:100%;height:100%;display:block}.brand small{font:22px BricolageBody;letter-spacing:0}
.copy{position:absolute;left:88px;right:70px;top:250px;z-index:4}.tag{font-size:23px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px}
h1{font:700 130px/.99 Bricolage;letter-spacing:-6px;margin:0 0 40px}h1 em{font:inherit;color:var(--green)}
.body{font-size:33px;line-height:1.42;margin:0;color:#536154}.art{position:absolute;inset:0;z-index:2}
.device{position:absolute;padding:13px;background:#263c30;border:2px solid #5f7163;box-shadow:0 55px 75px -35px #24392e55;border-radius:70px;overflow:hidden}
.device img{width:100%;display:block;border-radius:54px}.phone{width:686px;left:278px;top:875px}.hero .phone{transform:rotate(-4deg)}
.panel:before{content:'';position:absolute;width:1400px;height:1400px;border:2px solid #245c4212;border-radius:50%;left:-80px;top:1020px;box-shadow:0 0 0 120px #245c4205,0 0 0 240px #245c4204}
.footer{position:absolute;left:88px;right:88px;bottom:76px;z-index:5;border-top:1px solid #1a432b35;padding-top:28px;font-size:24px;display:flex;justify-content:space-between;gap:20px}.footer small{font-size:18px;white-space:nowrap}
.note{position:absolute;left:90px;right:90px;bottom:225px;z-index:4;font-size:28px;text-align:center;color:#536154}
.entry{background:#f3e5d3}.entry .phone{top:840px;transform:rotate(3deg);width:690px;left:285px}.entry h1 em{color:#77502c}
.adaptive{background:#dcebd9}.fold{width:1058px;left:92px;top:1040px;border-radius:44px;padding:12px}.fold img{border-radius:30px}.adaptive .fold{transform:rotate(-3deg)}
.analytics{background:#edf0d4}.analytics .fold{top:970px;transform:rotate(3deg)}
.dark{background:#153f30;color:#f2f4dd;--green:#c9e5b0}.dark .body,.dark .note{color:#c7d5c4}.dark .footer{border-color:#b6d2b755}.dark .mark svg{color:#153f30}.dark:before{border-color:#e1f3c912;box-shadow:0 0 0 120px #d0e8b405,0 0 0 240px #d0e8b404}
.budget-stack{position:absolute;left:100px;right:100px;top:1020px}.budget{background:#f1f8e9;padding:22px;border-radius:44px;box-shadow:0 28px 45px #07190f35;margin-bottom:45px;transform:rotate(-3deg)}.budget img{width:100%;display:block;border-radius:30px}.budget:nth-child(even){transform:rotate(3deg)}
.desktop{background:#e3e8e0}.browser{position:absolute;width:1440px;left:100px;top:1030px;border-radius:26px;overflow:hidden;box-shadow:0 45px 80px #193b3330;border:2px solid #a6baaa;background:#edf4e8}.browser img{width:100%;display:block}.chrome{height:55px;display:flex;align-items:center;gap:10px;padding:0 22px;color:#527056;font:19px BricolageBody}.chrome i{width:10px;height:10px;background:#90a68e;border-radius:50%}.chrome span{margin:auto}.desktop .browser{transform:rotate(-3deg);width:1120px;left:61px;top:1010px}.desktop .note{bottom:210px}.record-preview{position:absolute;top:1720px;left:330px;width:730px;border:14px solid #f6f7ed;border-radius:38px;overflow:hidden;box-shadow:0 35px 70px #193b3330;transform:rotate(4deg)}.record-preview img{width:100%;display:block}
.backup{background:#eee7d7}.settings{position:absolute;top:950px;left:130px;width:982px;overflow:hidden;border:12px solid #f6f5eb;border-radius:45px;box-shadow:0 45px 65px #233e2c25;transform:rotate(-3deg)}.settings img{width:100%;display:block}
.family .browser{top:1035px;left:130px;width:1400px;transform:rotate(-4deg)}.family .fold{top:1560px;left:-30px;width:850px;transform:rotate(-5deg)}.family .phone{width:410px;left:775px;top:1420px;transform:rotate(8deg)}.family .note{font-size:25px;bottom:180px}
.wide{width:1920px;height:1200px}.wide .brand{left:100px;right:100px;top:64px;font-size:33px}.wide .brand small{font-size:20px}.wide .brand .mark{width:36px;height:36px;border-radius:11px}.wide .copy{left:100px;top:270px;width:770px;right:auto}.wide .tag{font-size:18px;margin-bottom:34px}.wide h1{font-size:112px;letter-spacing:-5px;margin-bottom:40px}.wide .body{font-size:28px;line-height:1.5}.wide .phone{width:420px;left:1190px;top:110px;border-radius:44px;padding:8px}.wide .phone img{border-radius:34px}.wide .footer{bottom:40px;left:100px;right:100px;font-size:20px;padding-top:21px}.wide .footer small{font-size:16px}.wide .note{display:none}.wide:before{left:800px;top:200px;width:1100px;height:1100px}.wide .fold{width:870px;top:180px;left:970px;border-radius:36px;padding:9px}.wide .fold img{border-radius:25px}.wide .budget-stack{left:1030px;right:100px;top:220px}.wide .budget{padding:12px;margin-bottom:24px;border-radius:26px}.wide .budget img{border-radius:20px}.wide .browser{width:1200px;left:930px;top:270px}.wide .settings{width:820px;left:1020px;top:160px;border-radius:32px;border-width:8px}.wide .family .copy{width:750px}.wide.family .browser{width:1130px;left:900px;top:210px}.wide.family .fold{width:610px;left:930px;top:610px}.wide.family .phone{width:285px;left:1550px;top:420px}.wide.family h1{font-size:106px}
`;
const wideFix = '.wide.desktop .browser{width:950px;left:930px;top:270px}.wide .record-preview{display:none}';
const mark = `<img src="${data(`${root}/paisa-icon.svg`,'image/svg+xml')}" alt="Paisa">`;
const html = (p, wide) => `<!doctype html><meta charset="utf-8"><style>${css}${wideFix}</style><main class="panel ${p.cls} ${wide?'wide':''}"><div class="brand"><span><span class="mark">${mark}</span>paisa</span><small>${p.platform}</small></div><div class="copy"><div class="tag">${p.tag}</div><h1>${p.title}</h1><p class="body">${p.body}</p></div><div class="art">${p.art}</div><div class="note">${p.note}</div><div class="footer"><span>Paisa · local expense tracking</span><small>Real app captures · sample data · ${p.id}/08</small></div></main>`;
const cache = `${process.env.HOME}/Library/Caches/ms-playwright`;
const version = readdirSync(cache).filter(x=>x.startsWith('chromium_headless_shell-')).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).at(-1);
const dir = `${cache}/${version}`;
const inner = readdirSync(dir).find(x=>x.startsWith('chrome-headless-shell-'));
const browser = await chromium.launch({ executablePath: process.env.EXE || `${dir}/${inner}/chrome-headless-shell` });
for (const wide of [false,true]) {
  const page = await browser.newPage({ viewport: wide?{width:1920,height:1200}:{width:1242,height:2688}, deviceScaleFactor:1 });
  for (const [i,p] of panels.entries()) {
    const source = `${work}/artwork/paisa-${p.id}${wide?'-wide':''}.html`;
    writeFileSync(source,html(p,wide));
    await page.goto(`file://${source}`);
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()))});
    const path = wide ? `${out}/paisa-${i+1}.jpg` : `${out}/paisa-appstore-${p.id}.png`;
    await page.screenshot({path, type:wide?'jpeg':'png', ...(wide?{quality:94}:{})});
    console.log(path);
  }
  await page.close();
}
await browser.close();
const tiles = await Promise.all(panels.map(async (p,i) => ({
  input: await sharp(`${out}/paisa-appstore-${p.id}.png`).resize(400,866).toBuffer(),
  left: (i%4)*412,
  top: Math.floor(i/4)*878,
})));
await sharp({create:{width:1636,height:1744,channels:3,background:'#d7dace'}}).composite(tiles).png().toFile(`${out}/paisa-screenshots.png`);
execFileSync('zip',['-j','-q',`${out}/paisa-appstore-screenshots.zip`,...panels.map(p=>`${out}/paisa-appstore-${p.id}.png`)]);
