# Patchwork native media

One film follows release work in the real native iOS and Android apps. Eight
store screenshots per platform use spacious portrait layouts and soft colors
inspired by https://www.amyfoodjournal.com/. Patchwork supplies the icon,
coral accent, product copy and actual app screens.

Archivo is the only font in the artwork and video. Native captures retain
platform fonts. The screenshot artwork has no sample-data or native-app footer.
Video frames fit the actual capture height, with no black bands inside the bezel.
Platform labels appear only in the opening scene and the first image of each
App Store and Google Play screenshot set. Later frames focus on the product.

## Outputs

- `public/reel/patchwork-native-demo.mp4`, 100.7 seconds, 1920 × 1200, 30 fps.
- `public/reel/patchwork-native-poster.jpg`.
- `public/reel/patchwork-1.jpg` through `patchwork-6.jpg`, landscape gallery.
- `public/reel/patchwork-store/ios/`, eight 1320 × 2868 PNGs.
- `public/reel/patchwork-store/android/`, eight 1080 × 2400 PNGs.
- `public/reel/patchwork-store/patchwork-ios-screenshots.zip`.
- `public/reel/patchwork-store/patchwork-android-screenshots.zip`.
- `public/reel/patchwork-store/patchwork-ios-android-screenshots.zip`.
- Platform overview PNGs and a combined overview JPG in `patchwork-store/`.

The prior iOS preview remains available under `patchwork-ios-preview.mp4`.
The site gallery now uses the combined native film.

## Recording provenance

T3 agent-device captured the actual `codes.tashhif.patchwork.dev` builds on
an iPhone 18 Pro simulator with iOS 27.0 and a Pixel 8 emulator with Android 15,
API 35. Android uses the bundled release APK. `recordings/sources.json` and
`recordings/sources.android.json` list source windows.
`recordings/sources.jira.json` records the new Jira board clips. Retained clips use CFR30.

Tasks and Deck boards contain synthetic fixtures served by `demo-server.py`.
The priority scene shows the native High to Medium
UI change. It does not claim a server round trip or cross-device synchronization.
Jira uses synthetic issues in `jira-fixtures.py`, captured through each native
client. GitHub is unconnected in this recording. AI settings show provider
configuration, without key values or a generated result. No concept screens.

## Scene order

Both phones introduce Patchwork. iOS shows due-date groups. Android filters the
release tag and searches tasks and cards. Both apps open the release checklist.
Android changes priority. Both platforms show a populated Jira board. Android
and iOS narrow the scope to assigned or reported issues. iOS selects the active
sprint. Both platforms show an actual card drag with a drop marker. Paired
appearance screens show native theme controls, followed by provider settings
and the closing source URL.

The supplied Android screenshots guide the Jira board layout and interactions.
All final board captures come from the running native apps, with sample issues
about Patchwork. No Android screenshot is relabeled as iOS. Drag artwork uses
frames from the actual gesture recordings.

## Render

Requires Node, ffmpeg, uv, Pillow, and the installed product-video skill with
its Playwright dependency. Run from the taf.sh repository root.

```sh
export VID=/tmp/patchwork-video
node scripts/patchwork-video/make-combined.mjs
node scripts/patchwork-video/render.mjs "$VID/comp/patchwork-native-demo.json" --still 3.5,11.7,18.9,26.1,33.3,41.5,47.7,54.9,62.1,69.3,76.5,82.7,89.9,97.1,104.3,111.5,118.7
WORKERS=4 node scripts/patchwork-video/render.mjs "$VID/comp/patchwork-native-demo.json"
node scripts/patchwork-video/screenshots.mjs ios android
python3 scripts/patchwork-video/export-gallery.py
bun run build
```

`prepare-footage.mjs`, `prepare-android.mjs` and `prepare-jira.mjs` preserve selected windows from
new raw recordings. They are not needed for a normal render. The bad Android
edit recording is excluded. Music comes from the skill's synthesizer.
No deployment is part of this work.
