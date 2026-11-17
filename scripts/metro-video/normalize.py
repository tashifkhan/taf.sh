import json,subprocess,pathlib,hashlib,os
root=pathlib.Path(os.environ.get('VID','/tmp/vid'))/'v180'; root.mkdir(parents=True,exist_ok=True)
caps=json.loads(pathlib.Path(__file__).with_name('capture-sources.json').read_text()); out={}
for key,v in caps.items():
 dest=root/(key+'-'+hashlib.sha1(v['raw'].encode()).hexdigest()[:8]+'-cfr.mp4')
 if not dest.exists():
  width=780 if key.startswith('phone-') else 1440
  subprocess.run(['ffmpeg','-v','error','-y','-i',v['raw'],'-vf',f'scale={width}:-2,fps=30,tpad=stop_mode=clone:stop_duration=8','-t','7','-an','-c:v','libx264','-preset','veryfast','-crf','18',str(dest)],check=True)
 out[key]={**v,'raw':str(dest),'a':0,'b':6,'speed':1}
(root/'normalized.json').write_text(json.dumps(out,indent=2))
print('Normalized',len(out),'browser clips')

native={}
for key in ['shortest','fewest','offline','colors','controls','animations']:
 raw=root/('android-'+key+'.mp4'); dest=root/('android-'+key+'-cfr.mp4')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-vf','fps=30,tpad=stop_mode=clone:stop_duration=8','-t','12','-an','-c:v','libx264','-preset','veryfast','-crf','18',str(dest)],check=True)
 native[key]={'raw':str(dest),'a':0,'b':8,'speed':1}
(root/'android.json').write_text(json.dumps(native,indent=2))
print('Normalized six Android clips')
