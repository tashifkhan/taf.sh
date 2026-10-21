# ascii-magic

Four pieces copied from [ascii-magic-art](https://www.npmjs.com/package/ascii-magic-art) 1.0.2 (MIT, see `LICENSE`). The library is at https://www.ascii-magic.com/ascii.

`pieces/` and `lib/kit.js` are upstream files, unchanged. Do not reformat them; copying a newer version over them should stay a clean diff. The upstream player and canvas runtime are not copied. `render.ts` replaces them: it writes spans with the site's text tokens instead of the pieces' hex colours, so the art follows the theme.

`own/` holds pieces written for this site on the same kit. `own/tashif-codes.js` reads its traffic figures from `src/data/web-presence.json`.

To add a piece, copy `pieces/<slug>.js` from the package and use `<AsciiArt piece="<slug>" />`. Preview a frame in the terminal with `npx ascii-magic-art <slug> --frame`. Pieces drawn mostly with colour, such as photo halftones, turn to grey mush once the hues are folded into tokens, so check before using one.
