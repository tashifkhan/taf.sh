"""Export site gallery shots, an overview, and the iOS screenshot pack."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os
from PIL import Image

root = Path(__file__).resolve().parents[2]
media = root / "public/reel"
frames = Path(os.environ.get("VID", "/tmp/patchwork-video")) / "frames/patchwork-ios-preview"
for i, timestamp in enumerate(["21", "46", "65", "37", "97", "89"], 1):
    image = Image.open(frames / f"still-{timestamp}.jpg").convert("RGB")
    image.resize((1440, 900), Image.Resampling.LANCZOS).save(media / f"patchwork-{i}.jpg", quality=93)

panels = sorted((media / "patchwork-store/ios").glob("*.png"))
overview = Image.new("RGB", (1800, 690), "#faf1e6")
for i, path in enumerate(panels):
    image = Image.open(path).convert("RGB")
    image.thumbnail((294, 666))
    overview.paste(image, (i * 300 + 3, 12))
overview.save(media / "patchwork-store/ios-overview.png")
overview.save(media / "patchwork-store/ios-overview.jpg", quality=92)
with ZipFile(media / "patchwork-store/patchwork-ios-screenshots.zip", "w", ZIP_DEFLATED) as archive:
    for path in panels:
        archive.write(path, path.name)
