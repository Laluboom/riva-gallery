# The Riva Gallery

A personal site as a walkable 3D museum. Four rooms along a corridor — customs,
writing, books, and the person behind them — built from the content of
[therivagallery.com](https://therivagallery.com).

Next.js 14 · TypeScript · React Three Fiber · Tailwind · Zustand

## Running it

```bash
npm install
npm run dev
```

## How the content gets here

Nothing in `src/data/` is written by hand. Three scripts turn the captured
WordPress source into the data the gallery reads:

```bash
node scripts/prepare-assets.mjs    # originals -> webp at three sizes
node scripts/convert-content.mjs   # block HTML -> journal/pages/books/quotes
node scripts/build-rooms.mjs       # -> src/data/content.ts
```

They read `_source_site/`, which is **gitignored** — it holds the unoptimised
originals and raw API payloads. The generated output in `src/data/` and
`public/gallery/` is committed, so a clone builds and deploys without it. To
change content you need the source directory; to deploy you don't.

`src/data/content.ts` is generated. Edit `scripts/build-rooms.mjs` instead.

## Things worth knowing

- **Four rooms, not five.** The Travel room was dropped — only one published
  travel post existed, and it hangs in the Journal Wing instead.
- **Articles open as an overlay.** `@modal` parallel routes intercept
  `/journal/[slug]` and `/pages/[slug]` so the WebGL canvas is never unmounted.
  The full-page routes still serve direct links and crawlers.
- **Textures are disposed on unmount.** drei's `useTexture` caches through
  `useLoader`, so rooms walking out of range must release them explicitly or
  GPU memory climbs for the whole session.
- **Portrait gets its own camera composition**, not a wider lens — a 16-unit
  room cannot show both side walls on a phone without filling the frame with
  floor and ceiling.
- **No WebGL?** `GalleryIndex` renders the whole gallery as a flat page.
  `?no3d=1` forces it.

## Before going live

`contactEmail` in `src/data/site.json` is empty, so the contact exhibit falls
back to Instagram. Set it and re-run `node scripts/build-rooms.mjs`.

`MIGRATION_PLAN.md` documents the source site, the room mapping and the design
reasoning. `CONCEPT.md` is the original brief.
