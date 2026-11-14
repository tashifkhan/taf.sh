import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { session } from './engine/rec.mjs';
const mode = process.argv[2] || 'web';
const phone = mode === 'phone';
const VID = process.env.VID || '/tmp/vid';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const host = 'https://ncr-metro.tashif.codes';
const shots = `${ROOT}/public/reel`;
mkdirSync(shots, { recursive: true });
const s = await session(`ncr-metro-${mode}`, {
  viewport: phone ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  scale: 1,
  setup: async ctx => {
    await ctx.addInitScript(() => {
      if (!localStorage.getItem('dmrc:appSettings')) localStorage.setItem('dmrc:appSettings', JSON.stringify({themeMode:'light',paletteId:'metro',amoledDark:false,highContrast:false,hapticsEnabled:false}));
    });
  },
});
const { page } = s;
page.setDefaultTimeout(45000);
const segments = {};
let active;
const begin = name => { active = name; s.mark(name); segments[name] = {a:Date.now()}; };
const end = () => { segments[active].b = Date.now(); };
const save = async name => { await page.screenshot({path:`${shots}/ncr-metro-${mode}-${name}.png`}); };
const click = async loc => s.click(loc);
const hold = async n => s.wait(n || 3000);
const tab = async name => {
  const t = page.getByRole('tab', {name,exact:true});
  if (await t.count()) await click(t); else await click(page.getByRole('tab').filter({hasText:name}).first());
  await hold(1800);
};
const scrollTo = async loc => { await loc.scrollIntoViewIfNeeded(); await hold(1100); };
try {
  await page.goto(host, {waitUntil:'load'});
  await page.getByRole('button',{name:'From: Choose departure',exact:true}).waitFor();
  await hold(5000);
  if(phone) await page.addStyleTag({content:'#__rec_cursor{display:none!important}'});
  begin('home'); await save('home'); await hold(5500); end();
  begin('choose');
  await click(page.getByRole('button',{name:'From: Choose departure',exact:true}));
  await page.getByPlaceholder('Search both metro networks').waitFor();
  await s.type('AIIMS'); await hold(900);
  await click(page.getByLabel(/^AIIMS, code AIIMS/)); await hold(600);
  await click(page.getByRole('button',{name:'To: Choose destination',exact:true}));
  await page.getByPlaceholder('Search both metro networks').waitFor();
  await s.type('Rajiv'); await hold(900);
  await click(page.getByLabel(/^RAJIV CHOWK, code RCK/i)); await hold(2200); end();
  s.mark('find-click'); await click(page.getByRole('button',{name:'Find route',exact:true}));
  await page.getByRole('radio',{name:'Route preference: Shortest',exact:true}).waitFor();
  await hold(2600);
  begin('summary'); await save('journey'); await hold(3500);
  await click(page.getByRole('radio',{name:'Route preference: Fewest Changes',exact:true}));
  await hold(4000); end();
  begin('fares'); await scrollTo(page.getByText('Weekday',{exact:true}).first()); await hold(5000); await save('fares'); end();
  begin('route'); await scrollTo(page.getByText('Route',{exact:true}).first()); await hold(4500); await save('route'); end();
  begin('timings'); await scrollTo(page.getByText('Train Timings',{exact:true})); await hold(4500); end();
  await scrollTo(page.getByRole('button',{name:/Change destination, currently/i}));
  begin('cross-choose'); await click(page.getByRole('button',{name:/Change destination, currently/i}));
  await page.getByPlaceholder('Search both metro networks').waitFor();
  await s.type('137'); await hold(1200);
  await click(page.getByLabel(/^Noida Sector 137, code NM08/)); end();
  await page.getByText(/Two tickets/).waitFor(); await hold(2800);
  begin('cross-summary'); await scrollTo(page.getByRole('button',{name:/Change departure, currently/i})); await hold(5000); await save('cross'); end();
  begin('cross-fare'); await scrollTo(page.getByText(/Two tickets/)); await hold(5500); await save('split-fare'); end();
  begin('transfer'); await scrollTo(page.getByText('Change networks',{exact:true})); await hold(6000); await save('transfer'); end();
  await tab('Search');
  begin('search'); await click(page.getByPlaceholder('Search by name or code')); await s.type('Rajiv'); await hold(2200); await save('search'); await hold(2400); end();
  await click(page.getByLabel(/^RAJIV CHOWK, code RCK/i));
  await page.getByLabel('Gates',{exact:true}).waitFor(); await hold(2200);
  begin('gates'); await scrollTo(page.getByLabel('Gates',{exact:true})); await hold(5500); await save('gates'); end();
  begin('lifts'); await scrollTo(page.getByLabel('Lifts',{exact:true})); await hold(5000); await save('lifts'); end();
  await tab('Lines');
  begin('lines'); await hold(2800); await save('lines');
  const yellow = page.getByLabel(/SAMAYPUR BADLI.*MILLENNIUM CITY CENTRE|MILLENNIUM CITY CENTRE.*SAMAYPUR BADLI/i).first();
  if(await yellow.count()) await click(yellow); else await click(page.getByText('Line 2',{exact:true}).first());
  await hold(2500); await s.scrollBy(250); await hold(2200); end();
  await tab('Map'); await page.getByLabel('Zoom in',{exact:true}).waitFor(); await hold(2200);
  begin('map'); await hold(2200); await click(page.getByLabel('Zoom in',{exact:true})); await hold(1200);
  await click(page.getByLabel('Zoom in',{exact:true})); await hold(3000); await save('map'); end();
  await tab('Alerts'); await page.getByText('Passenger Notices',{exact:true}).waitFor(); await hold(2200);
  begin('alerts'); await save('alerts'); await hold(2200);
  const notice=page.getByRole('button',{name:/LAST METRO TRAIN SERVICE TO COMMENCE/}).first();
  if(await notice.count()) await click(notice);
  await hold(4000); end();
} catch(error) {
  console.error(error);
  await page.screenshot({path:`${VID}/record-error-${mode}.png`});
  writeFileSync(`${VID}/record-error-${mode}.txt`, await page.locator('body').innerText());
  process.exitCode=1;
} finally {
  await s.done();
  const marks=JSON.parse((await import('node:fs')).readFileSync(`${VID}/raw/ncr-metro-${mode}.marks.json`,'utf8'));
  for(const [name,seg] of Object.entries(segments)) {
    const mark=marks.find(m=>m.label===name); const delta=seg.b ? (seg.b-seg.a)/1000 : 0;
    segments[name]={a:mark.t,b:mark.t+delta};
  }
  writeFileSync(`${VID}/raw/ncr-metro-${mode}.segments.json`,JSON.stringify(segments,null,2));
}
