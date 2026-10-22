# Web presence evidence

The evidence appears at `/work/tashif-codes`. The Web presence service links to this case study.

`web-presence.json` contains public aggregate traffic for the `dashboard` project, which is tashif.codes. Other project slugs track different sites.

Refresh the snapshot with `bun scripts/refresh-web-presence.ts`, then build and deploy. A failed or stale response leaves the saved file untouched. Counts are dated snapshots, so visitors never need to wait for the external analytics API.

Pageviews sum the daily timeseries. Google referral pageviews come from the `google.com` row in the referrer breakdown. They are not Search Console clicks. Daily visitor counts cannot be added to claim distinct people across the full period, so they are omitted.

Screenshots in `public/work/tashif-codes/` were captured on 18 October 2026. The Google image is an actual public search for `site:tashif.codes/blog`. It demonstrates indexed results, not ranking for a competitive query. No authenticated Search Console data is included because Google rejected the preview sign-in and Safari automation timed out.

The homepage chart uses calendar month totals. The first and last months are partial. Refreshing the JSON does not update the dated screenshots.
