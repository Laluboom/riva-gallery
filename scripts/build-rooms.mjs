/**
 * Assembles the four gallery rooms from the converted site data and writes
 * src/data/content.ts.
 *
 * Rooms, after the decision to drop the Travel room (only one published travel
 * post existed, and it folds into the Journal Wing):
 *
 *   0  the featured collection  — hero + four customs pieces        (5 slots)
 *   1  the journal wing         — soc series wall + five essays     (6 slots)
 *   2  the library              — sixteen books                    (16 slots)
 *   3  the artist's studio      — about, résumé, quotes, contact     (4 slots)
 *
 *   node scripts/build-rooms.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'



const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'src', 'data')

const read = async (f) => JSON.parse(await readFile(path.join(DATA, f), 'utf8'))

/** Same file src/data/site.ts reads, so the two can never drift apart. */
const site = JSON.parse(await readFile(path.join(DATA, 'site.json'), 'utf8'))
const CONTACT_EMAIL = site.contactEmail
const INSTAGRAM_URL = site.instagramUrl
const journal = await read('journal.json')
const pages = await read('pages.json')
const booksData = await read('books.json')
const books = booksData.books
const quotes = await read('quotes.json')

const ROOM_SPACING = 22

const GOLD = '#C9A84C'
const OXBLOOD = '#501511'
const CREAM = '#FFF8EE'

const bySlug = Object.fromEntries(journal.map((p) => [p.slug, p]))

/** Five essays for the standalone Journal walls, chosen in §8 Q2. */
const FEATURED_ESSAYS = [
  'starting-point',
  'i-love-experiencing-heartbreak',
  'redefining-ambition',
  'unreliable-narrator',
  'place-people',
]

/**
 * Exhibits with no photograph fall back to a procedural texture, which needs a
 * gradient to draw on or it renders black. Parchment, so an index or quote wall
 * reads as a printed panel hanging on the wall.
 */
const PAPER = { gradientFrom: '#F6EFE2', gradientTo: '#E6D9C2' }

/** imageUrl is the wall texture; fullUrl is the full-size file for 2D panels. */
const img = (a) =>
  a
    ? { imageUrl: a.tex ?? a.full, fullUrl: a.full, thumbUrl: a.thumb, aspect: a.aspect }
    : { ...PAPER }

// ---------------------------------------------------------------- room 0

const customs = pages['customs']
const home = pages['home']

/**
 * Four distinct pieces chosen from the 21-image customs gallery — one per kind
 * of object, rather than the first four, which repeat the same jacket. Indices
 * refer to the order images appear in page--customs.html.
 */
const FEATURED_CUSTOMS = [
  { idx: 0, title: 'hand-painted denim jacket', medium: 'acrylic on denim' },
  { idx: 6, title: 'hand-painted sneakers', medium: 'acrylic on leather' },
  { idx: 9, title: 'hand-painted card holder', medium: 'acrylic on leather' },
  { idx: 20, title: 'painted rock', medium: 'acrylic on stone' },
]

/** The author's own description of the customs work, from page--customs. */
const CUSTOMS_BLURB = customs.text
  .split('\n\n')
  .find((p) => p.includes('making customs'))

const featuredCustoms = FEATURED_CUSTOMS.map((pick, i) => ({
  id: `custom-${i + 1}`,
  title: pick.title,
  subtitle: 'customs',
  category: 'artwork',
  medium: pick.medium,
  description: CUSTOMS_BLURB,
  longDescription:
    'A collection of personal, functional art. Pieces made to be used, worn, or just make a space feel a little more you.\n\nAka “art made to be lived with”.',
  ...img(customs.images[pick.idx] ?? null),
  accentColor: GOLD,
  frameStyle: 'ornate',
  size: i === 0 ? 'large' : 'medium',
  link: INSTAGRAM_URL,
  metadata: { enquiries: `instagram ${site.instagramHandle}` },
}))

const room0 = {
  id: 'featured',
  name: 'the featured collection',
  subtitle: 'art made to be lived with',
  wallColor: CREAM,
  accentColor: GOLD,
  exhibits: [
    {
      id: 'hero-intro',
      title: 'the riva gallery',
      // No photograph: a plaque's second line reads as the artist, so hanging a
      // painted object here would attribute it to Van Gogh.
      subtitle: 'welcome',
      category: 'about',
      description: '“What is done with love is done well.” — Vincent Van Gogh',
      longDescription: home.text
        .split('\n\n')
        // The quote and its attribution are their own paragraphs on the live
        // home page; both belong in the plaque heading, not the body.
        .map((p) => p.trim())
        .filter((p) => p && !p.startsWith('“What is done') && p !== 'Vincent Van Gogh')
        .slice(0, 3)
        .join('\n\n'),
      ...PAPER,
      accentColor: GOLD,
      frameStyle: 'ornate',
      size: 'large',
      tags: ['welcome'],
    },
    ...featuredCustoms,
  ],
}

// ---------------------------------------------------------------- room 1

const socPosts = journal.filter((p) => p.isSoc).sort((a, b) => a.date.localeCompare(b.date))

const socWall = {
  id: 'soc-series',
  title: 'soc',
  subtitle: `stream of consciousness · ${socPosts.length} parts`,
  category: 'journal',
  description:
    'An ongoing run of unedited thinking — written in one sitting, published without tidying up.',
  longDescription:
    'The soc posts are the least curated thing in the gallery, which is the point. They are collected here as a single body of work rather than scattered through the archive.',
  ...img(socPosts[socPosts.length - 1]?.cover ?? null),
  accentColor: OXBLOOD,
  frameStyle: 'minimal',
  size: 'wide',
  collection: {
    kind: 'series',
    items: socPosts.map((p) => ({
      title: p.title,
      subtitle: p.date,
      href: `/journal/${p.slug}`,
      meta: `${p.words} words`,
    })),
  },
}

const essayExhibits = FEATURED_ESSAYS.map((slug) => {
  const p = bySlug[slug]
  if (!p) throw new Error(`featured essay not found: ${slug}`)
  return {
    id: `journal-${p.slug}`,
    title: p.title,
    subtitle: p.date,
    year: p.year,
    category: 'journal',
    description: p.excerpt,
    ...img(p.cover),
    accentColor: OXBLOOD,
    frameStyle: 'minimal',
    size: 'medium',
    link: `/journal/${p.slug}`,
    metadata: { published: p.date, length: `${p.words} words` },
  }
})

const room1 = {
  id: 'journal',
  name: 'the journal wing',
  subtitle: 'thoughts that don’t quite fit anywhere else',
  wallColor: CREAM,
  accentColor: OXBLOOD,
  exhibits: [
    socWall,
    ...essayExhibits,
    {
      id: 'journal-archive',
      title: 'the full archive',
      subtitle: `all ${journal.length} entries`,
      category: 'journal',
      description: 'Everything written here, by year.',
      link: '/journal',
      ...PAPER,
      accentColor: OXBLOOD,
      frameStyle: 'minimal',
      size: 'small',
      collection: {
        kind: 'archive',
        items: journal.map((p) => ({
          title: p.title,
          subtitle: p.date,
          href: `/journal/${p.slug}`,
          meta: `${p.words} words`,
          thumbUrl: p.cover?.thumb,
        })),
      },
    },
  ],
}

// ---------------------------------------------------------------- room 2

const room2 = {
  id: 'library',
  name: 'the library',
  subtitle: booksData.note ? 'book reviews' : 'book reviews',
  wallColor: CREAM,
  accentColor: OXBLOOD,
  exhibits: books.map((b) => ({
    id: `book-${b.slug}`,
    title: b.title,
    subtitle: b.author,
    category: 'book',
    description: b.review
      ? b.review.slice(0, 220)
      : b.rating
        ? `Rated ${b.rating}. No written review.`
        : 'In the collection; not yet rated or reviewed.',
    longDescription: b.review || undefined,
    ...img(b.cover),
    accentColor: OXBLOOD,
    frameStyle: 'book',
    size: 'small',
    metadata: b.rating ? { rating: b.rating } : undefined,
  })),
}

// ---------------------------------------------------------------- room 3

const RESUME_CHILDREN = [
  'consulting-and-strategy',
  'leadership-impact',
  'consult-your-community',
  'case-competitions',
  'ai-consulting-unc',
  'the-big-leaf-safe-start',
  'side-quests-2',
  'the-overflow',
  'sos',
]

const about = pages['about-me']

const room3 = {
  id: 'studio',
  name: 'the artist’s studio',
  subtitle: 'the person behind the work',
  wallColor: CREAM,
  accentColor: OXBLOOD,
  exhibits: [
    {
      id: 'about-me',
      title: 'hi! i’m riva.',
      subtitle: 'about me',
      category: 'about',
      description: about.text.split('\n\n')[1] ?? about.text.slice(0, 220),
      longDescription: about.text.split('\n\n').slice(1).join('\n\n'),
      ...img(about.images[0] ?? null),
      accentColor: GOLD,
      frameStyle: 'ornate',
      size: 'large',
      link: INSTAGRAM_URL,
    },
    {
      id: 'resume',
      title: 'résumé',
      subtitle: 'work, leadership and side quests',
      category: 'project',
      description:
        'Consulting, case competitions, leadership work and the side quests that did not fit anywhere else.',
      ...img(pages['resume'].images[0] ?? null),
      accentColor: OXBLOOD,
      frameStyle: 'minimal',
      size: 'medium',
      collection: {
        kind: 'index',
        items: RESUME_CHILDREN.map((slug) => ({
          title: pages[slug].title || slug.replace(/-/g, ' '),
          subtitle: pages[slug].text.split('\n\n')[1]?.slice(0, 120) ?? '',
          href: `/pages/${slug}`,
          meta: pages[slug].images.length ? `${pages[slug].images.length} images` : '',
        })),
      },
    },
    {
      id: 'quotes',
      title: 'words i live by',
      subtitle: `${quotes.length} quotes`,
      category: 'about',
      ...PAPER,
      description: quotes[0] ? `“${quotes[0].text.replace(/^“|”$/g, '')}”` : '',
      accentColor: OXBLOOD,
      frameStyle: 'minimal',
      size: 'medium',
      collection: {
        kind: 'quotes',
        items: quotes.map((q) => ({ title: q.text, subtitle: q.attribution })),
      },
    },
    {
      id: 'contact',
      title: 'let’s talk!',
      subtitle: 'contact',
      category: 'about',
      ...PAPER,
      // The live page's "use the form" wording is dropped: the WordPress form
      // does not survive the migration.
      description:
        'Ask me anything, or just say hello. I’m always looking for new friends, so feel free to reach out.',
      longDescription: CONTACT_EMAIL
        ? `Email: ${CONTACT_EMAIL}\n\nInstagram: @therivagallery`
        : 'Instagram: @therivagallery',
      accentColor: GOLD,
      frameStyle: 'ornate',
      size: 'medium',
      link: CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : INSTAGRAM_URL,
      metadata: CONTACT_EMAIL
        ? { email: CONTACT_EMAIL, instagram: '@therivagallery' }
        : { instagram: '@therivagallery' },
    },
  ],
}

// ---------------------------------------------------------------- emit

const rooms = [room0, room1, room2, room3]

const banner = `// GENERATED FILE — do not edit by hand.
// Produced by scripts/build-rooms.mjs from the content captured in _source_site/.
// Re-run:  node scripts/prepare-assets.mjs && node scripts/convert-content.mjs && node scripts/build-rooms.mjs

import { GalleryRoom } from '@/types'

export const GALLERY_ROOMS: GalleryRoom[] = ${JSON.stringify(rooms, null, 2)}

/** Room groups are spaced along -Z; one entry per room. */
export const ROOM_POSITIONS = [${rooms.map((_, i) => i * -ROOM_SPACING).join(', ')}]
export const CAMERA_HEIGHT = 1.6
export const ROOM_WIDTH = 16
export const ROOM_HEIGHT = 8
export const ROOM_DEPTH = 22
`

await writeFile(path.join(DATA, 'content.ts'), banner)

for (const r of rooms) console.log(`${r.id.padEnd(10)} ${r.exhibits.length} exhibits  "${r.name}"`)
console.log('total exhibits:', rooms.reduce((n, r) => n + r.exhibits.length, 0))
