import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const HERE=dirname(fileURLToPath(import.meta.url));
const ROOT=resolve(HERE,'../..');
const VID=process.env.VID||'/tmp/vid';
const commonCss=`
.gen .outtext{font:16px/1.55 var(--mono);white-space:pre}
.intro .chip{margin-top:14px}
.intro .chip + .chip{margin-top:10px}
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

const captures=JSON.parse(readFileSync(`${VID}/v180/normalized.json`,'utf8'));
const nativeSegments=JSON.parse(readFileSync(`${VID}/v180/android.json`,'utf8'));
for(const mode of ['web','phone']){
 const phone=mode==='phone';
 const shot=n=>`${ROOT}/public/reel/ncr-metro-${mode}-${n}.png`;
 const androidShot=n=>`${ROOT}/public/reel/ncr-metro-android-${n}.png`;
 const windows={
  'phone-route':{a:1.2,b:6},
  'phone-fares':{a:1.3,b:6},
  'phone-cross':{a:5,b:7},
 };
 const demo=(key,n,heading,sub)=>{
  const src=captures[mode+'-'+key];if(!src)throw Error(`Missing current capture ${mode}-${key}`);
  const win=windows[mode+'-'+key]||{a:0,b:6};
  return {type:'demo',n,caption:heading,heading:phone?heading:undefined,sub:phone?sub:undefined,src:{raw:src.raw,a:win.a,b:win.b,speed:1},hold:1};
 };
 const native=(key,n,heading,sub,points)=>({type:'demo',device:'android',n,heading,sub,points,caption:heading,src:nativeSegments[key],hold:1});
 const chapter=(n,title,body,points,still)=>({type:'chapter',n,dur:6,title,body,points,still:shot(still),path:''});
 const apiStill=`${ROOT}/public/reel/ncr-metro-api-docs.png`;
 const scenes=[
 {type:'intro',dur:6,pre:'taf.sh / Delhi NCR Metro',kicker:'Delhi NCR Metro',title:'One API. <em>Both metros.</em>',tagline:'Delhi Metro and Noida Metro. Same contract, two hosts. No key.',decor:'none',hosts:['ncr-metro.tashif.codes/api','dmrc-rest-api.vercel.app/api']},
 {type:'demo',path:'/api',caption:'ncr-metro.tashif.codes/api',src:{raw:`${VID}/v180/api-site.mp4`,a:0,b:3.6,speed:1},hold:0.3},
 {type:'demo',host:'dmrc-rest-api.vercel.app',path:'/api',caption:'dmrc-rest-api.vercel.app/api',src:{raw:`${VID}/v180/api-vercel.mp4`,a:0,b:3.6,speed:1},hold:0.3},
 {type:'stats',dur:6.5,kicker:'Both hosts',title:'No key. <em>One contract.</em>',items:[{text:'v1',label:'DMRC and NMRC, same schema'},{text:'v2',label:'planner, Sarthi then fallback'},{text:'MIT',label:'app and API, no auth'}],foot:'Lines, stations, fares, routes, first and last trains, maps and notices.',links:['ncr-metro.tashif.codes/api','dmrc-rest-api.vercel.app/api']},
 chapter(1,'Call it. <em>Get the journey.</em>','The app is one client. The endpoints are public.',['GET /api/v2/journeys/plan','Sarthi first. Legacy planner if that fails.'], phone?'journey':'home'),
 {type:'gen',n:1,dur:9,caption:'AIIMS to Karkarduma Court',inputTitle:'Request',outputTitle:'Response',button:'Send',fields:[['GET','/api/v2/journeys/plan'],['from','AIIMS'],['to','KKDC'],['strategy','least-distance']],output:'source   sarthi\n44 min · 18 stops · 18.7 km\nfare     ₹43 weekday · ₹33 Sunday\nchanges  Rajiv Chowk, Karkarduma\n\nThe same call plans Noida. Tickets stay separate.'},
 {type:'demo',n:1,path:'/api',caption:'Docs and a live playground',src:{raw:`${VID}/raw/ncr-metro-api.webm`,a:3,b:16,speed:1.35},hold:0.4},
 {type:'arch',dur:8,kicker:'Under the hood',title:'Two operators. <em>One response.</em>',cols:2,rows:3,nodes:[
  {id:'app',x:0,y:0,kind:'Client',label:'The app',sub:'Web and Android'},
  {id:'api',x:1,y:0,kind:'Hosted',label:'The API',sub:'REST, no key',hot:true},
  {id:'v1',x:0,y:2,kind:'v1',label:'DMRC and NMRC',sub:'Same schemas'},
  {id:'v2',x:1,y:2,kind:'v2',label:'The planner',sub:'Sarthi, then fallback',hot:true},
 ],edges:[{from:'app',to:'api',label:'calls'},{from:'api',to:'v1',label:'lines, fares, stations'},{from:'api',to:'v2',label:'plan'}]},
 chapter(2,'Pick the ride. <em>See the fare.</em>','Shortest and fewer changes are two answers for one trip.',['AIIMS to Karkarduma Court','₹43 weekday, ₹33 Sunday'],'journey'),
 native('shortest',2,'44 minutes. Two changes.','Yellow, Blue, then Pink. The map and the stop list come from the planner.',['Change at Rajiv Chowk','Change again at Karkarduma']),
 native('fewest',2,'52 minutes. One change.','Same trip, minimum interchange. One change at Dilli Haat INA.',['Yellow to Pink','Longer ride, one interchange']),
 demo('fares',2,'Weekday and Sunday fare','The ticket card shows both fares, plus the first and last train.'),
 chapter(3,'Cross operators. <em>Keep both tickets.</em>','AIIMS to Noida Sector 137 stays one plan. The tickets do not merge.',['About 300 m on foot, Sector 52 to 51','Delhi fare and Noida fare, listed apart'],'cross'),
 demo('cross',3,'One plan, both networks','The map draws the Delhi leg and the Aqua leg together.'),
 demo('transfer',3,'The walk is a leg','Sector 52 to Sector 51, about 300 metres, before Aqua.'),
 demo('split-fare',3,'Two fares, not one','Delhi Metro and Noida Metro do not share a ticket.'),
 chapter(4,'Read the station <em>before you arrive</em>','Gates, lifts and the network map are in the same response as the route.',['Where the gate comes out','The line, on a map you can move'],'gates'),
 demo('gates',4,'Where the gate comes out','Rajiv Chowk lists each gate, and which exits are step-free.'),
 demo('map',4,'The whole network','Pinch and pan the map. Interchanges stay on the line.'),
 chapter(5,'Keep the plan <em>when the signal drops</em>','A journey you already opened comes back offline, with the time it was saved.',['Airplane mode, app restarted','The fare is marked as possibly stale'],'journey'),
 native('offline',5,'Saved, then opened offline.','The AIIMS to Karkarduma Court plan is still there. The app says the fare may have changed.',['Saved time stays on screen','Live search does not, until you are back online']),
 {type:'outro',dur:6.5,kicker:'Open source',title:'Build on it. <em>Or just ride.</em>',body:'The API is public. The app is the client. Both are MIT.',url:'ncr-metro.tashif.codes/api',nativeShots:[{src:apiStill,label:'THE API'},{src:androidShot('shortest'),label:'THE APP'}],stack:['REST, no key','DMRC + NMRC','Web and Android'],sign:'<b>built by taf.sh</b> · github.com/tashifkhan/delhi-metro'}
 ];
 const css=commonCss+readFileSync(`${HERE}/android.css`,'utf8')+(phone?readFileSync(`${HERE}/portrait.css`,'utf8'):'');
 const comp={name:`ncr-metro-${mode}`,canvas:phone?{width:720,height:1280}:{width:1280,height:800},fps:30,crf:24,preset:'medium',out:`${ROOT}/public/reel/ncr-metro-${mode}-demo.mp4`,poster:`${ROOT}/public/reel/ncr-metro-${mode}-poster.jpg`,posterAt:3.8,product:{name:'Delhi NCR Metro',host:'ncr-metro.tashif.codes'},theme:{fonts:'',vars,css},music:{bpm:96,chords:[[50,57,62],[55,59,62],[52,55,59],[57,61,64]]},cursor:false,scenes};
 mkdirSync(`${VID}/comp`,{recursive:true});
 writeFileSync(`${VID}/comp/ncr-metro-${mode}.json`,JSON.stringify(comp,null,2));
 writeFileSync(`${HERE}/ncr-metro-${mode}.json`,JSON.stringify(comp,null,2));
 console.log(`Composed ${mode}: ${scenes.length} scenes`);
}
