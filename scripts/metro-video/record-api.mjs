import {session} from './engine/rec.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const VID=process.env.VID||'/tmp/vid';
const s=await session('ncr-metro-api',{viewport:{width:1440,height:900},scale:1});
try{
 await s.page.goto('https://ncr-metro.tashif.codes/api',{waitUntil:'networkidle'});
 await s.page.evaluate(()=>document.fonts.ready);await s.wait(1500);
 await s.page.screenshot({path:`${ROOT}/public/reel/ncr-metro-api-docs.png`});
 s.mark('docs');await s.wait(2200);await s.scrollBy(360);await s.wait(2500);s.mark('docs-end');
 await s.page.goto('https://ncr-metro.tashif.codes/api/docs',{waitUntil:'networkidle'});
 await s.page.locator('.swagger-ui .opblock').first().waitFor();await s.wait(1800);
 await s.page.screenshot({path:`${ROOT}/public/reel/ncr-metro-api-swagger.png`});
 s.mark('swagger');await s.wait(2000);await s.scrollBy(300);await s.wait(2200);s.mark('swagger-end');
}finally{
 await s.done();
 const marks=JSON.parse(readFileSync(`${VID}/raw/ncr-metro-api.marks.json`));
 writeFileSync(`${VID}/raw/ncr-metro-api.segments.json`,JSON.stringify(Object.fromEntries(['docs','swagger'].map(k=>[k,{raw:`${VID}/raw/ncr-metro-api.webm`,a:marks.find(m=>m.label===k)?.t,b:marks.find(m=>m.label===k+'-end')?.t}])),null,2));
}
