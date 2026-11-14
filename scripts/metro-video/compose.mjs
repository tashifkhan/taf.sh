import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const HERE=dirname(fileURLToPath(import.meta.url));
const ROOT=resolve(HERE,'../..');
const VID=process.env.VID||'/tmp/vid';
const commonCss=`
.outro .tilt{position:absolute;left:96px;top:285px;width:1088px}
.outro .tilt .win{width:1088px}
.outro .tilt .view{height:330px}
.ring{border-color:#A65F00;box-shadow:0 0 0 5px #F4AA2640}
.label{background:#854C00;color:#fff}
.intro.landing .title{font-size:65px}
.intro.landing .card3d img{background:var(--bg)}
`;
const vars={
 bg:'#FDFCFF',fg:'#1A1C1E',muted:'#43474E',card:'#F0F4FB',line:'#C4C6D0',shadow:'#2A436130',chrome:'#E9EFF9',urlbg:'#FDFCFF',slab:'#D8E3F8',accent:'#005FAF','accent-fg':'#FFFFFF','accent-soft':'#005FAF14','accent-line':'#005FAF5C',grid:'#005FAF18',dim:'#1A2E442B','pill-bg':'#FFFFFF','pill-fg':'#1A1C1E',fadebg:'#FDFCFF',head:'-apple-system,BlinkMacSystemFont,Arial,sans-serif','head-weight':'700','head-track':'-.035em',body:'-apple-system,BlinkMacSystemFont,Arial,sans-serif',mono:'Menlo,monospace',hand:'-apple-system,BlinkMacSystemFont,Arial,sans-serif','hand-weight':'700',bgimg:'radial-gradient(ellipse at 85% 20%,#D4E3FF55,transparent 60%)'
};
for(const mode of ['web','phone']){
 const phone=mode==='phone';
 const seg=JSON.parse(readFileSync(`${VID}/raw/ncr-metro-${mode}.segments.json`,'utf8'));
 const shot=n=>`${ROOT}/public/reel/ncr-metro-${mode}-${n}.png`;
 const chapter=(n,title,body,points,still)=>({type:'chapter',n,dur:6,title,body,points,still:shot(still),path:''});
 const demo=(key,n,caption,heading,sub,options={})=>{
  if(!seg[key]||seg[key].b<=seg[key].a)throw Error(`Missing recording ${mode} ${key}`);
  let {a,b}=seg[key];const speed=options.speed||Math.max(1,Math.min(1.65,(b-a)/7.5));
  return {type:'demo',n,caption,heading:phone?heading:undefined,sub:phone?sub:undefined,path:options.path||'',src:{raw:seg[key].raw||`${VID}/raw/ncr-metro-${mode}.webm`,a,b,speed,crop:phone?"390:844:0:0":"1440:900:0:0"},hold:Math.max(0.45,4-(b-a)/speed),...options};
 };
 const flow={type:'arch',dur:8,kicker:'Before you leave',title:'Choose stations. <em>Check the whole trip</em>',cols:phone?2:4,rows:phone?4:3,
 nodes:[
 {id:'a',x:0,y:phone?0:1,kind:'01 / choose',label:'Both stations',sub:'Delhi or Noida'},
 {id:'b',x:phone?1:1,y:phone?1:1,kind:'02 / compare',label:'Your route',sub:'Distance or changes',hot:true},
 {id:'c',x:phone?0:2,y:phone?2:1,kind:'03 / check',label:'Fares and times',sub:'Tickets and train service'},
 {id:'d',x:phone?1:3,y:phone?3:1,kind:'04 / leave',label:'Station details',sub:'Gates and lifts'}],edges:[{from:'a',to:'b'},{from:'b',to:'c'},{from:'c',to:'d'}]};
 const stack={type:'arch',dur:8,kicker:'Built for the commute',title:'One app. <em>A shared transit API</em>',cols:phone?2:5,rows:phone?3:3,
 nodes:[{id:'app',x:0,y:phone?0:1,kind:'expo / react native',label:'Web and Android',sub:'One application'},
 {id:'api',x:phone?1:2,y:1,kind:'fastapi',label:'Normalized API',sub:'DMRC and NMRC',hot:true},
 {id:'up',x:phone?1:4,y:phone?2:0,kind:'upstream',label:'Operator services',sub:'Sarthi, DMRC, NMRC'},
 {id:'local',x:0,y:2,kind:phone?'on this browser':'local persistence',label:'Trip history',sub:'Saved on this device'}],edges:[{from:'app',to:'api'},{from:'api',to:'up'},{from:'app',to:'local'}]};
 const scenes=[
 {type:'intro',dur:6,pre:phone?'taf.sh / mobile web walkthrough':'taf.sh / desktop web walkthrough',kicker:'Delhi NCR Metro',title:'Plan your <em>whole commute</em>',tagline:'Delhi Metro and Noida Metro, with the changes in between.',landing:true,shots:[shot('home')],decor:'none'},
 {type:'stats',dur:7,kicker:'The gap between networks',title:'Two operators. <em>One journey</em>',items:[{n:2,label:'networks, Delhi and Noida'},{n:2,label:'Delhi route strategies'},{n:1,label:'plan across both operators'}],foot:'Changing operators means a walk and a separate ticket. The planner shows both.',link:'Real app footage / recorded 14 November 2026'},
 flow,
 chapter(1,'Know the trip <em>before you leave</em>','Pick both stations and compare the plan before you set off.',['Shortest or fewest changes','Fare, platforms and train times'],'journey'),
 demo('choose',1,'Choose AIIMS and Rajiv Chowk','Pick your departure and destination','Search by station name across both networks.'),
 demo('summary',1,'Compare shortest and fewest-change routes','Compare the route strategies','See stops, travel time and line changes together.'),
 demo('fares',1,'Check the fare before you leave','Check the fare for your trip','The results show weekday and weekend prices.'),
 demo('route',1,'Follow the platform and station sequence','Know which train to board','Read the platform, direction and ordered stops.'),
 demo('timings',1,'Check the first and last train','Check the service window','First and last trains appear with the plan.'),
 chapter(2,'Cross to Aqua <em>with the walk included</em>','Continue to Noida Sector 137 without planning the operator change yourself.',['Sector 52 to Sector 51 walk','Separate Delhi and Noida tickets'],'cross'),
 demo('cross-choose',2,'Change destination to Noida Sector 137','One search covers both networks','Choose an Aqua Line station in the same planner.'),
 demo('cross-fare',2,'See the fare for each operator','Two operators need two tickets','The result splits Delhi Metro and Noida Metro fares.'),
 demo('transfer',2,'The Sector 52 to Sector 51 walk is included','See the gap between networks','The route includes the transfer walk before the Aqua Line.'),
 chapter(3,'Find the <em>right exit</em>','Open a station before you arrive and check the details that matter.',['Gate destinations and lifts','Line stations in travel order'],'gates'),
 demo('search',3,'Find Rajiv Chowk by name or station code','Find the station you need','Results identify the station, code and operator.'),
 demo('gates',3,'Read where each station gate leads','Choose the right gate','Read gate destinations before leaving the platform.'),
 demo('lifts',3,'Check lift locations and station facilities','Check the accessible route','Station details list available lifts and facilities.'),
 demo('lines',3,'Browse the line and its stations','See how the line fits together','Explore termini and stations in their travel order.'),
 chapter(4,'Keep the network <em>in view</em>','Use the map, read service notices and choose a comfortable theme.',['Zoom the network map','Dated notices and light or dark mode'],'map'),
 demo('map',4,'Zoom the network map','Read the whole network','Zoom in to inspect stations and line connections.'),
 demo('alerts',4,'Read dated passenger notices','Check notices before you travel','Published dates keep service changes in context.'),
 demo('appearance',4,'Choose light or dark mode','Choose a comfortable theme','Switch between light and dark in Appearance settings.'),
 stack,
 {type:'outro',dur:7,kicker:'Delhi NCR Metro',title:'Your next ride. <em>Planned</em>',url:'ncr-metro.tashif.codes',still:shot('home'),stack:['Web app','Android app','Open REST API'],sign:'<b>built by taf.sh</b> · Delhi and Noida'}
 ];
 const comp={name:`ncr-metro-${mode}`,canvas:phone?{width:720,height:1280}:{width:1280,height:800},fps:30,crf:phone?24:22,preset:phone?'medium':'slow',out:`${ROOT}/public/reel/ncr-metro-${mode}-demo.mp4`,poster:`${ROOT}/public/reel/ncr-metro-${mode}-poster.jpg`,posterAt:3.8,product:{name:'Delhi NCR Metro',host:'ncr-metro.tashif.codes'},theme:{fonts:'',vars,css:commonCss+(phone?readFileSync(`${HERE}/portrait.css`,'utf8'):'')},music:{bpm:96,chords:[[50,57,62],[55,59,62],[52,55,59],[57,61,64]]},cursor:false,scenes};
 mkdirSync(`${VID}/comp`,{recursive:true});
 writeFileSync(`${VID}/comp/ncr-metro-${mode}.json`,JSON.stringify(comp,null,2));
 writeFileSync(`${HERE}/ncr-metro-${mode}.json`,JSON.stringify(comp,null,2));
 console.log(`Composed ${mode}: ${scenes.length} scenes`);
}
