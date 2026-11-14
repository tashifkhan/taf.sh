# Delhi NCR Metro product videos

Two detailed cuts for taf.sh, made with the product-video skill. The landscape
cut records the desktop web layout at 1440 x 900. The portrait cut records the
mobile web layout at 390 x 844. The phone cut is mobile web, not native Android
or iOS footage. No mock screens or roadmap scenes.

## Who and why

Delhi and Noida commuters need a journey plan that includes the operator change.
Before this app, they had to compare separate services and work out the gap
between Delhi Metro and the Aqua Line themselves.

The loop is choose both stations, compare the route, check fare and train
times, then inspect the stations and network before leaving. Appearance settings
provide light and dark themes.

## Verified capabilities

The production app at https://ncr-metro.tashif.codes provides station search
across DMRC and NMRC, shortest and fewest-change strategies, train times,
operator fare breakdown, station gates and lifts, line lists, a zoomable map,
passenger notices and local caching. All footage uses these working screens.

On 2026-11-14 the live API returned AIIMS to Rajiv Chowk as 8 stops and 14 minutes.
AIIMS to Noida Sector 137 returned 75 minutes, a 300 m walk between Sector 52
and Sector 51, and separate tickets. These are examples from the recording,
not guarantees for future trips. Counts on title slides are two operators,
two Delhi route strategies and one combined plan. No invented user metrics.

## Scene order

1. Plan the whole NCR commute. Desktop or phone footage introduces the product.
2. Two operators, one journey. Explain two networks and two route strategies.
3. Choose stations, compare the plan, check before leaving. Show the loop.
4. Know the trip before you leave. Select AIIMS and Rajiv Chowk, find the route,
   switch strategies, inspect fares, platform direction and first/last trains.
5. Cross to Aqua with the walk included. Change the destination to Noida Sector
   137. Show the two-ticket fare breakdown and Sector 52 to Sector 51 walk.
6. Find the right exit. Search Rajiv Chowk, inspect gates and lifts, browse the
   Yellow Line's ordered stations.
7. Keep the network in view. Zoom the network map, read dated passenger notices,
   and switch between light and dark appearance.
8. One app, a shared API. Explain Expo, the web/mobile clients, the normalized
   API, upstream operators and local trip history.
9. Close on ncr-metro.tashif.codes with browser and Android availability.

## Visual treatment

Use the app's light Metro palette. Background #FDFCFF, ink #1A1C1E, blue
#005FAF and blue-grey tonal surfaces. The app uses system sans fonts. The
video uses system sans and monospace fonts too. Amber callouts distinguish
annotations from the app's blue controls. Music and transition sounds are
synthesized by the skill, with no sampled music. All actions use a fresh
recording browser. No credentials or personal data are needed.

## Scope

The walkthrough records public transit information. It does not purchase tickets,
open WhatsApp, promise live vehicle locations, or claim that iOS has shipped.
The cross-network transfer is an actual planner result, not a design direction.

## Recording limitation

The production app did not restore a previously planned journey after an offline
reload in the recording browser. The videos omit the offline demonstration and
make no claim that the recorded web build can restore a journey offline. They
show the working appearance settings instead. iOS is marked coming soon by the
product, so neither cut claims an available iOS release.
