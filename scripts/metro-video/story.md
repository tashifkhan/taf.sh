# Delhi NCR Metro

Recorded 15 November 2026 from the production site, the hosted API docs, and the published Android app. Web and phone tell the same story. The API is the product, and the app is the client that uses it.

## Scene order

1. One API. Both metros. Open on the API docs, not a commute form.
2. No key. One contract. v1 for DMRC and NMRC, v2 for the planner, MIT, no auth.
3. Call it. Get the journey. GET /api/v2/journeys/plan.
4. A real response. AIIMS to Karkarduma Court, 44 minutes, 18 stops, ₹43 weekday, ₹33 Sunday, source sarthi.
5. The live docs. Scroll the hosted OpenAPI page.
6. Two operators, one response. App calls the API. v1 and v2 sit under it.
7. Pick the ride. See the fare. Shortest against fewer changes, then the ticket card.
8. Cross operators. Keep both tickets. The Aqua walk and the split fare.
9. Read the station before you arrive. Gates, then the network map.
10. Keep the plan when the signal drops. The saved AIIMS to Karkarduma Court journey, opened in airplane mode.
11. Build on it, or just ride. Close on the API URL.

## Verified examples

The live planner returned 44 minutes and 18 stops for shortest, with changes at Rajiv Chowk and Karkarduma. Fewer changes returned 52 minutes and 16 stops, changing at Dilli Haat INA. The two strategies cover the same departure and destination. The fare was ₹43 on weekdays and ₹33 on Sundays and holidays during capture.

The cross-network example returned about 75 minutes. Its route includes the Sector 52 to Sector 51 footbridge walk, about 300 metres and 6 minutes. The operator tickets stay separate. Values are examples from capture, not guarantees for future trips.

## Visual treatment

Use the light Metro palette for the video canvas, with blue accents and pale tonal surfaces. Preserve the app's current icon and typography. Android's own bars stay inside a thin rounded frame. Do not add an Android app or actual capture label. Keep duplicate demo captions hidden on native scenes. The portrait API screenshot uses a wide frame so documentation is not cropped into a phone.

Screenshot cards use Amy Food Journal's pale backgrounds and large headline style as reference. All layouts and rails are original. All product screens are fresh captures. No mockups, roadmap scenes, personal data, ticket purchases or messages are included. Soundtrack and transition sounds are synthesized locally.
