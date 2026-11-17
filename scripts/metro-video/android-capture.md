# Native Android capture

The horizontal video uses a local release build of Delhi NCR Metro with the
saved Slide, Fade and Off page animation selector. The application ID for this
capture is `codes.tashif.delhimetro.video`, so it can coexist with the published
app. OTA updates are disabled for this build to keep the recorded source fixed.
Generated Android build files are local and ignored by Git.

The target is `Patchwork_Things_35`, emulator-5558. The Pixel 8 used by the
referenced Patchwork thread is left alone. Device interaction, screenshots,
recordings and radio settings use the device tool's returned agent-device CLI.

## Build

From delhi-metro/app, prebuild Android with Expo, give the generated application
a separate ID and disable Expo Updates in the generated manifest. Assemble a
release APK for arm64-v8a with JDK 17. Install and launch through agent-device.
The build uses the public API and no login or credentials.

## Capture sequence

1. Plan AIIMS to Karkarduma Court online. Record Shortest and Fewest Changes as
   separate clips. Check the screen says two changes and one change.
2. Enable airplane mode, disable Wi-Fi and mobile data, then relaunch the app.
   Open the same saved journey and record its saved-plan label. Restore radios
   after the capture. A new uncached route is outside the offline claim.
3. Record palette and theme changes. Save a clean screenshot of the palettes.
4. Record AMOLED, contrast and haptics controls. Save a screenshot that includes
   the page animation selector.
5. Select Slide, Fade and Off and navigate between screens. Relaunch and verify
   the final choice remains selected. Keep physical haptic feedback out of the
   claim because an emulator cannot demonstrate the sensation.

Raw recordings go in /tmp/vid/android. Android recordings use a variable frame
rate and may stop at the last changed frame. Convert to 30 fps and pad the last
frame before choosing clip windows. Inspect those windows, then write the
shortest, fewest, offline, colors, controls and animations entries in
/tmp/vid/android/segments.json. Each entry has raw, a, b and optional speed.
compose.mjs uses these real capture windows with a separate native phone frame.

Public native PNG captures use public/reel/ncr-metro-android-*.png. The colors
and controls captures also appear in the closing video scene and screenshot
cards phone-08 and web-06. Other phone screenshot cards show mobile web.
