/**
 * Turns the captured WordPress block HTML into the data the gallery reads.
 *
 * Reads  _source_site/content/*.html + _source_site/meta/*.json
 *        src/data/assets.json (written by prepare-assets.mjs)
 * Writes src/data/journal.json  — 39 posts, cleaned bodies, local image paths
 *        src/data/pages.json    — the standalone pages (about, contact, resume tree, sos…)
 *        src/data/books.json    — 16 books with cover, rating, review
 *        src/data/quotes.json   — 19 quotes
 *
 *   node scripts/convert-content.mjs
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.join(ROOT, '_source_site')
const DATA = path.join(ROOT, 'src', 'data')

const assets = JSON.parse(await readFile(path.join(DATA, 'assets.json'), 'utf8'))
const index = JSON.parse(await readFile(path.join(SOURCE, 'meta', 'index.json'), 'utf8'))

/** The upload path is the stable key across every host and size variant WordPress serves. */
function assetKey(url) {
  const clean = decodeURIComponent(url).split('?')[0]
  const m = clean.match(/\/wp-content\/uploads\/(.+)$/)
  if (!m) return null
  return m[1].replace(/-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i, '')
}

function lookup(url) {
  const key = assetKey(url)
  return key ? assets[key] ?? null : null
}

function youtubeId(url) {
  const m =
    url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ?? null
  return m ? m[1] : null
}

function decode(s) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', '#039': "'", apos: "'", nbsp: ' ',
    hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
    rdquo: '”', ldquo: '“', '#8217': '’', '#8216': '‘', '#8220': '“',
    '#8221': '”', '#8211': '–', '#8212': '—', '#8230': '…',
  }
  return s.replace(/&([a-z#0-9]+);/gi, (full, e) => named[e] ?? full)
}

function textOf(html) {
  return decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h[1-6]|li|blockquote|figcaption)>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Collect every image in a body, in document order, resolved to local webp. */
function imagesIn(html) {
  const out = []
  const seen = new Set()
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)) {
    const a = lookup(m[1])
    if (!a || seen.has(a.full)) continue
    seen.add(a.full)
    const alt = m[0].match(/alt="([^"]*)"/i)
    out.push({ ...a, alt: alt ? decode(alt[1]) : '' })
  }
  return out
}

/**
 * WordPress block markup carries presentation we do not want, but the structure
 * (figures, quotes, media-text pairs, embeds) is meaningful. Keep the structure,
 * drop the classes, point images at local files, reduce embeds to a marker the
 * reading page can hydrate.
 */
function cleanBody(html) {
  let s = html

  s = s.replace(/<(script|style|form|noscript)[\s\S]*?<\/\1>/gi, '')

  // Embeds -> marker div. Done before tags are stripped so the URL is still reachable.
  s = s.replace(/<figure[^>]*wp-block-embed[\s\S]*?<\/figure>/gi, (block) => {
    const url = block.match(/(?:src|href)="([^"]+)"/i)
    const id = url ? youtubeId(url[1]) : null
    return id ? `<div data-youtube="${id}"></div>` : ''
  })
  s = s.replace(/<iframe[^>]*src="([^"]+)"[^>]*>[\s\S]*?<\/iframe>/gi, (_, url) => {
    const id = youtubeId(url)
    return id ? `<div data-youtube="${id}"></div>` : ''
  })

  // Images -> local webp, with intrinsic size so the page does not reflow.
  s = s.replace(/<img([^>]+)>/gi, (tag, attrs) => {
    const src = attrs.match(/src="([^"]+)"/i)
    if (!src) return ''
    const a = lookup(src[1])
    if (!a) return ''
    const alt = attrs.match(/alt="([^"]*)"/i)
    return `<img src="${a.full}" width="${a.width}" height="${a.height}" alt="${
      alt ? alt[1] : ''
    }" loading="lazy" decoding="async">`
  })

  // Links back to the old site become internal journal links.
  s = s.replace(
    /href="https?:\/\/therivagallery(?:\.wordpress)?\.com\/\d{4}\/\d{2}\/\d{2}\/([^/"]+)\/?"/gi,
    'href="/journal/$1"'
  )

  s = s.replace(/\sclass="[^"]*"/gi, '')
  s = s.replace(/\sstyle="[^"]*"/gi, '')
  s = s.replace(/\s(?:data-(?!youtube)[a-z-]+|srcset|sizes|id)="[^"]*"/gi, '')
  s = s.replace(/<div>\s*<\/div>/gi, '')
  s = s.replace(/<p>\s*<\/p>/gi, '')
  s = s.replace(/\n{3,}/g, '\n\n')

  return s.trim()
}

// ---------------------------------------------------------------- journal

const journal = []
for (const item of index.filter((i) => i.kind === 'post')) {
  const html = await readFile(path.join(SOURCE, 'content', item.files.html), 'utf8')
  const images = imagesIn(html)
  const text = textOf(html)
  // The blog index uses the featured image, which is often not in the body.
  const featured = item.featured_image ? lookup(item.featured_image) : null
  journal.push({
    slug: item.slug,
    title: decode(item.title),
    date: item.date,
    year: item.date.slice(0, 4),
    words: item.words,
    categories: item.categories.filter((c) => c !== 'Uncategorized'),
    excerpt: text.split('\n\n')[0].slice(0, 280),
    cover: featured ?? images[0] ?? null,
    images,
    body: cleanBody(html),
    isSoc: /^soc\b|\bsoc #/i.test(decode(item.title)) || /^first \(of many\) soc/i.test(decode(item.title)),
  })
}
journal.sort((a, b) => b.date.localeCompare(a.date))

// ---------------------------------------------------------------- pages

const pages = {}
for (const item of index.filter((i) => i.kind === 'page')) {
  const html = await readFile(path.join(SOURCE, 'content', item.files.html), 'utf8')
  pages[item.slug] = {
    slug: item.slug,
    title: decode(item.title),
    date: item.date,
    text: textOf(html),
    images: imagesIn(html),
    body: cleanBody(html),
  }
}

// ---------------------------------------------------------------- books

/**
 * Each book is one `wp-block-media-text` container holding a cover and a content
 * column. Parsing by container rather than by image is what keeps covers paired
 * with the right review — the page also contains unrelated images (pull-quote
 * illustrations) that an image-first split misattributes.
 *
 * Titles and authors are read off the covers; the filenames are abbreviations.
 */
const BOOK_META = [
  ['The Ballad of Songbirds and Snakes', 'Suzanne Collins'],
  ['Kitchen', 'Banana Yoshimoto'],
  ['They Both Die at the End', 'Adam Silvera'],
  ['Predictably Irrational', 'Dan Ariely'],
  ['Sunrise on the Reaping', 'Suzanne Collins'],
  ['101 Essays That Will Change the Way You Think', 'Brianna Wiest'],
  ["You've Reached Sam", 'Dustin Thao'],
  ['Orbiting Jupiter', 'Gary D. Schmidt'],
  ['Hatchet', 'Gary Paulsen'],
  ['How Will You Measure Your Life?', 'Clayton M. Christensen, James Allworth & Karen Dillon'],
  ['This Is Water', 'David Foster Wallace'],
  ['The Selection series', 'Kiera Cass'],
  ['Harry Potter series', 'J.K. Rowling'],
  ['The Hunger Games trilogy', 'Suzanne Collins'],
  ['The Lights That Find Us', 'Anittha Thanabalan'],
  ['Looking for Alaska', 'John Green'],
]

/** The page signs off inside the last book's block; it is not a review of it. */
const SIGN_OFF = /Congrats on making it to the end/i

const booksHtml = await readFile(path.join(SOURCE, 'content', 'page--books.html'), 'utf8')
const bookBlocks = booksHtml
  .split(/(?=<div class="wp-block-media-text is-stacked-on-mobile">)/)
  .slice(1)

const books = bookBlocks.map((block, i) => {
  const src = block.match(/<img[^>]+?src="([^"?]+)/)
  const cover = src ? lookup(src[1]) : null
  const slug = src ? src[1].split('/').pop().replace(/\.[a-z0-9]+$/i, '') : `book-${i}`

  const ci = block.indexOf('wp-block-media-text__content')
  const contentHtml = ci >= 0 ? block.slice(block.indexOf('>', ci) + 1) : ''
  const text = textOf(contentHtml).replace(/\s+/g, ' ').trim()

  const rateMatch = text.match(/(\d+(?:\.\d+)?)\/10/)
  let review = text.replace(/^\s*\d+(?:\.\d+)?\/10\s*/, '').trim()
  if (SIGN_OFF.test(review)) review = ''

  const [title, author] = BOOK_META[i] ?? [slug.replace(/-/g, ' '), '']
  return {
    slug,
    title,
    author,
    rating: rateMatch ? rateMatch[0] : null,
    score: rateMatch ? Number(rateMatch[1]) : null,
    review,
    cover,
  }
})

/** The sign-off closes the Library, so keep it as the room's note. */
const booksNote = (() => {
  const t = textOf(bookBlocks[bookBlocks.length - 1] ?? '').replace(/\s+/g, ' ')
  const m = t.match(/Congrats on making it to the end[\s\S]*/)
  return m ? m[0].trim() : ''
})()

// The WordPress contact form is a hosted service and is stripped by cleanBody,
// so the sentence pointing at it would leave the page telling a lie.
if (pages['contact']) {
  pages['contact'].body = pages['contact'].body.replace(
    /<p>[^<]*Submit a form\.?[^<]*<\/p>/i,
    ''
  )
  pages['contact'].body = pages['contact'].body.replace(/Use the form to ask/i, 'Ask')
  pages['contact'].text = pages['contact'].text
    .replace(/Submit a form\.?/i, '')
    .replace(/Use the form to ask/i, 'Ask')
}

// ---------------------------------------------------------------- quotes

const quotesRaw = JSON.parse(await readFile(path.join(SOURCE, 'meta', 'quotes.json'), 'utf8'))
const quotes = quotesRaw.map((q) => {
  const text = decode(q).trim()
  const m = text.match(/^(.*?)\s*—\s*(.+)$/s)
  return m ? { text: m[1].trim(), attribution: m[2].trim() } : { text, attribution: '' }
})

// ---------------------------------------------------------------- write

await writeFile(path.join(DATA, 'journal.json'), JSON.stringify(journal, null, 2))
await writeFile(path.join(DATA, 'pages.json'), JSON.stringify(pages, null, 2))
await writeFile(path.join(DATA, 'books.json'), JSON.stringify({ books, note: booksNote }, null, 2))
await writeFile(path.join(DATA, 'quotes.json'), JSON.stringify(quotes, null, 2))

console.log(
  `journal ${journal.length} (soc ${journal.filter((p) => p.isSoc).length}, with cover ${
    journal.filter((p) => p.cover).length
  })`
)
console.log(
  `pages ${Object.keys(pages).length} | books ${books.length} (covers ${
    books.filter((b) => b.cover).length
  }, reviewed ${books.filter((b) => b.review).length}, rated ${
    books.filter((b) => b.rating).length
  }) | quotes ${quotes.length}`
)
