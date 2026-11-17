// High-resolution real app screens for the screenshot cards.
import {chromium} from './node_modules/playwright-core/index.mjs';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const OUT=`${ROOT}/scripts/metro-video/captures`;mkdirSync(OUT,{recursive:true});
const exe=process.env.EXE||execFileSync('sh',['-c','ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell | sort -V | tail -1']).toString().trim();
const browser=await chromium.launch({executablePath:exe});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3});
const page=await ctx.newPage();page.setDefaultTimeout(45000);
const go=async path=>{await page.goto('https://ncr-metro.tashif.codes'+path,{waitUntil:'load'});await page.waitForTimeout(2400);};
const save=async n=>{await page.screenshot({path:`${OUT}/phone-${n}.png`});console.log('Captured',n);};
const pin=async loc=>{await loc.evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(600);await page.mouse.move(200,400);await page.mouse.wheel(0,-90);await page.waitForTimeout(700);};
try{
 await go('/journey/AIIMS/NM08?fromName=AIIMS&toName=Noida%20Sector%20137');
 await page.getByText(/Two tickets/).waitFor();await page.waitForTimeout(2200);
 await save('cross');await pin(page.getByText(/Two tickets/));await save('split-fare');
 await pin(page.getByText('Change networks',{exact:true}));await save('transfer');
 await go('/journey/AIIMS/RCK?fromName=AIIMS&toName=RAJIV%20CHOWK');
 await page.getByRole('radio',{name:'Route preference: Shortest',exact:true}).waitFor();await page.waitForTimeout(1600);await save('journey');
 await pin(page.getByText('Train Timings',{exact:true}));await save('timings');
 await go('/search/station/RCK?stationName=RAJIV%20CHOWK');
 await page.getByLabel('Gates',{exact:true}).waitFor();await page.getByLabel('Platforms',{exact:true}).click();await page.getByLabel('Gates',{exact:true}).click();await pin(page.getByLabel('Gates',{exact:true}));await save('gates');
 await page.getByLabel('Gates',{exact:true}).click();await page.getByLabel('Lifts',{exact:true}).click();await pin(page.getByLabel('Lifts',{exact:true}));await save('lifts');
 await go('/map');await page.getByLabel('Zoom in',{exact:true}).waitFor();await page.waitForTimeout(1600);await page.getByLabel('Zoom in',{exact:true}).click();await page.getByLabel('Zoom in',{exact:true}).click();await page.waitForTimeout(1300);await save('map');
 await go('/appearance');await page.getByLabel('Dark theme',{exact:true}).click();await page.waitForTimeout(1000);await save('appearance');
}finally{await ctx.close();await browser.close();}
