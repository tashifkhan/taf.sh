# Patchwork media

Native iOS preview and six App Store screenshots for Patchwork. The reference
is https://www.amyfoodjournal.com/. The artwork borrows its spacious portrait
layout and soft backgrounds. Patchwork supplies the app icon, coral accent,
product copy and native screens.

Archivo is the only font in the artwork and video, including captions and
diagram labels. The app captures retain the app's native font. No serif accents.

## Outputs

- `public/reel/patchwork-ios-preview.mp4`, about 117 seconds at 1920 × 1200, 30 fps.
- `public/reel/patchwork-ios-preview-poster.jpg`.
- `public/reel/patchwork-1.jpg` through `patchwork-6.jpg`, landscape site gallery.
- `public/reel/patchwork-store/ios/`, six 1320 × 2868 PNG screenshots.
- `public/reel/patchwork-store/patchwork-ios-screenshots.zip`.
- `public/reel/patchwork-store/ios-overview.png`.

## Recording provenance

The screens and clips show the real `codes.tashhif.patchwork.dev` native build
on an iPhone 18 Pro simulator running iOS 27.0. T3 agent-device captured them.
`recordings/sources.json` records the clip windows. The retained MP4 clips use
constant 30 fps and contain only the footage used in the composition.

Tasks and Deck boards use synthetic data served by `demo-server.py` on port
5232. Edits use the actual native CalDAV requests. GitHub and Jira are
unconnected in the recording, so only their settings appear. The AI scene
shows provider configuration, with no key value or generated result.

The scene order is introduction, source diagram, daily planning and search,
task details and editing, Deck boards and cards, integration settings, AI
configuration, appearance, device storage diagram, and closing repository URL.
Music and sound effects come from the product-video skill's audio synthesizer.

## Render

Requires Node, ffmpeg, uv, Pillow, the installed product-video skill and its
Playwright dependency. Run from the taf.sh repository root.

```sh
export VID=/tmp/patchwork-video
node scripts/patchwork-video/make-comp.mjs
node scripts/patchwork-video/render.mjs "$VID/comp/patchwork-ios-preview.json" --still 3.6,21,37,46,65,83,89,97,105,113
WORKERS=4 node scripts/patchwork-video/render.mjs "$VID/comp/patchwork-ios-preview.json"
node scripts/patchwork-video/screenshots.mjs ios
python3 scripts/patchwork-video/export-gallery.py
bun run build
```

`make-comp.mjs` reads the durable clips in this directory and the raw native
PNGs in `public/reel`. `prepare-footage.mjs` is only needed after new device
recordings. It reads the original temporary recordings and keeps the selected
windows. `PRODUCT_VIDEO_SCRIPTS` can override the installed skill script path.

## Android status

Android work is paused at the user's request. The release APK built successfully
at `~/Projects/Patchwork/app/android/app/build/outputs/apk/release/app-release.apk`.
Installation on the Pixel 8 API 35 emulator failed because its internal storage
was full. Do not retry, erase emulator data or switch emulators until the user
resumes Android work. Android screenshots and footage have not been produced.
`screenshots.mjs` has an Android layout ready for real Android captures.

The current video and site entry explicitly say iOS preview. No deployment.
