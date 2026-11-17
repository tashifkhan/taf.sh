// Keep the full PNG cards for export and smaller WebP copies for the gallery.
import sharp from 'sharp';
import {readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const DIR=resolve(ROOT,'public/reel/ncr-metro-screenshots');
const names=readdirSync(DIR).filter(n=>/^(phone|web)-\d\d\.png$/.test(n)).sort();
for(const name of names.filter(n=>n.startsWith('web-'))){
 await sharp(`${DIR}/${name}`).webp({quality:88}).toFile(`${DIR}/${name.replace('.png','.webp')}`);
}
const layers=[];
for(const [i,name] of names.filter(n=>n.startsWith('phone-')).entries()){
 layers.push({input:await sharp(`${DIR}/${name}`).resize(250,542).toBuffer(),left:i%4*250,top:Math.floor(i/4)*542});
}
for(const [i,name] of names.filter(n=>n.startsWith('web-')).entries()){
 layers.push({input:await sharp(`${DIR}/${name}`).resize(500,313).toBuffer(),left:i%2*500,top:1100+Math.floor(i/2)*313});
}
await sharp({create:{width:1000,height:2039,channels:3,background:'#e5e7eb'}}).composite(layers).jpeg({quality:91}).toFile(`${DIR}/preview.jpg`);
writeFileSync(`${DIR}/README.txt`, `Delhi NCR Metro product screenshots\n\nEight portrait PNGs, 1290 x 2796.\nSix landscape PNGs, 1920 x 1200.\nThe android folder contains original native captures.\nThe api folder contains hosted documentation screenshots.\n\nActual screens captured from https://ncr-metro.tashif.codes.\nCards phone-08 and web-06 show the native Android app, including the page animation selector in version 1.8.0. Other phone views show mobile web.\nThese are App Store-style marketing cards, not a claim of an iOS release.\nOriginal layouts use Amy Food Journal as a visual reference.\nNo Amy artwork or app screens are included.\n\nFares and timings reflect the public app during capture on 15 November 2026.\nSource and reproduction scripts live in scripts/metro-video.\n`);
const zip=resolve(DIR,'../ncr-metro-screenshots.zip');
execFileSync('python3',['-c',`import sys,zipfile,pathlib
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.iterdir()):
  if p.suffix in ['.png','.jpg','.txt']: z.write(p,p.name)
 for p in sorted(root.parent.glob('ncr-metro-android-*.png')): z.write(p,'android/'+p.name.removeprefix('ncr-metro-android-'))
 for p in sorted(root.parent.glob('ncr-metro-api-*.png')): z.write(p,'api/'+p.name.removeprefix('ncr-metro-api-'))
`,DIR,zip]);
console.log(`Packaged ${names.length} screenshot cards and preview in ${zip}`);
