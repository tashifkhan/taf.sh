"""Keep the detailed web cut, with product chrome and unobstructed captures."""
from pathlib import Path
import copy,json,subprocess
root=Path(__file__).resolve().parent
comp=json.loads((root/'composition.json').read_text())
old=json.loads(subprocess.check_output(['git','show','6139833:scripts/paisa-video/composition.json'],cwd=root))
web=copy.deepcopy(comp)
web.update(name='paisa-web',out=str(root.parents[1]/'public/reel/paisa-web-demo.mp4'),poster=str(root.parents[1]/'public/reel/paisa-web-poster.jpg'),posterAt=3)
web['scenes']=[]
for s in old['scenes']:
 if s['type']=='demo' and not s.get('layout'):
  s['layout']='desktop';s['path']='';s['highlights']=[]
  s['src']['raw']=str(root/'raw'/Path(s['src']['raw']).name)
  s['src']['speed']=1.25;s['hold']=1
  web['scenes'].append(s)
(root/'web-composition.json').write_text(json.dumps(web,indent=2)+'\n')
