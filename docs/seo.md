# Search metadata and project discovery

`src/lib/seo.ts` holds the search titles, descriptions, breadcrumb labels and structured data for public pages. `StudioLayout.astro` emits them into the initial HTML. Unknown routes fall back to the layout props. Keep the canonical origin in `astro.config.mjs` set to `https://taf.sh`.

Canonical page URLs end with a slash, matching Cloudflare Assets directory URLs and the generated sitemap. Query parameters never enter canonical URLs. Preview deployments use the same canonical origin and add an `X-Robots-Tag: noindex` response header.

The structured data connects the studio, Tashif Ahmad Khan, the website, services and software projects. The personal site is `https://tashif.codes/`. Systematic Reasoning is team work, so its software node does not identify taf.sh as the publisher or owner. Do not add ratings, reviews, prices or dates without evidence.

## Adding a page or project

Add a public page's search copy to `pageMetadata` in `src/lib/seo.ts`. Public pages enter the sitemap automatically. Pages with `noindex` must also stay out of the sitemap filter in `astro.config.mjs`.

Add project descriptions and links to `reel` in `src/components/studio/data.ts`. The homepage, project directory at `/work/`, and project structured data read that list. A project with an internal case study should link to that page through `href` and its public application through `live`. Keep private or invite-only applications marked as such.

The footer and `/work/` page link to tashif.codes, its engineering blog and the local website case study. New project links must appear in ordinary HTML anchors so visitors and crawlers can follow them without opening the interactive reel.

## Checks

Run `bun run seo:check` after edits. It builds the site and checks titles, descriptions, canonical URLs, sitemap membership, social images, JSON-LD references, headings and local links. It also runs the Worker routing tests.

Run `bun run seo:images` after changing social card copy or the site's palette. The script generates the committed 1200 by 630 sRGB JPEGs in `public/og/` using the CSS dark theme tokens. The production build also runs this generator. Card copy and route mapping live in `src/lib/social.ts`.

After deployment, run `bun run seo:check:live https://v2.taf.sh` or `bun run seo:check:live https://taf.sh`. This fetches every public page with social crawler user agents and downloads every advertised image. It rejects images on the wrong host, missing images, wrong MIME types and invalid dimensions.

The Worker sends a permanent redirect from `/products/cliniq` to `/products/rah-clinic/`. It adds noindex headers to previews, client proposal pages, proposal downloads and missing pages. Keep these paths crawlable in robots.txt so search engines can read the noindex directives.

## LLM crawlers and readable content

Every build generates `/llms.txt`, `/llms-full.txt` and a Markdown copy of each public page. The directory URL `/services/` has the alternative `/services/index.md`. The homepage uses `/index.md`. These files come from the built HTML, so page copy stays in one place. `scripts/generate-crawler-content.ts` reads the generated sitemap and refuses to export a page with a noindex meta tag. Proposals, missing pages and the old CliniQ redirect never enter the exports.

`scripts/crawler-markdown.ts` extracts the main content, preserves headings, facts and absolute links, and removes scripts, forms, images and decorative content. It uses the accessible label for the animated homepage headline. Each Markdown page identifies its canonical HTML source. The generated `dist/_headers` sets Markdown MIME types, canonical HTTP links and alternate discovery links. `StudioLayout.astro` also advertises the Markdown alternative and `/llms.txt` in the HTML head of public pages.

The guide reads titles, descriptions and availability from existing page and product data. Keep product status accurate and distinguish studio products from team work. The services page answers common questions about scope, code ownership, remote work and pricing in visible HTML.

`DEPLOY_ORIGIN` controls absolute Markdown links in the guide. It defaults to `https://taf.sh`; `deploy:v2` sets it to `https://v2.taf.sh`. Canonical HTML sources remain on the apex. The exports are build artifacts and do not appear in the Astro dev server. Use a production build with Workers Assets to check their response headers.

`bun run seo:check` includes export, discovery and content checks. After deployment, run `bun run seo:crawlers:live https://v2.taf.sh`. It checks all public HTML and Markdown routes plus the guides and robots.txt with search crawler user agents. These requests verify responses to those user-agent strings. They do not establish access from the providers' verified crawler IPs.

The wildcard rule in robots.txt already permits search and AI crawlers. Cloudflare bot rules can still block them independently. If investigating blocked requests, check Cloudflare AI Crawl Control and security events against the provider's published crawler IP ranges. Do not trust a user-agent string alone or disable the site's security rules globally.

`llms.txt` is an informal discovery format. It does not guarantee inclusion, citations or rankings in an AI answer. Search engines can still use the existing HTML, sitemap and structured data. References: [llms.txt proposal](https://llmstxt.org/), [OpenAI crawler roles](https://developers.openai.com/api/docs/bots), [Google's AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Cloudflare AI crawler controls](https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/).

## Publishing and search consoles

Use `bun run deploy:v2` for the separate preview Worker. This command sets `SOCIAL_IMAGE_ORIGIN=https://v2.taf.sh` during the build so preview images load from v2 while canonical page URLs still point to taf.sh. v2 stays noindexed, so deploying there does not update search results for the main site. The main site's deployment command is `bun run deploy`.

After a main-site deployment, submit `https://taf.sh/sitemap-index.xml` in the verified taf.sh properties in Google Search Console and Bing Webmaster Tools. Inspect `/`, `/services/`, `/work/` and each product page. Check live rendered HTML, canonical selection and crawl errors. Account verification and sitemap submission require access to those external accounts.

Use Search Console performance and indexing reports to assess changes over time. Structured data describes the actual content; it does not guarantee a rich result or a ranking change.
