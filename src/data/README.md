# Web presence evidence

The evidence appears at `/work/tashif-codes`. The Web presence service links to this case study.

`web-presence.json` contains public aggregate traffic for the `dashboard` project, which is tashif.codes. Other project slugs track different sites.

Refresh the snapshot with `bun scripts/refresh-web-presence.ts`, then build and deploy. A failed or stale response leaves the saved file untouched. Counts are dated snapshots, so visitors never need to wait for the external analytics API.

Pageviews sum the daily timeseries. Google referral pageviews come from the `google.com` row in the referrer breakdown. They are not Search Console clicks. Daily visitor counts cannot be added to claim distinct people across the full period, so they are omitted.

The site and stats screenshots in `public/media/tashif-codes/` were captured on 19 November 2026, and the Google search image on 18 October 2026. The Google image is an actual public search for `site:tashif.codes/blog`. It demonstrates indexed results, not ranking for a competitive query.

The homepage chart uses calendar month totals. The first and last months are partial. Refreshing the JSON does not update the dated screenshots.

## Stats API usage

`stats-api-usage.json` feeds `/work/stats-apis`. It is a dated snapshot of Vercel request metrics for the seven public stats APIs, production only, grouped by referrer hostname. The site list drops the author's own domains and preview deployments, Netlify and EdgeOne preview builds, search engines and localhost. Requests without a referrer (about two thirds) cannot be attributed, so the list undercounts users. Refresh it by re-running the Vercel metrics query and regenerating the file.

## Search Console

`search-console.json` feeds the Search Console section of `/work/tashif-codes`. It summarises a "Performance on Search" export for the tashif.codes domain property, so every subdomain is included: the portfolio, the blog, the JIIT tools and the stats APIs. Totals and the monthly series come from the export's daily chart. Clicks by site group the export's top pages by hostname.

Refresh it by exporting the last 16 months from Search Console (Performance, Export, Download CSV), then run `bun scripts/import-search-console.ts <export.zip>`. The script reads the date in the file name as the export date. The current snapshot is the export of 19 November 2026.
