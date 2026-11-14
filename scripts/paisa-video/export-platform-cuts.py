"""Export folded and tablet chapters from the completed main walkthrough."""
from pathlib import Path
import json,os,subprocess
root=Path(__file__).resolve().parent
out=root.parents[1]/'public/reel'
work=Path(os.environ.get('VID','/tmp/paisa-video'))
comp=json.loads((root/'composition.json').read_text())
meta=json.loads((work/'frames/paisa/meta.json').read_text())
for platform in ['foldable','tablet']:
 ids=[i for i,s in enumerate(comp['scenes']) if s.get('layout')==platform]
 start=meta['scenes'][ids[0]]['start']+.8
 end=meta['scenes'][ids[-1]]['end']-.8
 duration=end-start
 target=out/f'paisa-{platform}-demo.mp4'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(out/'paisa-demo.mp4'),'-t',str(duration),'-vf',f'fade=t=in:d=0.2,fade=t=out:st={duration-.25}:d=0.25','-af',f'afade=t=in:d=0.2,afade=t=out:st={duration-.25}:d=0.25','-c:v','libx264','-threads','4','-preset','medium','-crf','20','-c:a','aac','-b:a','160k','-movflags','+faststart',str(target)],check=True)
 subprocess.run(['ffmpeg','-v','error','-y','-ss','2','-i',str(target),'-frames:v','1','-vf','scale=1280:-2','-q:v','3',str(out/f'paisa-{platform}-poster.jpg')],check=True)
 print(platform,round(duration,2),'seconds',flush=True)
