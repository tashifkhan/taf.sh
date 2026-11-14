// Keep actual native Jira interactions, removing pauses between recording commands.
import {execFileSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../..');
const vid=process.env.VID || '/tmp/patchwork-video';
const clips=[
 ['ios-jira-filter',[[41.5,49]]],
 ['android-jira-filter',[[32.5,36],[46,48.16]]],
 ['ios-jira-sprint',[[0,4.5]]],
 ['ios-jira-drag',[[0,4.6]]],
 ['android-jira-drag',[[0,9.3]]]
];
for(const [name,windows] of clips){
 let filter='';
 if(windows.length>1)filter=`[0:v]split=${windows.length}${windows.map((_,i)=>`[s${i}]`).join('')};`;
 filter+=windows.map(([a,b],i)=>`[${windows.length>1?`s${i}`:'0:v'}]trim=start=${a}:end=${b},setpts=PTS-STARTPTS,fps=30,tpad=stop_mode=clone:stop_duration=1,trim=duration=${b-a}[v${i}]`).join(';');
 filter+=windows.length>1?`;${windows.map((_,i)=>`[v${i}]`).join('')}concat=n=${windows.length}:v=1:a=0,scale=720:-2[out]`:';[v0]scale=720:-2[out]';
 execFileSync('ffmpeg',['-v','error','-y','-i',`${vid}/raw/${name}.mp4`,'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',`${here}/recordings/${name}.mp4`]);
 console.log(`Saved ${name}`);
}
for(const [p,t] of [['ios',2.8],['android',6.5]])execFileSync('ffmpeg',['-v','error','-y','-ss',String(t),'-i',`${vid}/raw/${p}-jira-drag.mp4`,'-frames:v','1',`${root}/public/reel/patchwork-${p}-jira-drag.png`]);
writeFileSync(`${here}/recordings/sources.jira.json`,JSON.stringify({recordingTool:'T3 agent-device',app:'codes.tashhif.patchwork.dev',data:'Synthetic Jira API in jira-fixtures.py. User references guide populated boards, scopes, sprint groups and drag gestures.',clips:clips.map(([name,windows])=>({file:`${name}.mp4`,sourceWindows:windows,fps:30})),screenshots:'Native captures on each platform; drag artwork uses an actual frame of the native drag gesture.'},null,2)+'\n');
