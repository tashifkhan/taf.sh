"""Export gallery stills and separate and combined native screenshot packs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os
from PIL import Image

root = Path(__file__).resolve().parents[2]
media = root / 'public/reel'
store = media / 'patchwork-store'
frames = Path(os.environ.get('VID', '/tmp/patchwork-video')) / 'frames/patchwork-native-demo'
for i, timestamp in enumerate([3.5, 26.1, 54.9, 69.3, 89.9, 104.3], 1):
    path = frames / f'still-{timestamp}.jpg'
    if path.exists():
        image = Image.open(path).convert('RGB')
        image.resize((1440, 900), Image.Resampling.LANCZOS).save(media / f'patchwork-{i}.jpg', quality=93)

all_panels = []
for platform in ['ios', 'android']:
    panels = sorted((store / platform).glob('*.png'))
    assert len(panels) == 8, f'Missing {platform} panels'
    overview = Image.new('RGB', (2400, 690), '#faf1e6')
    for i, path in enumerate(panels):
        image = Image.open(path).convert('RGB')
        image.thumbnail((294, 666))
        overview.paste(image, (i * 300 + (300-image.width)//2, 12))
        all_panels.append((platform, path))
    overview.save(store / f'{platform}-overview.png')
    overview.save(store / f'{platform}-overview.jpg', quality=92)
    with ZipFile(store / f'patchwork-{platform}-screenshots.zip', 'w', ZIP_DEFLATED) as archive:
        for path in panels:
            archive.write(path, path.name)
with ZipFile(store / 'patchwork-ios-android-screenshots.zip', 'w', ZIP_DEFLATED) as archive:
    for platform, path in all_panels:
        archive.write(path, f'{platform}/{path.name}')
combined = Image.new('RGB', (2400, 1380), '#faf1e6')
for row, platform in enumerate(['ios', 'android']):
    combined.paste(Image.open(store / f'{platform}-overview.png'), (0, row*690))
combined.save(store / 'ios-android-overview.jpg', quality=93)
print('Exported gallery, both platform overviews, and all three ZIP packs')
