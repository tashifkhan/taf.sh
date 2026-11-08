# Stats API film

Run `node video/stats-api/render.mjs --still 4,27,55,66.5` to check stills.
Run `node video/stats-api/render.mjs` to write the MP4 and poster in `public/reel/`.

The wrapper uses the product-video skill renderer at
`~/.claude/skills/product-video/scripts`. Set `PRODUCT_VIDEO_SCRIPTS` to use another
installation. All footage and scene inputs are saved here. Custom scenes and CSS
apply only to this film. The shared skill files stay unchanged.
Render intermediates stay in `node_modules/.cache/product-video` so a cleared
temporary directory cannot discard the frame pass. Set `VID` to change this path.
The web export uses H.264 at CRF 18 to fit the site's 25 MiB per-file asset limit.

The demonstrations are recordings of the running APIs. Opening numbers come from
the previously captured API cards. Forgejo and Gitea are named as open-source
self-hosted options. They share one adapter, so the film does not describe them
as two separately hosted API services or show invented Gitea activity.

The response-envelope ring follows the outer code-panel bounds in the original
1440 by 900 recording. Its border fades in without scaling across the text.

## Logo sources

GitHub, LeetCode, Codeforces, GeeksforGeeks, CodeChef, HackerRank, Forgejo and Gitea
use their SVG marks from [Simple Icons](https://github.com/simple-icons/simple-icons/tree/develop/icons).
The files retain their original paths. Color is applied at render time.

takeUforward uses the site's actual white mark, downloaded from
`https://takeuforward.org/_next/static/media/logoWO.2gbeuz1--fwod.png`.
It is a raster asset supplied by the site, rather than a recreated wordmark.
