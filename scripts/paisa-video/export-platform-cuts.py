"""Build foldable and tablet cuts with the shared Paisa opening card."""
from pathlib import Path
import copy,json,os,subprocess,sys

root=Path(__file__).resolve().parent
out=root.parents[1]/'public/reel'
comp=json.loads((root/'composition.json').read_text())
for platform in ['foldable','tablet']:
 cut=copy.deepcopy(comp)
 cut.update(name=f'paisa-{platform}',out=str(out/f'paisa-{platform}-demo.mp4'),poster=str(out/f'paisa-{platform}-poster.jpg'),posterAt=2.8)
 cut['scenes']=[copy.deepcopy(comp['scenes'][0])]+[copy.deepcopy(s) for s in comp['scenes'] if s.get('layout')==platform]
 path=root/f'{platform}-composition.json'
 path.write_text(json.dumps(cut,indent=2)+'\n')
 if '--compositions-only' not in sys.argv:
  subprocess.run(['node',str(root/'engine/render.mjs'),str(path)],env=os.environ.copy(),check=True)
