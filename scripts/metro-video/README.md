# Delhi NCR Metro walkthroughs

Two independently recorded cuts of the live application. Web is a landscape
1920 x 1200 video. Phone is a portrait 1080 x 1920 video of the mobile web
layout, not a desktop crop or a native simulator recording.

The story and capability checks are in story.md. These scripts adapt the
product-video skill at /Users/taf/.codex/skills/product-video. The engine,
recorder and audio synthesizer retain that skill's frame-accurate timeline,
recording cursor, sound cues and generated music. Local changes support portrait
canvases, phone-sized browser frames, portrait diagrams, explanatory headings,
correct PNG chapter previews, CRF 22 web and CRF 24 phone exports, and a
48 kHz AAC soundtrack at 128 kbps. Source windows
explicitly crop the recorded CSS viewport to discard Playwright video padding.

## Reproduce

Requirements are Node, Bun, ffmpeg, uv and a Playwright Chromium headless shell
in ~/Library/Caches/ms-playwright. EXE can override the browser executable.
Run from the taf.sh repository root. No login or secret is needed.

```sh
bun install --cwd scripts/metro-video
node scripts/metro-video/record.mjs web
node scripts/metro-video/record-details.mjs web
node scripts/metro-video/record.mjs phone
node scripts/metro-video/record-details.mjs phone
node scripts/metro-video/compose.mjs
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-web.json --still 3.8,10,18,25,40,65,90,120,145
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-phone.json --still 3.8,10,18,25,40,65,90,120,145
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-web.json
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-phone.json
bun run build
```

VID defaults to /tmp/vid and holds raw recordings, marker files, clip caches,
rendered frames, generated music and contact sheets. WORKERS controls the
number of rendering browsers. Compositions are generated into this directory
and VID/comp. Rerun compose.mjs after recording because timings will change.
Do not reuse old fixed still timestamps if the timeline changes. Read
VID/frames/ncr-metro-{web,phone}/meta.json for the current scene boundaries.

The second recording opens the gates and lifts sections and records appearance
changes. Its clips replace those slots in the first recording. The first pass
also captures station search, the fare comparison, the network transfer, lines,
map zoom and dated notices. Screenshots in public/reel accompany the videos and
provide the intro and chapter previews.

Public outputs are public/reel/ncr-metro-web-demo.mp4 and
public/reel/ncr-metro-phone-demo.mp4, with matching poster JPEGs. The Delhi NCR
Metro gallery has both cuts with lazy playback. Its project links open the web
video, phone video and screenshot ZIP directly.

## Product screenshot cards

Amy Food Journal at https://www.amyfoodjournal.com/ is the visual reference for
pale backgrounds, large feature headlines and close phone views. The layouts,
route-line drawings and Metro branding here are original. No Amy assets are
included. Every app screen is a real capture of Delhi NCR Metro.

```sh
node scripts/metro-video/capture-product.mjs
node scripts/metro-video/screenshots.mjs
node scripts/metro-video/package-screenshots.mjs
```

The package contains eight portrait PNG cards at 1290 x 2796 and six landscape
PNG cards at 1920 x 1200. Full images, a contact sheet and usage notes are in
public/reel/ncr-metro-screenshots.zip. The preview is
public/reel/ncr-metro-screenshots/preview.jpg. Smaller WebP copies of the six
landscape cards appear in the site gallery. The cards are App Store-style
marketing images of the mobile web app. They do not claim an iOS release.

Capture screenshots at DPR 3 for sharp exports. Record video at DPR 1 because
Playwright can alternate between CSS and device pixel sizes when screenshots
and video recording share a context with a higher DPR.

## Content checks

Both cuts use actual public transit data and real app interactions. There is no
mockup footage or design-direction scene. Example fares and train times are
those returned while recording, not future guarantees. There is no ticket
purchase or WhatsApp interaction. The product marks iOS as coming soon.

The current live build failed to restore a saved journey after a browser offline
reload. The videos do not demonstrate or claim offline restoration. Local trip
history appears in the architecture explanation because completed journeys
persist in the application's local store. This limitation does not affect the
recorded online planner.

Review the stills before a full render. After encoding, inspect frames extracted
from both MP4 files and check duration, dimensions, audio and file size with
ffprobe. Keep each video below the hosting provider's per-file upload limit.
No deployment is part of this task.
