# Paisa product video

This package records the Kotlin Multiplatform Paisa app in `../Paisa`. Footage covers Android phone, foldable, tablet and the local web app. At the user's request, browser presentation chrome and the closing card show `paisa.tashif.codes`. The footage does not connect to that host.

The main cut leads with phone footage. It shows a bank SMS becoming a transaction, the attached original message, Add with AI, fast manual entry, search, analytics, budgets, accounts and optional backup. The appearance chapter shows Material You wallpaper colors, fixed palettes, dark mode, AMOLED black and floating navigation. Privacy includes hiding amounts and the app lock gate. The final chapter shows an unfolded foldable, a separate Android tablet and the browser.

The Paisa launcher icon appears throughout. On the portrait video, the header brand is the icon alone. All presentation type is sans serif. Highlights use the displayed viewport dimensions and place their labels outside the phone content. Phone frames use the exact 1080/2424 aspect ratio. Foldable frames use 2076/2152 and tablet frames use 2560/1600.

## Rebuild

Requirements are Node, Bun, Python, uv, ffmpeg and an installed Playwright Chromium headless shell. The browser only composites local artwork and video frames. App interaction uses T3 browser or bound agent-device sessions.

```sh
python3 scripts/paisa-video/create-comp.py
python3 scripts/paisa-video/create-web-comp.py
VID=/tmp/paisa-video node scripts/paisa-video/engine/render.mjs scripts/paisa-video/composition.json --still 3,16,33,64,78,83,98,107,114
VID=/tmp/paisa-video WORKERS=3 node scripts/paisa-video/engine/render.mjs scripts/paisa-video/composition.json
VID=/tmp/paisa-video WORKERS=3 node scripts/paisa-video/engine/render.mjs scripts/paisa-video/phone-composition.json
VID=/tmp/paisa-video WORKERS=3 node scripts/paisa-video/engine/render.mjs scripts/paisa-video/web-composition.json
VID=/tmp/paisa-video python3 scripts/paisa-video/export-platform-cuts.py
node scripts/paisa-video/screenshots.mjs
bun run build
```

The main and web videos are 1920 by 1200. The phone cut is 1080 by 1920 and contains every phone feature chapter. The tablet and foldable cuts come from the main video, each with the same opening card. The main cut is about 131 seconds, the phone cut about 91 seconds, the detailed web cut about 50 seconds, the foldable cut about 11 seconds and the tablet cut about 13 seconds. All have a synthesized instrumental soundtrack and no voiceover. Final MP4s and posters live in `public/reel/`. Render frames and audio remain under `/tmp/paisa-video`.

## Screenshots

`screenshots.mjs` exports nineteen 1242 by 2688 portrait PNGs, nineteen separately composed 1920 by 1200 gallery JPEGs, a contact sheet and a ZIP containing the portrait PNGs. These are store-style marketing assets for Android and web. They make no iOS availability claim.

Amy Food Journal inspired the large benefit headlines, pastel backgrounds, rounded frames and prominent app screenshots. Paisa uses forest green, cream and mint, with Bricolage Grotesque. There are no footer labels or panel numbers in the artwork.

The panel order is overview, SMS, SMS source, AI drafts, manual entry, analytics, budgets, accounts, search, Material You, appearance controls, AMOLED black, hidden amounts, app lock, foldable, tablet, web, backup and device family.

`paisa-icon.svg` converts the paths and colors of `app/src/androidMain/res/drawable/ic_launcher_legacy.xml` directly. No generated or replacement logo is used.

## Capture evidence

New phone recordings cover SMS, Add with AI draft generation, account refinement and saving, manual entry, search, category analytics, budgets/accounts, backup, appearance, hidden amounts and app lock. They use the cover display of an Android foldable. The screen recorder retains a 2076 by 2424 encoder canvas, so compositions crop the 498-pixel black strips at each side. Direct phone screenshots are already 1080 by 2424.

`raw/tablet.mp4` comes from a separate Android tablet at 2560 by 1600. The older unfolded recording uses a 2076 by 2424 canvas with 136-pixel black strips above and below the 2076 by 2152 screen. Browser footage is 2880 by 1800.

The SMS scene delivers a Standard Chartered alert through the device telephony interface. The app's on-device bank parser creates the transaction and retains the source message. AI is a separate Add with AI flow. Never describe the SMS bank parser as an AI model.

App lock uses a device PIN. The shipped clip shows the locked Paisa gate. Authentication itself is an Android secure surface and is excluded from the edit. Backup destinations are shown as optional settings; no cloud backup or cross-device sync is claimed to have run.

The Codex product-video skill lives at `/Users/taf/.codex/skills/product-video`. All editing and rendering in this package runs in Codex.

## AI capture

`raw/phone-ai-results.mp4` shows Add with AI parsing a bank message and a ride note into two selected drafts. A follow-up request changes both accounts to HDFC Savings, then both transactions are saved. Add with AI is bring-your-own-key: settings offer OpenAI, Anthropic, Google, OpenRouter, DeepSeek, Groq, NVIDIA, OpenCode Zen and RelayRoom, plus any OpenAI, Anthropic or Gemini compatible endpoint you add yourself, with a model catalogue and a fallback ladder. The recording used one added provider, and the key never appears in the footage or source files.
