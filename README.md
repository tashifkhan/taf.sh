# taf.sh

smoll lil website for my software studio. lives at [taf.sh](https://taf.sh).

it's a static astro site wearing a cloudflare worker as a hat. no react, no client router, no 400kB of javascript to render a paragraph. you're welcome.

## what even is this

the place where i pretend to be a company. it has services, an about page, a contact page, and case studies for the stuff i've shipped:

- [TalentSync AI](https://taf.sh/products/talentsync/), resume roasting and career guidance for job seekers. free, because unemployment is expensive enough
- [TalentSync HR](https://taf.sh/products/talentsync-hr/), the same thing but for the people doing the rejecting
- [rah.clinic](https://taf.sh/products/rah-clinic/), a clinic that runs on whatsapp, because nobody is downloading your app
- [Systematic Reasoning](https://taf.sh/products/systematic-reasoning/), where i'm the founding engineer on ForgeIQX (compliance software, it's cooler than it sounds, trust)

## features (a subset, it keeps eating more)

- every stylesheet inlined into the html. there is no moment where the page exists unstyled. firefox can cope
- page navigation slides around with native view transitions. product names morph from the list into the page title and it's honestly the best part
- theme toggle does a circular reveal from the button you pressed. system, light, dark. pick your poison
- shader effects on product pages via canvas ui. they only run in chrome with a flag turned on, so roughly four people will ever see them. everyone else gets plain html and that's fine
- ascii art that animates. the 404 page has a broken link cloud
- `prefers-reduced-motion` turns all of the above off, as it should
- `llms.txt` and markdown copies of every page, so the robots can read it too

## stack

- astro 7 (static)
- tailwind v4, warm greys and exactly one teal
- ibm plex sans and mono
- a cloudflare worker that redirects `www` to the apex, serves the build, and proxies `/ph/*` to posthog so adblockers stay mad
- bun
- caffeine, questionable sleep schedule

## run it

you need bun 1.3 and node 22.12+.

```sh
bun install
bun dev            # localhost:4321
bun run build      # social images, astro build, crawler exports
bun run cf:dev     # build, then run it inside the worker locally
bun run deploy     # straight to prod. no staging. we live dangerously
```

after a deploy, `bun run seo:check:live` pretends to be every social crawler and checks the preview cards actually load.

## where stuff lives

```text
src/
  pages/        home, services, about, contact, work, products, proposals
  layouts/      StudioLayout is the only <head> on the site
  components/   studio sections, ProductPage, canvas effects, ascii art
  lib/          seo + social config, copied-in canvas-ui and ascii-magic
  styles/       global.css, all the design tokens
worker/         the cloudflare worker and its tests
scripts/        og image generation, crawler exports, seo checks
docs/seo.md     how metadata, sitemaps and crawler stuff fit together
```

## roadmap

- ship more things to put on this site
- touch grass
- stop redesigning the site every two weeks (not happening)

## wanna build something?

[taf.sh/contact](https://taf.sh/contact/). i reply within a day or two, unless i'm redesigning the site again.
