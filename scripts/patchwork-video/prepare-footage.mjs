// Retain only the native clips used in the composition, at a constant 30 fps.
// Run once after recording, before make-comp.mjs.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const vid=process.env.VID || '/tmp/patchwork-video';
const clips=[['plan',0,2.3],['search-clean',0,7.8],['detail',29,38],['edit',0,6.7],['boards',0,7.8],['card',0,7.8],['ai-settings',0,5.1],['appearance',0,4.5]];
mkdirSync(`${here}/recordings`,{recursive:true});
for(const [name,a,b] of clips){
  execFileSync('ffmpeg',['-v','error','-y','-ss',String(a),'-i',`${vid}/raw/ios-${name}.mp4`,'-vf',`setpts=PTS-STARTPTS,fps=30,trim=duration=${b-a},scale=720:-2`,'-frames:v',String(Math.ceil((b-a)*30)),'-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',`${here}/recordings/ios-${name}.mp4`],{stdio:'inherit'});
  console.log(`Saved ios-${name}.mp4`);
}
writeFileSync(`${here}/recordings/sources.json`,JSON.stringify({platform:'native iOS simulator',device:'iPhone 18 Pro, iOS 27.0',bundle:'codes.tashhif.patchwork.dev',data:'Synthetic CalDAV and Deck fixtures from demo-server.py',recordingTool:'T3 agent-device',clips:clips.map(([name,a,b])=>({file:`ios-${name}.mp4`,source:`ios-${name}.mp4`,sourceStart:a,sourceEnd:b,fps:30}))},null,2)+'\n');
