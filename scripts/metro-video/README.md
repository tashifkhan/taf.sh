# Delhi NCR Metro videos and screenshots

Both videos use app 1.8.0, captured on 15 November 2026. The horizontal cut combines desktop web with native Android. The portrait cut combines mobile web with native Android. Every product screen is a real capture. The phone cut includes the same route comparison, offline demonstration, hosted API and settings as the horizontal cut.

The Android footage comes from the published v1.8.0 APK on Patchwork_Things_35, Android 15. The web footage comes from https://ncr-metro.tashif.codes. Browser captures use the preview tools. Device interactions, screenshots and recordings use the device session's agent-device CLI. No Claude or delegated agents were used.

## Capture and compose

The current story is in story.md and the native sequence is in android-capture.md. Browser recordings and screenshots are listed in capture-sources.json. Capture the desktop viewport at 1440 x 900 and mobile web at 390 x 844. Save fresh screenshots to public/reel/ncr-metro-{web,phone}-<screen>.png. The phone screenshots also go in captures/ for the marketing cards.

Use preview_recording_start, interact with the actual app, and stop with preview_recording_stop. Use preview_snapshot with save=true for the original screenshot. Keep the returned recording paths in capture-sources.json. The source recordings use a variable frame rate and may end at the last changing frame. normalize.py converts them to 30 fps and pads the final frame. It also normalizes the six native clips.

```sh
bun install --cwd scripts/metro-video
python3 scripts/metro-video/normalize.py
node scripts/metro-video/compose.mjs
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-web.json --still 4,24,48,84,126,146,163,181
node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-phone.json --still 4,24,48,84,126,146,163,181
WORKERS=6 node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-web.json
WORKERS=6 node scripts/metro-video/engine/render.mjs /tmp/vid/comp/ncr-metro-phone.json
node scripts/metro-video/screenshots.mjs
node scripts/metro-video/package-screenshots.mjs
bun run build
bun test worker/index.test.ts
```

VID defaults to /tmp/vid. Fresh sources and normalized clips live in VID/v180. Native raw names are android-{shortest,fewest,offline,colors,controls,animations}.mp4. Source recordings must exist before normalization. WORKERS controls renderer concurrency. The older record.mjs, record-details.mjs, record-api.mjs and capture-product.mjs scripts describe the 1.7.0 capture flow and are retained as history. They are not the source of this refresh.

The local HTML engine comes from the product-video skill. It renders each frame from an explicit timeline, adds a synthesized soundtrack, and encodes H.264 with 48 kHz AAC audio. The horizontal canvas exports at 1920 x 1200. The portrait canvas exports at 1080 x 1920. Both use 30 fps and CRF 24. Native phone framing keeps Android's own status and navigation bars. There is no technical capture label.

## Screenshot cards

Amy Food Journal at https://www.amyfoodjournal.com/ is the reference for pale backgrounds, large headlines and close phone views. The Metro layouts and rail drawings are original. The app mark is the current Metro icon. No Amy artwork or app screenshots are included.

The ZIP contains eight portrait PNG cards at 1290 x 2796 and six landscape PNG cards at 1920 x 1200, plus original Android and API documentation screenshots. Cards phone-08 and web-06 use Android customization screens. The other phone views are mobile web. The images do not claim an iOS release. Gallery WebP files and preview.jpg are rebuilt with the package.

## Content checks

AIIMS to Karkarduma Court demonstrates different route strategies. Shortest is 44 minutes with two changes, Yellow to Blue to Pink. Fewer changes is 52 minutes with one change, Yellow to Pink at Dilli Haat INA. AIIMS to Noida Sector 137 shows the 300 metre walk and separate operator tickets.

Offline footage comes after saving both routes online, disabling all emulator radios, and relaunching. The saved route reopens with its timestamp and fare warning. This demonstrates previously saved plans. Fares and service notices can change.

The API scene shows the actual hosted documentation at ncr-metro.tashif.codes/api and the source URL github.com/tashifkhan/delhi-metro. The app and API are MIT licensed. No ticket was purchased and no WhatsApp message was sent.

Review stills before encoding. Then inspect frames from the exported MP4s, check their dimensions, duration, audio and size, and inspect both posters. Public files live in public/reel/ncr-metro-*. No deployment is part of this task.
