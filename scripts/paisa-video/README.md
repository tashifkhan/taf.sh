# Paisa product video

This video shows the Kotlin Multiplatform Paisa app in `../Paisa`, using its bundled sample data. It does not show the separate app hosted at paisa.tashif.codes.

The footage includes the native Android app on the inner and cover displays of a foldable emulator, and the local Compose/Wasm browser distribution. The Android APK was built on November 11, 2026; the browser distribution on November 10. Capture date is November 14. These recordings demonstrate the existing core flows, rather than every change in the latest source.

`story.md` contains the scene brief. `create-comp.py` generates both compositions with paths for the current checkout. `engine/` is a project-local copy of the imported Codex `product-video` renderer. It adds phone, foldable and portrait framing, a sample-data label, and a PNG chapter-still fix. It normalizes the recordings to 30 fps before trimming, preserves their aspect ratios and crops only the recorder's black padding. Clip holds keep the final saved state readable.

The main video is 155 seconds at 1920 × 1200. The separate phone cut is 33.6 seconds at 1080 × 1920. Both have a synthesized instrumental soundtrack and no voiceover.

## Rebuild

Requirements are Node, Bun, Python, uv, ffmpeg and a Playwright Chromium headless shell in `~/Library/Caches/ms-playwright`. `EXE` can point to another compatible Chromium binary. The renderer installs numpy through uv for the synthesized soundtrack.

```sh
cd scripts/paisa-video/engine
bun install
cd ../../..
python3 scripts/paisa-video/create-comp.py
VID=/tmp/paisa-video node scripts/paisa-video/engine/render.mjs scripts/paisa-video/composition.json --still 3,12,22,31,39,47,55,64,73,83,93,103,114,125,136
VID=/tmp/paisa-video WORKERS=4 node scripts/paisa-video/engine/render.mjs scripts/paisa-video/composition.json
VID=/tmp/paisa-video WORKERS=2 node scripts/paisa-video/engine/render.mjs scripts/paisa-video/phone-composition.json
VID=/tmp/paisa-video python3 scripts/paisa-video/export-platform-cuts.py
node scripts/paisa-video/screenshots.mjs
bun run build
```

The final MP4, poster and gallery stills live in `public/reel/`. `export-platform-cuts.py` derives a 14.4-second foldable cut and a 50.55-second web cut from the main video, with fades and a music crossfade at the web join. It reads the scene timings so chapter cards stay outside those cuts. Frames, cut footage and synthesized WAV files are temporary and stay outside the checkout.

Use `--frames start:end` to replace a selected range of frames, then `--encode-only` to rebuild the MP4 from all existing frames. Do not use `--encode-only` after a layout change unless every affected frame has been rendered again.

## Product screenshots

`screenshots.mjs` exports eight 1242 × 2688 portrait PNGs, eight separately composed 1920 × 1200 gallery JPEGs, a contact sheet, and a ZIP containing the portrait PNGs. These are store-style marketing assets for Android and web, with no iOS availability claim. The gallery includes the main walkthrough and links to the platform cuts and screenshot ZIP.

Amy Food Journal's site was the visual reference for large benefit headlines, rounded pastel panels, soft shadows and prominent real app screens. Paisa's panels use forest green, mint and cream. All text uses Bricolage Grotesque, with no serif font. The captured application UI keeps its original typography. The video uses Roboto and Roboto Mono.

`paisa-icon.svg` is a direct conversion of the paths and colors in Paisa's `app/src/androidMain/res/drawable/ic_launcher_legacy.xml`. It is the actual green coin and rupee launcher icon. The artwork renderer loads fonts from the site's existing Fontsource packages and embeds local captures. It never connects to a third-party app or invents an application screen.

Screenshot order is overview, manual entry, foldable details, analytics, category budgets, browser records, optional backup, and the phone/foldable/browser family. `phone-add.png` was extracted at 100 seconds from the native recording. Budget and backup cards are crops of the captured UI.

The Codex skill was imported to `/Users/taf/.codex/skills/product-video`. All composition, rendering and artwork work here runs in Codex.

## Footage

- `raw/desktop.mp4` shows analytics, budgets, accounts, backup and AI settings in the local Wasm app at 1440 by 900 CSS pixels.
- `raw/desktop-details.mp4` shows merchant search and a record opening beside the results.
- `raw/foldable.mp4` shows native Android on the inner display. Crop the 136-pixel black bars at the top and bottom.
- `raw/phone.mp4` shows the same native app on the cover display. Crop the 498-pixel black bars at each side.

The desktop recordings use T3's browser recorder. The native recordings use the device session's `agent-device record`. The originals remain here so another render does not require the recording session or a private account.

No external AI provider, cloud destination, or sync account was configured. Their settings are shown as settings. SMS import is described as Android-only. No iOS, browser SMS, browser PDF, or browser offline-install claims appear in the video. All names, transactions and bank balances come from sample data.

## Validation

Verified November 15, 2026. `bun run build` passes. All four H.264/AAC exports decode without errors at 30 fps. Encoded frames and posters were inspected, including the entered amount, saved balance, foldable details and web analytics. The main soundtrack has a measured mean level of -18.3 dB and peak of -1.8 dB. The eight portrait PNGs have the expected dimensions and match their ZIP entries byte for byte. The built homepage references every Paisa video and gallery asset, and the video manifest matches their final file sizes.
