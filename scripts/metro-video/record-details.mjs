import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {session} from './engine/rec.mjs';
import {writeFileSync,readFileSync} from 'node:fs';
const mode=process.argv[2]||'web',phone=mode==='phone',VID=process.env.VID||'/tmp/vid';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const s=await session(`ncr-metro-${mode}-details`,{viewport:phone?{width:390,height:844}:{width:1440,height:900},scale:1});
const {page}=s;page.setDefaultTimeout(45000);const segments={};
async function start(n){s.mark(n);segments[n]={};}
async function finish(n){s.mark(n+'-end');await page.screenshot({path:`${ROOT}/public/reel/ncr-metro-${mode}-${n}.png`});}
async function pin(loc){await loc.evaluate(e=>e.scrollIntoView({block:'start',behavior:'smooth'}));await s.wait(900);await page.mouse.move(phone?200:1050,phone?360:450);await s.scrollBy(-100);await s.wait(700);}
try{
 await page.goto('https://ncr-metro.tashif.codes/search/station/RCK?stationName=RAJIV%20CHOWK',{waitUntil:'load'});
 await page.getByLabel('Gates',{exact:true}).waitFor();await s.wait(1800);
 if(phone)await page.addStyleTag({content:'#__rec_cursor{display:none!important}'});
 await s.click(page.getByLabel('Platforms',{exact:true}));await s.wait(600);
 await pin(page.getByLabel('Gates',{exact:true}));
 await start('gates');await s.click(page.getByLabel('Gates',{exact:true}));await s.wait(1400);await pin(page.getByLabel('Gates',{exact:true}));await s.wait(5000);await finish('gates');
 await s.click(page.getByLabel('Gates',{exact:true}));await s.wait(500);
 await pin(page.getByLabel('Lifts',{exact:true}));
 await start('lifts');await s.click(page.getByLabel('Lifts',{exact:true}));await s.wait(1400);await pin(page.getByLabel('Lifts',{exact:true}));await s.wait(5000);await finish('lifts');
 await page.goto('https://ncr-metro.tashif.codes/appearance',{waitUntil:'load'});await page.getByLabel('Dark theme',{exact:true}).waitFor();await s.wait(2200);
 if(phone)await page.addStyleTag({content:'#__rec_cursor{display:none!important}'});
 await start('appearance');await s.click(page.getByLabel('Dark theme',{exact:true}));await s.wait(3200);await s.click(page.getByLabel('Light theme',{exact:true}));await s.wait(3200);await finish('appearance');
}catch(e){console.error(e);process.exitCode=1;await page.screenshot({path:`${VID}/details-error-${mode}.png`});}finally{
 await s.done();const marks=JSON.parse(readFileSync(`${VID}/raw/ncr-metro-${mode}-details.marks.json`));
 const path=`${VID}/raw/ncr-metro-${mode}.segments.json`,seg=JSON.parse(readFileSync(path));
 for(const n of Object.keys(segments)){const a=marks.find(m=>m.label===n),b=marks.find(m=>m.label===n+'-end');if(a&&b)seg[n]={a:a.t,b:b.t,raw:`${VID}/raw/ncr-metro-${mode}-details.webm`};}
 writeFileSync(path,JSON.stringify(seg,null,2));
}
