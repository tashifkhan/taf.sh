import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const vid=process.env.VID || '/tmp/patchwork-video';
const font=`data:font/woff2;base64,${readFileSync(`${root}/node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2`).toString('base64')}`;
const shot=(name)=>`${root}/public/reel/patchwork-ios-${name}.png`;
const raw=(name,a,b)=>({raw:`${here}/recordings/ios-${name}.mp4`,a:0,b:b-a,speed:1});
const phone=(n,title,body,points,other={})=>({type:'phone',n,dur:9,platform:'Native iOS',title,body,points,note:'Native iOS build · Sample tasks and Deck data',...other});
const comp={
  name:'patchwork-ios-preview',out:`${root}/public/reel/patchwork-ios-preview.mp4`,
  poster:`${root}/public/reel/patchwork-ios-preview-poster.jpg`,posterAt:3.6,fps:30,cursor:false,
  product:{name:'Patchwork',host:'github.com/tashifkhan/Patchwork'},
  theme:{vars:{bg:'#FAF1E6',fg:'#2C202D',muted:'#73616F',card:'#F4E7DF',line:'#DFCCC5',chrome:'#F4E7DF',urlbg:'#FAF1E6',slab:'#E8DCD5',accent:'#B84942','accent-fg':'#FFF9F3','accent-soft':'#B8494210','accent-line':'#B8494240',shadow:'#2C202D33',grid:'#B8494210',dim:'#20151C55','pill-bg':'#FAF1E6','pill-fg':'#2C202D',fadebg:'#FAF1E6',head:'Archivo, sans-serif','head-weight':'650','head-track':'-.035em',body:'Archivo, sans-serif',mono:'Archivo, sans-serif',hand:'Archivo, sans-serif','hand-weight':'650',bgimg:'none'},css:`@font-face{font-family:Archivo;src:url('${font}');font-weight:100 900}.hud .hr em{font-size:10px}.native-phone .kicker{font-size:12px;letter-spacing:.1em}.native-title{font-weight:650}.arch .title{font-size:51px}.arch .atitle{font-size:51px}`},
  music:{bpm:94,chords:[[57,60,64],[53,57,60],[60,64,67],[55,59,62]]},
  scenes:[
    phone(null,'Your work.<br>One <em>app.</em>','Tasks and boards from the tools you already use, brought together on your phone.',['CalDAV and Nextcloud Deck','GitHub issues and Jira boards'],{dur:8,kicker:'Patchwork · iOS preview',still:shot('tasks'),note:'Native iOS footage · Android capture pending'}),
    {type:'arch',dur:10,kicker:'How it connects',title:'Keep your tools. Bring the work together.',cols:5,rows:3,nodes:[
      {id:'caldav',x:0,y:0,kind:'Tasks',label:'CalDAV',sub:'Your lists and due dates'},
      {id:'deck',x:0,y:2,kind:'Boards',label:'Nextcloud Deck',sub:'Columns and cards'},
      {id:'github',x:4,y:0,kind:'Issues',label:'GitHub',sub:'Across your repositories'},
      {id:'jira',x:4,y:2,kind:'Boards',label:'Jira',sub:'Sprints and backlog'},
      {id:'app',x:2,y:1,kind:'Native app',label:'Patchwork',sub:'Plan, open, edit',hot:true}],edges:[{from:'caldav',to:'app'},{from:'deck',to:'app'},{from:'github',to:'app'},{from:'jira',to:'app'}]},
    phone(1,'Start with <em>today.</em>','See what is due today, tomorrow and later without opening each list.',['Due-date groups','Personal and work lists together'],{kicker:'01 · Plan your day',dur:9,still:shot('tasks')}),
    phone(1,'Focus on one <em>tag.</em>','Tap a tag to narrow the list, then return to everything when you need the full picture.',['Filter without leaving the list','Keep due dates in view'],{src:raw('plan',0,2.3),hold:6.7}),
    phone(1,'Find the work<br>you <em>remember.</em>','Search tasks and Deck cards in the same place.',['Task notes appear in results','Filter by result type'],{src:raw('search-clean',0,7.8),hold:1.2}),
    phone(2,'Keep the details<br><em>with the task.</em>','Open a task inline to read its notes and checklist while the rest of the day stays in view.',['Markdown notes','Checklists and tags'],{kicker:'02 · Work through the details',src:raw('detail',29,38),hold:1}),
    phone(2,'Set what matters<br><em>next.</em>','The full editor keeps the title, notes, due date and priority together.',['Change priority in place','Edits return to the source'],{src:raw('edit',0,6.7),hold:3.3}),
    phone(3,'Your board.<br>Your <em>phone.</em>','Open a Nextcloud Deck board and see its columns and cards.',['Switch between boards','Open a card from its column'],{kicker:'03 · Follow the board',src:raw('boards',0,7.8),hold:2.2}),
    phone(3,'Open the card.<br>Keep the <em>context.</em>','Read its description and checklist, then use the column and due-date controls.',['Markdown card descriptions','Column and due-date controls'],{src:raw('card',0,7.8),hold:2.2}),
    phone(4,'Connect the tools<br>you <em>use.</em>','Add a CalDAV account, then configure the integrations your workflow needs.',['Multiple account support','GitHub, Jira and AI settings'],{kicker:'04 · Make it yours',dur:8,still:shot('settings'),note:'Native settings · GitHub and Jira are unconnected in this recording'}),
    phone(4,'Choose your<br><em>AI.</em>','Configure your own providers and the order of models to try. AI imports become drafts for review.',['Bring your own key','Review before saving tasks'],{src:raw('ai-settings',0,5.1),hold:3.9,note:'Native provider configuration · No generated result shown'}),
    phone(4,'Make it feel<br><em>like yours.</em>','Choose light, dark or system appearance, then pick an accent palette.',['Theme and accent options','Contrast and OLED controls'],{src:raw('appearance',0,4.5),hold:4.5}),
    {type:'arch',dur:9,kicker:'On your device',title:'Your credentials stay on your phone.',cols:5,rows:1,nodes:[
      {id:'secure',x:0,y:0,kind:'Credentials',label:'Secure storage',sub:'Saved on the device'},
      {id:'native',x:2,y:0,kind:'App',label:'Patchwork',sub:'Native iOS and Android',hot:true},
      {id:'server',x:4,y:0,kind:'Your sources',label:'Your servers',sub:'Direct native requests'}],edges:[{from:'secure',to:'native'},{from:'native',to:'server'}]},
    phone(null,'A little less<br><em>switching apps.</em>','Patchwork for iOS and Android. CalDAV tasks, Deck boards, GitHub issues and Jira.',['Source and build instructions on GitHub'],{dur:8,kicker:'Patchwork',still:shot('tasks'),note:'github.com/tashifkhan/Patchwork · iOS preview · Android capture pending'})
  ]
};
// Titles use the engine's word splitter, so line breaks are whitespace, not HTML.
for(const scene of comp.scenes)if(scene.title)scene.title=scene.title.replaceAll('<br>',' ');
mkdirSync(`${vid}/comp`,{recursive:true});
writeFileSync(`${vid}/comp/patchwork-ios-preview.json`,JSON.stringify(comp,null,2));
writeFileSync(`${here}/composition.ios-preview.json`,JSON.stringify(comp,null,2));
console.log(`${vid}/comp/patchwork-ios-preview.json`);
