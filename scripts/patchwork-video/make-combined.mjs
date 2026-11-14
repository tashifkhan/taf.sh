import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..');
const vid=process.env.VID || '/tmp/patchwork-video';
const base=JSON.parse(readFileSync(`${here}/composition.ios-preview.json`));
const shot=(p,n)=>`${root}/public/reel/patchwork-${p}-${n}.png`;
const src=(p,n,d)=>({raw:`${here}/recordings/${p}-${n}.mp4`,a:0,b:d,speed:1});
const pair=(a='tasks',b='tasks')=>({dual:true,phones:[{platform:'Native iOS',still:shot('ios',a)},{platform:'Native Android',still:shot('android',b)}]});
const phone=(n,p,title,body,points,extra={})=>({type:'phone',n,platform:`Native ${p==='ios'?'iOS':'Android'}`,dur:8,title,body,points,showPlatform:false,note:'Sample tasks, Deck cards and Jira issues',kicker:`0${n} · ${['','Decide what needs doing','Turn a task into a next step','Keep the project moving','Choose how you work'][n]}`,...extra});
const comp={...base,name:'patchwork-native-demo',out:`${root}/public/reel/patchwork-native-demo.mp4`,poster:`${root}/public/reel/patchwork-native-poster.jpg`,posterAt:4,
scenes:[
phone(null,'ios','The work is scattered. Pick your <em>next step.</em>','Patchwork brings your tasks and project boards onto your phone.',['CalDAV, Nextcloud Deck and Jira boards','Native apps for iOS and Android'],{...pair(),dur:9,showPlatform:true,kicker:'Patchwork · iOS + Android'}),
phone(1,'ios','Start with <em>today.</em>','Personal errands and release work share one view, grouped by due date.',['See today, tomorrow and upcoming tasks','Keep each task connected to its list'],{still:shot('ios','tasks'),dur:8}),
phone(1,'android','Focus on the <em>release.</em>','The day has nine open tasks. Filter the release tag to find the two that belong together.',['Plan the Patchwork release','Publish release notes'],{src:src('android','plan',5),hold:3}),
phone(1,'android','Remember a word. Find the <em>work.</em>','Search release across tasks and Deck cards, then narrow the results to cards.',['Task notes appear in the results','Switch result types without a new search'],{...pair('search','search'),activePhone:1,src:src('android','search-clean',4.5),hold:3.5}),
phone(2,'ios','Read before you <em>act.</em>','Open the release task to see what still needs checking before the builds ship.',['Release checks in the same note','The task list stays behind the detail view'],{src:src('ios','detail',9),hold:0}),
phone(2,'android','The same task. Every <em>detail.</em>','Open the release notes, then check the deadline, tags and source list before you act.',['Markdown and checklist together','Tags, due date and source list in view'],{src:src('android','detail',4.5),hold:2.5}),
phone(2,'android','Decide what comes <em>next.</em>','Change the release task from High to Medium priority in the full task editor.',['Update priority in the task editor','Deadline and reminder controls alongside'],{src:src('android','priority',4.5),hold:3.5}),
phone(3,'ios','Your project. On <em>either phone.</em>','Open a populated Jira board with sprint groups, issue keys, priorities and assignees.',['Active sprints and backlog together','Issue details stay connected to the board'],{...pair('jira-board','jira-board'),dur:8}),
phone(3,'android','Bring your work into <em>focus.</em>','Switch from all issues to work assigned to you or reported by you.',['Choose whose issues load','Narrow by sprint, type or priority'],{...pair('jira-filter','jira-filter'),activePhone:1,src:src('android','jira-filter',5.67),hold:2.33}),
phone(3,'ios','Find your place in <em>the project.</em>','Choose an issue scope. The board updates to show the work assigned to you or reported by you.',['Assignee and reporter scopes','Sprint groups remain visible'],{src:src('ios','jira-filter',7.5),hold:.5}),
phone(3,'ios','One sprint. A clearer <em>next step.</em>','Select the active sprint to focus on the work scheduled now.',['Switch with the sprint chips','Return to All for the full board'],{src:src('ios','jira-sprint',4.5),hold:2.5}),
phone(3,'ios','Pick up a card. Place it <em>where it belongs.</em>','Long press and drag the setup-guide card to a new position on the board.',['The lifted card stays under your finger','A line marks the drop position'],{src:src('ios','jira-drag',4.6),hold:3.4}),
phone(3,'android','Move the work. Keep <em>the context.</em>','Drag a card while its issue key, priority and assignee remain in view.',['Issue key, priority and assignee stay visible','A drop marker guides placement'],{src:{...src('android','jira-drag',9.3),speed:1.4},hold:1.36}),
phone(4,'ios','Make room for <em>your way.</em>','Choose light, dark or system appearance, then pick an accent palette.',['Light, dark or system appearance','Accent palettes and contrast options'],{...pair('appearance','appearance'),activePhone:0,src:src('ios','appearance',4.5),hold:3.5,note:''}),
phone(4,'android','Light or dark. Still <em>Patchwork.</em>','Switch to light mode, then tune the accent and contrast to suit you.',['Theme and accent are your choice','OLED and contrast options in settings'],{...pair('appearance','appearance'),activePhone:1,src:src('android','appearance',4.8),hold:3.2,note:''}),
phone(4,'android','Choose your <em>AI provider.</em>','Configure providers and models in the app. Bring your own key and review imported task drafts.',['Provider and model configuration','No generated result shown in this film'],{...pair('ai','ai'),dur:8,note:'No API key values shown'}),
phone(null,'ios','Pick up the <em>next task.</em>','Your task lists and project boards, on your phone.',['Source and build instructions on GitHub'],{...pair(),dur:9,kicker:'Patchwork',note:'github.com/tashifkhan/Patchwork · Sample data in task and board scenes'})
]};
mkdirSync(`${vid}/comp`,{recursive:true});
writeFileSync(`${vid}/comp/${comp.name}.json`,JSON.stringify(comp,null,2));
writeFileSync(`${here}/composition.combined.json`,JSON.stringify(comp,null,2));
let t=0;console.log(comp.scenes.map(s=>{let x=t+3;t+=s.src?s.src.b/(s.src.speed||1)+(s.hold??.5):s.dur;return x}).join(','));console.log(`Scene holds total ${t}s before crossfades. See render metadata for final duration.`);
