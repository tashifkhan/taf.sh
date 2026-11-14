"""Export standalone platform cuts from the verified full walkthrough."""
from pathlib import Path
import json
import os
import subprocess

root = Path(__file__).resolve().parent
out = root.parents[1] / 'public/reel'
work = Path(os.environ.get('VID', '/tmp/paisa-video'))
composition = json.loads((root / 'composition.json').read_text())
meta = json.loads((work / 'frames/paisa/meta.json').read_text())
source = out / 'paisa-demo.mp4'

for platform in ['foldable', 'web']:
    indices = [i for i, scene in enumerate(composition['scenes'])
               if scene['type'] == 'demo' and
               (scene.get('layout') == 'foldable' if platform == 'foldable'
                else not scene.get('layout'))]
    groups = []
    for i in indices:
        if groups and i == groups[-1][-1] + 1:
            groups[-1].append(i)
        else:
            groups.append([i])
    windows = [(meta['scenes'][g[0]]['start'] + .8,
                meta['scenes'][g[-1] + 1]['start'] - .2)
               for g in groups]
    filters = []
    for i, (start, end) in enumerate(windows):
        filters += [f'[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}]',
                    f'[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{i}]']
    duration = sum(b-a for a,b in windows)
    if len(windows) == 1:
        video, audio = 'v0', 'a0'
    else:
        assert len(windows) == 2
        crossfade = .35
        offset = windows[0][1] - windows[0][0] - crossfade
        filters += [f'[v0][v1]xfade=transition=fade:duration={crossfade}:offset={offset}[joinedv]',
                    f'[a0][a1]acrossfade=d={crossfade}[joineda]']
        video, audio = 'joinedv', 'joineda'
        duration -= crossfade
    filters += [f'[{video}]fade=t=in:d=0.25,fade=t=out:st={duration-.35}:d=0.35,format=yuv420p[v]',
                f'[{audio}]afade=t=in:d=0.25,afade=t=out:st={duration-.35}:d=0.35[a]']
    target = out / f'paisa-{platform}-demo.mp4'
    subprocess.run(['ffmpeg', '-v','error','-y','-filter_complex_threads','1',
                    '-i',str(source),'-filter_complex',';'.join(filters),
                    '-map','[v]','-map','[a]','-c:v','libx264','-threads','4',
                    '-preset','medium','-crf','20','-c:a','aac','-b:a','160k',
                    '-movflags','+faststart',str(target)],check=True)
    subprocess.run(['ffmpeg','-v','error','-y','-ss','3','-i',str(target),
                    '-frames:v','1','-vf','scale=1280:-2','-q:v','3',
                    str(out / f'paisa-{platform}-poster.jpg')],check=True)
    print(f'{platform}: {duration:.2f}s, {target}', flush=True)
