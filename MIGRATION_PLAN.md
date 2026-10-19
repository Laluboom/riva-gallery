# The Riva Gallery — Migration Plan

Moving the live WordPress.com site at **therivagallery.com** into the immersive 3D
gallery concept in this repo.

Source material captured 2026-10-19 into `_source_site/` (gitignored — see
[§9 Before any commit](#9-before-any-commit)).

---

## 1. What was captured

| Path | Contents |
|------|----------|
| `_source_site/meta/index.json` | Master index — 58 items, title / slug / date / URL / word count / categories / excerpt |
| `_source_site/content/<kind>--<slug>.html` | Raw WordPress block HTML per item |
| `_source_site/content/<kind>--<slug>.txt` | Plain-text body |
| `_source_site/content/<kind>--<slug>.json` | Per-item metadata |
| `_source_site/assets/**` | **202 images, 81 MB**, original (unsized) files, original upload paths preserved |
| `_source_site/meta/asset_manifest.json` | url → local path → `used_by` slugs |
| `_source_site/meta/books.json` | 16 books: cover file, rating, review text |
| `_source_site/meta/quotes.json` | 19 quotes with attributions |
| `_source_site/meta/embeds.json` | 7 YouTube embeds (URLs only, video not downloaded) |
| `_source_site/meta/design_tokens.json` | 131 live CSS custom properties |
| `_source_site/meta/api_raw/` | Unprocessed WordPress REST payloads |
| `_source_site/meta/live_home_rendered.html` | Served homepage HTML |

**Totals:** 39 posts · 19 pages · 29,087 words · 202 images · 7 video embeds.

**Method.** Content came from the WordPress.com public REST API
(`public-api.wordpress.com/rest/v1.1/sites/217920407`) rather than HTML scraping —
it is the primary source and returns complete, structured records. Images were
deduplicated by upload path across host variants and `-WxH` size suffixes, so each
file is the original, not a thumbnail.

**One gap:** `b.gif` (a WordPress analytics pixel) failed to download. Irrelevant.

**Screenshots.** Seven captures in `_source_site/screenshots/`: `home-top`,
`home-cards-gold-frames`, `blog-index-grid`, `customs-tiled-gallery`, `books-top`,
`about-me`, `quotes`. Viewport-height only, not full-page — headless Firefox
refused to run (an instance was already using the default profile, and custom
profile dirs were rejected), so these came from the in-app browser pane after
forcing lazy images to load. **Not captured:** contact, resume and the 8 résumé
sub-pages, and an individual post page. The WordPress *block markup* in
`_source_site/content/*.html` remains the authoritative layout record; every
block class name is preserved there.

---

## 2. The live site as it actually is

### Navigation (5 items, all lowercase)

| Label | Target | Note |
|-------|--------|------|
| home | `/` | Quote hero + 2×2 card grid |
| blog | `/193-2/` | **Not** `/blog/` — see orphans below |
| customs | `/customs/` | The art |
| about me | `/about-me/` | Served from the `.wordpress.com` host |
| let's talk! | `/contact/` | Served from the `.wordpress.com` host |

### Homepage structure

1. Centred quote — *"What is done with love is done well."* — Vincent Van Gogh
2. Separator rule
3. Intro paragraph (links out to `/quotes/`)
4. "Welcome to The Riva Gallery."
5. Separator rule
6. **2×2 grid** (`wp-block-columns` × 2) of four image cards:

| Card | Links to | Blurb |
|------|----------|-------|
| customs | `/customs/` | "A collection of personal, functional art… *art made to be lived with*" |
| blog | `/193-2/` | "My blog! …musings on life, little joys, heartbreaks, questions" |
| books | `/books/` | "A growing archive of books I've read" |
| **travel** | **nothing** | "From handmade souvenirs to filmed memories…" |

> **The travel card has no `href`.** The travel section is promised on the homepage
> but does not exist on the live site. See [§8 Question 1](#8-questions-for-you).

### Content by section

| Section | Source | Volume |
|---------|--------|--------|
| Customs (art) | `page--customs` | 4 paragraphs + Jetpack tiled gallery of **21 images**; Instagram `@therivagallery` |
| Blog | 39 posts | 29k words total; longest 1,449 words; 60 in-post images |
| Books | `page--books` | 16 books, `wp-block-media-text` pairs, ratings 5/10–10/10 |
| Quotes | `page--quotes` | 19 `blockquote` blocks |
| About | `page--about-me` | 259 words, first person, 3 images |
| Contact | `page--contact` | Form + Instagram, 36 words |
| Résumé tree | `page--resume` + 8 children | Consulting & Strategy, Leadership & Impact, Consult Your Community (41 imgs), Case Competitions (9 imgs), AI Consulting @ UNC, The Big Leaf, Side Quests, The Overflow |
| SOS | `page--sos` | "shiny object syndrome" — learning fragments |

### Blog post shape

Six posts carry a real category — `viewpoints` ×2, `checkpoints` ×2,
`introductions` ×1, `learning!` ×1. **33 of 39 are `Uncategorized` only**, and
**no post has tags at all**. There is a visible informal series — `soc #1`–`#6` ("stream of
consciousness") — encoded only in titles.

### Orphans and duplicates — do not map these silently

| Slug | Issue |
|------|-------|
| `193-2` | The *live* blog index. Nav points here. |
| `blog` | A near-identical duplicate (84,436 vs 84,483 chars). Unlinked. |
| `1437-2` | Untitled, 10 words. Dead. |
| `sos` | Real content, not in nav, reachable only from `/side-quests-2/`. |

---

## 3. Live design tokens (measured, not guessed)

Taken from the served `global-styles-inline-css` and computed styles:

| Token | Live value |
|-------|-----------|
| Background | `#fff8ee` — warm cream |
| Foreground | `#000000` — pure black |
| Primary | `#501511` — deep oxblood |
| Body + heading face | **Libre Franklin** (sans), fallback `-apple-system, BlinkMacSystemFont, "Helvetica Neue"` |
| Base body size | `22.6px` — unusually large |
| Page heading (`h2`) | `56.2px` / 700 — e.g. "book reviews", "words i live by" |
| Hero quote (`h3`) | `47.0px` / 700 |
| Wordmark (`h1`) | `22.35px` / 700, `text-transform: uppercase` |
| Type scale | Fluid `clamp()`, `--wp--preset--font-size--x-small` → `xxxxx-large` |
| Alignment | Homepage centred, narrow measure; inner pages left-aligned |
| Casing | Markup is lowercase throughout; **only the wordmark is uppercased, via CSS** |

### Where the concept agrees with the live site — and where it does not

**The concept's museum metaphor is not an invention. It is the author's own.**
The homepage's four cards are not plain images: each is mounted in an elaborate
**ornate gilded picture frame**, pre-composited into the image file
(`site-gallery-1-3.png`, `-2-3.png`, `-5.png`). The site logo is a gold sunburst.
See `_source_site/screenshots/home-cards-gold-frames.jpg`.

So `frameStyle: 'ornate'` and museum gold are *faithful*, not imposed. This
reverses the obvious first reading of the live site as plain and minimal.

| Concept says | Live site says | Resolution |
|---|---|---|
| Ornate gold frames | Ornate gold frames, already | **Keep.** It is the author's device. |
| Museum gold `#C9A84C` | Gilt frames + gold sunburst logo | **Keep** as frame/accent metal |
| Deep warm black `#1A1410` scene | — (no 3D equivalent) | Keep; it is the void outside the rooms |
| Wall near-whites `#F8F6F1`–`#F0ECE4` | Ground is `#fff8ee` | **Change** walls to `#fff8ee` |
| Parchment `#F4EFE6` panels | `#fff8ee` | **Change** to match |
| Playfair Display + Inter | **Libre Franklin only** | **Change.** See below. |
| — | Primary `#501511` oxblood | **Add** as link/active colour |
| Title Case room names | lowercase markup everywhere | **Change.** See §5.5. |

**Typography is the one real departure.** The live site runs a single sans face
(Libre Franklin) at a large 22.6px body with a strong 2.5× heading jump. The
concept proposes a Playfair/Inter serif-display pairing. Recommendation: **adopt
Libre Franklin as the body and UI face**, and keep a serif only for museum plaques
and room names, where the typographic register does real work. Do not use Playfair
for body copy — it is not this site's voice.

**Casing.** Every heading, nav label and page title in the live markup is
lowercase: "book reviews", "words i live by", "about me", "let's talk!",
"customs". Only the wordmark is uppercased, and that is a CSS `text-transform`,
not the content. Mirror this exactly.

## 4. Room mapping

> **Superseded by §8.** This section records the five-room analysis that led to
> the decisions; the Travel room was dropped and the Library layout changed.

The concept has **five rooms with 28 hard-coded wall slots** in
`src/components/gallery/GalleryScene.tsx` (`EXHIBIT_LAYOUTS`: 5, 6, 5, 8, 4).

| # | Concept room | Live source | Slots | Fit |
|---|-------------|-------------|-------|-----|
| 0 | Featured Collection | `page--home` hero + best customs | 5 | Good |
| 1 | The Journal Wing | 39 blog posts | 6 | **39 → 6. Needs curation + archive.** |
| 2 | Travel Gallery | *does not exist* | 5 | **Blocked — see Q1** |
| 3 | The Library | 16 books | 8 | **16 → 8. Needs rotation or a second wall.** |
| 4 | The Artist's Studio | about + résumé tree + quotes + contact | 4 | **12 pages → 4. Needs sub-navigation.** |

### Proposed per-room content

**Room 0 — Featured Collection.** Hero plaque carries the Van Gogh quote and the
"Welcome to The Riva Gallery" line verbatim from `page--home.txt`. Four signature
customs pieces from the 21-image gallery. Links to Instagram `@therivagallery`.

**Room 1 — The Journal Wing.** Six featured posts on walls; everything else in an
archive panel. Suggested featured set, weighted toward the pieces with images and
length:

| Post | Date | Words |
|------|------|-------|
| starting point | 2023-04-01 | 170 (+12 imgs) — the origin story |
| i love experiencing heartbreak | 2024-12-08 | 1,449 |
| redefining ambition | 2025-05-24 | 1,268 |
| soc #4 | 2026-02-12 | 1,155 |
| unreliable narrator | 2026-10-05 | 1,129 — most recent |
| place = people | 2025-10-22 | 775 (+4 imgs) |

A seventh wall element — an "archive" plaque — opens a scrollable index of all 39,
grouped by year, with the `soc #` series called out as its own run.

**Room 2 — Travel Gallery.** No source content. Options in Q1.

**Room 3 — The Library.** All 16 books, real cover images, rating on the plaque,
review in the modal. The existing Library layout already uses two heights
(`ROOM_HEIGHT * 0.62` and `* 0.38`) across two Z positions on each side wall =
8 slots. Reaching 16 means **adding two more Z positions per side wall**
(`-ROOM_DEPTH * 0.2` and `* 0.35`, keeping both heights) — eight new entries in
the `EXHIBIT_LAYOUTS[3]` array. No new geometry, no third row.

**Room 4 — The Artist's Studio.** Four walls: *about me* (portrait + 259 words),
*résumé* (opens a sub-index of the 8 child pages), *quotes* (all 19 in a scroll
panel), *let's talk* (contact + Instagram). SOS and Side Quests sit under résumé.

---

## 5. Code changes required

Read against the actual source, not `CONCEPT.md`.

### 5.1 Real images — the blocking change

`Exhibit.imageUrl` is **declared in `src/types/index.ts:13` and used nowhere.**
Every texture today is procedural: `ArtworkFrame.tsx:190` `createArtTexture()`
builds a `CanvasTexture` through six drawing routines
(`drawAbstractArt`, `drawJournalTexture`, `drawTravelTexture`, `drawBookTexture`,
`drawProjectTexture`, `drawAboutTexture`).

The migration replaces invented art with the author's actual art, so this must
change:

- In `ArtworkFrame.tsx`, branch: if `exhibit.imageUrl` is set, load it with
  `useTexture` from `@react-three/drei`; otherwise fall back to
  `createArtTexture()`. Keep the procedural path — it is the loading placeholder
  and the fallback for text-only exhibits.
- Set `texture.colorSpace = THREE.SRGBColorSpace` or the author's images will
  render washed out against `ACESFilmicToneMapping`.
- Derive frame aspect ratio from the image, not from the `size` enum. Square gold
  frames around 4:5 photographs will look wrong.
- Wrap the scene in `<Suspense>` with a per-frame fallback; `useTexture` suspends.

### 5.2 Asset pipeline

81 MB of originals cannot ship.

- Resize to max 1600px on the long edge, encode webp q80, generate a 320px
  placeholder. Target **under 8 MB total**.
- Output to `public/gallery/<room>/<slug>.webp`.
- Write a build script `scripts/prepare-assets.mjs` reading
  `_source_site/meta/asset_manifest.json` and emitting `src/data/assets.json`.
- Load per room: only the current room ±1 holds decoded textures. Call
  `texture.dispose()` on rooms more than one away. With ~35 wall textures live at
  1600px this is roughly 300 MB of VRAM if never disposed — enough to crash a
  phone.

### 5.3 Long-form text needs a 2D route

Essays run to 1,449 words. `ExhibitModal.tsx:100` renders `longDescription` by
`.split('\n\n')` into plain `<p>` elements — **plain text only**. It cannot carry
formatted prose, blockquotes, inline images or the 7 YouTube embeds.

- Add `src/app/journal/[slug]/page.tsx` — a normal server-rendered reading page.
- `Exhibit.link` **is already wired**: `ExhibitModal.tsx:122` renders an anchor
  when it is set. Point it at the new route — no component change needed for this
  part.
- Modal shows title, date, excerpt, first image, and "read in full →".
- This also gives SEO and a no-WebGL fallback the 3D-only concept has none of.

### 5.4 Content conversion

- Convert each `_source_site/content/*.html` from WordPress block HTML to MDX or
  sanitised HTML. Strip `wp-block-*` classes; map `wp-block-quote`,
  `wp-block-image`, `wp-block-media-text`, `wp-block-jetpack-tiled-gallery`,
  `wp-block-embed` to local components.
- Rewrite every `therivagallery.com/wp-content/uploads/...` URL to the local
  `public/` path using the manifest.
- Preserve the 7 YouTube embeds as lazy `<LiteYouTube>` — they are part of specific
  posts' meaning (songs in *can't help falling in love*, *rewriting a classic
  journey*).
- Generate `src/data/content.ts` from the source files. **The current file is 100%
  invented** — "Chromatic Tensions", "Still Life with Correspondence", 29
  placeholder exhibits. All of it gets deleted.

### 5.5 Layout table

`EXHIBIT_LAYOUTS` in `GalleryScene.tsx:11` is a hard-coded array of 28 positions
with `idx` pointing into `room.exhibits`. Extending the Library to 16 and the
Studio to a sub-navigated 4 means editing this table. Adding a 7th Journal slot
for the archive plaque means one more entry. No geometry code changes.

**Casing.** Room names come from `GALLERY_ROOMS` in `content.ts`, but
`Navigation.tsx` uppercases them at render — `room.name.toUpperCase()` at both
line 43 and line 117. To match the live site's lowercase voice, drop both
`.toUpperCase()` calls and lowercase the names in `content.ts`. The hard-coded
`ROOM {n} / {total}` label at `Navigation.tsx:114` needs the same treatment.

### 5.6 Redirects

Preserve WordPress permalinks so existing links survive:
`/YYYY/MM/DD/<slug>/` → `/journal/<slug>`, plus `/193-2/` → `/journal`,
`/customs/` → `/#room-0`, `/books/` → `/#room-3`.

---

## 6. Design philosophy for the transition

**What the live site is.** Warm, lowercase, first-person, text-generous — and
already committed to the gallery metaphor. The name is "the riva gallery". The
homepage cards hang in gilded frames. The logo is a gold sunburst. The about page
describes the site as starting out "as a space for my art, specifically, the kind
of art that's meant to be lived with". It is a personal site *pretending to be a
gallery already*, and enjoying the pretence.

**What the concept adds.** It makes the pretence literal: spatial sequence,
walking pace, plaque-and-frame as real geometry rather than a composited border.

**This is unusually well matched.** The usual risk in a migration like this — the
redesign imposing a metaphor the source never asked for — does not apply. The
author got there first. The 3D gallery is a faithful extension of an existing
device, not a reinterpretation.

**The real risk is the opposite one: grandeur.** The site's thesis is *"art made
to be lived with"* — a denim jacket, a tote bag, a water bottle, a necklace. If
the rooms read as a cold institutional museum, the work stops being livable. The
frames can be gilded (the author's are), but the space around them should feel
domestic and warm, not marble and hushed.

**The rule for every decision.** Use museum *grammar* (frame, plaque, raking
light, sequence) at the author's *scale and register* (warm cream, gilt, oxblood,
lowercase, Libre Franklin, plain first-person speech). Plaques carry the author's
own words verbatim — never rewritten into curatorial third person. Where a blurb
is needed, take it from `page--home.txt`; those four card blurbs are already
perfect plaque copy.

**Concretely:**
- Keep `frameStyle: 'ornate'` genuinely ornate. Reference the real frames in
  `_source_site/screenshots/home-cards-gold-frames.jpg` — they are heavy,
  carved, rococo. A thin gold rectangle would be a downgrade.
- Walls become `#fff8ee`, not the concept's cooler near-whites.
- Keep the warm fog and raking spots; drop any marble, granite or stone material.
- Room names lowercase: "the journal wing", not "The Journal Wing".
- Keep the entry quote exactly as written, with the Van Gogh attribution.
- Blog index already has a strong pattern — a 4-column image grid with lowercase
  captions (`screenshots/blog-index-grid.jpg`). Reuse it for the Journal archive
  panel rather than inventing a list view.

---

## 7. Sequence

| # | Step | Depends on |
|---|------|-----------|
| 1 | Resolve Q1–Q3 below | — |
| 2 | `scripts/prepare-assets.mjs` → optimised webp into `public/` | — |
| 3 | HTML → MDX converter + URL rewriting | 2 |
| 4 | Generate real `src/data/content.ts`, delete placeholders | 3 |
| 5 | `imageUrl` support + colorSpace + aspect ratio in `ArtworkFrame.tsx` | 2 |
| 6 | Per-room texture load/dispose | 5 |
| 7 | `/journal/[slug]` route + modal "read in full" | 3 |
| 8 | Theme tokens → `tailwind.config.ts` + `globals.css` | 1 |
| 9 | Extend `EXHIBIT_LAYOUTS` (Library 16, Journal archive slot) | 4 |
| 10 | Archive / sub-index panels for Journal and Studio | 7 |
| 11 | Redirects | 7 |
| 12 | Mobile + no-WebGL fallback | 7 | ✅ |

Steps 2–4 are mechanical. Step 5 is the real engineering. Steps 1 and 8 are
judgement calls that need the author.

---

## 8. Decisions taken

Settled with the site's owner on 2026-10-19, and already implemented.

| # | Question | Decision |
|---|----------|----------|
| 1 | Travel room | **Dropped.** Only one genuine travel post exists. The gallery is four rooms; `place = people` hangs in the Journal Wing. |
| 2 | Journal curation | **The soc series gets its own wall.** `soc #1`–`#6` are presented as one body of work on the back wall; five standalone essays on the side walls; an archive panel links all 39. |
| 3 | Typography | **Libre Franklin + serif plaques.** Libre Franklin for all body, UI and page headings (matching the live site's 700-weight headings); Playfair Display only on 3D plaques, room labels and modal titles. |
| 4 | Résumé tree | **One Studio wall with a sub-index.** The résumé exhibit opens a panel listing all 8 sub-pages, each with its own 2D reading page. |

Ownership confirmed by the user; `_source_site/` remains gitignored regardless.

---

## 8b. What is built

```
scripts/prepare-assets.mjs   202 originals (80 MB) -> webp + thumbs (16 MB)
scripts/convert-content.mjs  block HTML -> journal/pages/books/quotes JSON
scripts/build-rooms.mjs      -> src/data/content.ts (generated; do not hand-edit)
```

- **32 exhibits across 4 rooms**, 29 carrying real photographs.
- **58 static pages**: the gallery, `/journal`, 39 `/journal/[slug]`, 14 `/pages/[slug]`.
- `ArtworkFrame` loads real textures via `useTexture`, in sRGB, with the frame
  fitted to each picture's aspect ratio; the procedural texture is now the
  loading placeholder and the fallback for text-only exhibits.
- Rooms more than one step away have their frames unmounted, and their textures
  are disposed. **Measured** with `gl.info.memory.textures`: 29 in room 0, 39 in
  room 2–3, back to 29 after two full round trips — stable, no growth.
- Wall textures are a separate 800px variant (`.tex.webp`); the 1400px file is
  used only by the 2D panels and reading pages, where the screen space is real.
- `GalleryIndex` renders the whole gallery as a flat page. It is `sr-only` when
  WebGL works (crawlers, screen readers) and **visible** when it does not, so a
  browser without WebGL gets the site rather than a dark screen. `?no3d=1`
  forces it, and the entry screen links to it as "or browse without 3d". It is
  rendered outside the `isLoading` branch so it is present in the **server**
  HTML — behind that flag, a crawler saw only the loading screen.
- **Mobile is handled with a different composition, not a wider lens.** three.js
  `fov` is vertical, so at 375×812 a 65° fov yields ~33° horizontally and both
  side walls leave the frame; widening the fov enough to compensate just fills
  the screen with floor and ceiling. Portrait instead uses fov 72, stands the
  viewer at 0.35 of the room depth, and tilts the gaze up by 0.9.
- **Horizontal touch-drag was added.** Touch does not synthesise `mousemove`,
  so look-left/right was mouse-only and every side-wall exhibit — most of the
  art — was unreachable on a phone. A gesture now locks to whichever axis it
  commits to: vertical walks between rooms, horizontal turns the view.
- **The portrait stand depth is load-bearing.** The shallowest side placement is
  at 0.45 of the depth, so an earlier value of 0.68 put several exhibits
  *behind* the viewer with no way to turn far enough. At 0.35, every placement
  in every room is ahead and within the ±82.8° look limit — checked against all
  nine distinct depths.
- WordPress permalinks redirect: `/YYYY/MM/DD/slug` → `/journal/slug`, plus
  `/193-2`, `/blog`, `/about-me`, `/contact`, `/customs`, `/quotes`, `/resume`.

### Changed from the original plan during the build

- **Library layout.** Ten books hang on the back wall as a grid, six on the side
  walls — not sixteen across two side walls as §4 proposed. At a 65° field of
  view from the middle of the room the side walls fall outside the view cone, so
  a side-wall-only Library read as an empty room.
- **Camera.** Moved to 30% into each room so everything hung between 0.45 and
  0.85 of the depth sits ahead of the viewer.
- **Floor.** The original parquet was saturated gold (`#8B6914`). Replaced with
  pale oak — the gold belongs on the frames, per §6.
- **Ambient light** raised from 0.4 to 0.72 so cream walls read as cream.
- **Overlay text recoloured for the cream walls.** Every colour in
  `Navigation.tsx` and `RoomLabel.tsx` had been chosen for a dark scene —
  the wordmark was `#F5EDD6`, cream on cream. Now near-black `#1A1410` /
  `#2A1E14` for primary text, `#5A4A38` muted, and oxblood `#501511` for the
  active state (gold `#C9A84C` fails against `#FFF8EE`). The room counter and
  hint sit on a translucent cream scrim, since small tracked-out text over
  parquet is unreadable whatever its colour.
- **The 3D room label was never visible.** It sat at `z = -0.05` — the doorway
  end of the room, behind the viewer — not on the back wall. Moved to
  `-ROOM_DEPTH + 0.1`, scaled up for the ~15-unit viewing distance, lowercased,
  and its rule moved above the subtitle so it clears the Library's top row.
- **Texture leak fixed.** drei's `useTexture` caches through `useLoader`, so
  unmounting a room freed nothing — the count climbed 29 → 49 walking to room 3
  and stayed there. `useTexture.clear(url)` plus `dispose()` on unmount, and the
  same for the procedural canvas textures and materials, makes it stable.
- **Build output moved to `.next-build`.** Running `next build` while `next dev`
  was up corrupted the dev server's `.next` and took the running site down.
- **Room 0 contents.** The first four customs images repeat the same denim
  jacket and include an unpainted necklace, so four distinct pieces are picked
  by index instead (jacket, sneakers, card holder, painted rock), titled by what
  they are and described in the author's own words. The hero exhibit carries no
  photograph: a plaque's second line reads as the artist, so hanging a painted
  object under "Vincent Van Gogh" would misattribute it.
- **Book extraction rewritten.** The first pass split the page on images and
  misaligned ratings with covers, and truncated reviews at 500 characters.
  Parsing by `wp-block-media-text` container fixes both. The live counts are
  16 books, 16 covers, **15 rated, 12 reviewed** — `how-will-you-measure-your-life`
  and `selection-series` are rated but unreviewed, and `the-lights-that-find-us`
  has neither. The page's closing note is held as a room note rather than being
  presented as a review of *Looking for Alaska*.
- **Escape key bug fixed.** `GalleryController.tsx:20` returned early while the
  modal was open, which removed the keydown listener at exactly the moment
  Escape needed to work. Escape now has its own always-on effect.

---

## 8c. Open before launch

- **`contactEmail` in `src/data/site.json` is empty.** No email address appears
  anywhere in the captured site, so the contact exhibit and `/pages/contact`
  show the Instagram link alone. Set it there — both `src/data/site.ts` and
  `scripts/build-rooms.mjs` read that one file — then re-run
  `node scripts/build-rooms.mjs`.
- **Mobile and no-WebGL are done and checked** at 375×812: no horizontal
  overflow on the gallery, the archive, a journal post, a résumé sub-page or the
  flat fallback; touch look verified with synthetic touch events, which brought
  a side-wall exhibit into frame. **Only an emulated viewport** — not a real
  device, and not tested in landscape on a phone.
- **The five featured essays are a guess**, picked by length and images. Swap the
  slugs in `FEATURED_ESSAYS` in `scripts/build-rooms.mjs` and re-run.
- **`public/gallery` is 26 MB across ~600 files.** `_source_site/` is gitignored,
  so a fresh clone cannot regenerate them. Committing the optimised images, using
  Git LFS, or not deploying from a clone is a call to make before the first
  commit.
- **Build output goes to `.next-build`** (`next.config.js`), because running
  `next build` while `next dev` was up corrupted the dev server's `.next`.
  Whatever host this deploys to needs to know that, or revert it and stop the
  dev server before building.

---

## 9. Before any commit

`_source_site/` is gitignored (`.gitignore:26`) and must stay that way. It holds
another person's blog, photographs, résumé and contact details, and this repo
pushes to a GitHub remote. Commit `8c51ad7` on this branch already stripped
personal content from `CONCEPT.md` once.

**Ownership was confirmed by the user on 2026-10-19**, so the converted content,
the optimised images in `public/gallery/`, and this plan may be committed.

`_source_site/` still stays out of the repo: it is 85 MB of unoptimised originals
and raw API payloads, and nothing in the build reads it at runtime. The three
scripts do, so regenerating content requires the captured source to be present.

**Nothing has been committed yet.**
