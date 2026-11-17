// Preserve the actual Android UI actions used in the combined film.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
const vid=process.env.VID || '/tmp/patchwork-video';
const clips=[['plan',8,13],['detail',0,4.5],['priority',0,4.5],['boards',0,4.5],['card',0,5.5],['appearance',0,4.8],['search-clean',0,4.5]];
for(const [name,a,b] of clips){
 execFileSync('ffmpeg',['-v','error','-y','-i',`${vid}/raw/android-${name}.mp4`,'-vf',`trim=start=${a}:end=${b},setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration=2,trim=duration=${b-a},scale=720:-2`,'-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',`${here}/recordings/android-${name}.mp4`]);
 console.log(`Saved android-${name}.mp4`);
}
writeFileSync(`${here}/recordings/sources.android.json`,JSON.stringify({platform:'native Android emulator',device:'Pixel 8, API 35, Android 15',bundle:'codes.tashhif.patchwork.dev',data:'Synthetic CalDAV and Nextcloud Deck fixtures',recordingTool:'T3 agent-device',clips:clips.map(([name,a,b])=>({file:`android-${name}.mp4`,sourceStart:a,sourceEnd:b,fps:30}))},null,2)+'\n');
