// App Store and Google Play artwork from actual native captures.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const skill=process.env.PRODUCT_VIDEO_SCRIPTS || '/Users/taf/.codex/skills/product-video/scripts';
const {chromium}=createRequire(`${skill}/package.json`)('playwright-core');
const exe=process.env.EXE || execFileSync('sh',['-c','ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell | sort -V | tail -1']).toString().trim();
const uri=(path,mime)=>`data:${mime};base64,${readFileSync(path).toString('base64')}`;
const fonts=`@font-face{font-family:Archivo;src:url('${uri(`${root}/node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2`,'font/woff2')}');font-weight:100 900}`;
const icon=uri('/Users/taf/Projects/Patchwork/app/assets/images/icon.png','image/png');
const panels=[
  {id:'01-tasks',screen:'tasks',title:'Your work.<br>One <em>app.</em>',sub:'CalDAV, GitHub, Jira and Nextcloud Deck.',bg:'#FAF1E6'},
  {id:'02-detail',screen:'detail',title:'Keep the<br><em>details.</em>',sub:'Notes, checklists, tags and due dates.',bg:'#F4D4CC'},
  {id:'03-boards',screen:'jira-board',title:'Your projects.<br>In <em>motion.</em>',sub:'Jira boards, sprints, priorities and assignees.',bg:'#E9E3D5'},
  {id:'04-search',screen:'search',title:'Find it.<br>Get <em>moving.</em>',sub:'Search your tasks, cards and issues.',bg:'#E7E0EF'},
  {id:'05-appearance',screen:'appearance',title:'Make room<br>for <em>you.</em>',sub:'Choose your theme, accent and contrast.',bg:'#FAF1E6'},
  {id:'06-ai',screen:'ai',title:'Choose your<br><em>AI.</em>',sub:'Bring your own key. Review every draft.',bg:'#E5E9DD'},
  {id:'07-filters',screen:'jira-filter',title:'See only<br><em>your work.</em>',sub:'Filter by assignee, sprint, type and priority.',bg:'#F4D4CC'},
  {id:'08-drag',screen:'jira-drag',title:'Pick it up.<br>Move it <em>on.</em>',sub:'Drag cards to reorder your board.',bg:'#E9E3D5'},
];
const browser=await chromium.launch({executablePath:exe,args:['--allow-file-access-from-files']});
const selected=process.argv.slice(2).filter(x=>['ios','android'].includes(x));
for(const platform of selected.length?selected:['ios','android']){
  const width=platform==='ios'?1320:1080, height=platform==='ios'?2868:2400;
  const scale=width/1320;
  const output=`${root}/public/reel/patchwork-store/${platform}`;
  mkdirSync(output,{recursive:true});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  for(const [i,p] of panels.entries()){
    const shot=uri(`${root}/public/reel/patchwork-${platform}-${p.screen}.png`,'image/png');
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
      *{box-sizing:border-box}html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
      body{background:${p.bg};color:#2C202D;font-family:Archivo,sans-serif}
      .art{position:relative;width:1320px;height:${height/scale}px;transform:scale(${scale});transform-origin:0 0}
      header{position:absolute;left:96px;right:96px;top:78px;display:flex;align-items:center;gap:20px;font-size:38px;letter-spacing:-1.3px;font-weight:650}
      header img{height:74px;width:74px;border-radius:19px}header small{margin-left:auto;font-size:24px;font-weight:500;letter-spacing:0;color:#665765}
      h1{position:absolute;top:190px;left:96px;margin:0;font-size:136px;line-height:1.02;letter-spacing:-6px;font-weight:620}
      h1 em{font-family:inherit;font-weight:620;letter-spacing:inherit;font-style:normal;color:#B84942}
      .sub{position:absolute;left:100px;right:80px;top:505px;font-size:32px;line-height:1.4;color:#685865;margin:0;font-weight:450}
      .device{position:absolute;top:620px;left:175px;width:970px;border:14px solid #25202A;border-radius:112px;overflow:hidden;background:#000;box-shadow:0 0 0 3px #A4777380,0 32px 55px #39213230}
      .device img{display:block;width:100%;height:auto}
      .thread{position:absolute;right:46px;top:180px;width:125px;height:380px;border-right:3px dashed #AC8A8A55;border-top:3px dashed #AC8A8A55;border-radius:0 90px 0 0;transform:rotate(10deg)}
      .index{position:absolute;right:101px;top:540px;color:#927A8466;font:500 25px Archivo,sans-serif;letter-spacing:2px}
    </style></head><body><main class="art"><div class="thread"></div><header><img src="${icon}" alt="">Patchwork${i===0?`<small>${platform==='ios'?'iOS':'Android'}</small>`:''}</header><h1>${p.title}</h1><p class="sub">${p.sub}</p><span class="index">0${i+1}</span><div class="device"><img src="${shot}" alt="${p.screen}"></div></main></body></html>`;
    await page.setContent(html,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('h1,.sub')].some(el=>el.getBoundingClientRect().right>innerWidth-30));
    if(overflow)throw new Error(`Text exceeds margins in ${platform}/${p.id}`);
    await page.screenshot({path:`${output}/${p.id}.png`,type:'png'});
    console.log(`${platform}/${p.id}.png ${width}x${height}`);
  }
  await page.close();
}
await browser.close();
