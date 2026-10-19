/**
 * Optimises the images captured from therivagallery.com into web-ready webp.
 *
 * Reads  _source_site/meta/asset_manifest.json  (url -> local original)
 * Writes public/gallery/<original upload path>.webp   — full size, for frames and prose
 *        public/gallery/<original upload path>.thumb.webp — 400px, for grids and placeholders
 *        src/data/assets.json — generated lookup: original upload path -> { full, thumb, w, h }
 *
 * Wall textures are capped at 1400px because a 3D frame never fills more than
 * ~1000 device pixels, and every extra pixel is GPU memory that stays resident.
 *
 *   node scripts/prepare-assets.mjs
 */
import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.join(ROOT, '_source_site')
const OUT = path.join(ROOT, 'public', 'gallery')

const FULL_EDGE = 1400
/** Wall textures. A frame never covers more than ~600 device px on screen. */
const TEX_EDGE = 800
const THUMB_EDGE = 400
const QUALITY = 78

const manifest = JSON.parse(await readFile(path.join(SOURCE, 'meta', 'asset_manifest.json'), 'utf8'))

const assets = {}
let done = 0
let skipped = 0
let bytesIn = 0
let bytesOut = 0

for (const [key, entry] of Object.entries(manifest)) {
  if (!entry.local) {
    skipped++
    continue
  }
  const src = path.join(SOURCE, entry.local)
  if (!existsSync(src)) {
    skipped++
    continue
  }

  const stem = key.replace(/\.[a-z0-9]+$/i, '')
  const fullRel = `${stem}.webp`
  const texRel = `${stem}.tex.webp`
  const thumbRel = `${stem}.thumb.webp`

  await mkdir(path.dirname(path.join(OUT, fullRel)), { recursive: true })

  let meta
  try {
    meta = await sharp(src).metadata()
  } catch {
    skipped++
    continue
  }

  // Animated gifs lose their animation through re-encoding, so copy them verbatim.
  if (meta.pages > 1) {
    const rel = key
    await mkdir(path.dirname(path.join(OUT, rel)), { recursive: true })
    const raw = await readFile(src)
    await writeFile(path.join(OUT, rel), raw)
    assets[key] = {
      full: `/gallery/${rel}`,
      tex: `/gallery/${rel}`,
      thumb: `/gallery/${rel}`,
      width: meta.width,
      height: meta.height,
      aspect: Number((meta.width / meta.height).toFixed(4)),
      usedBy: entry.used_by,
      animated: true,
    }
    bytesIn += entry.bytes ?? 0
    bytesOut += raw.length
    done++
    continue
  }

  const full = await sharp(src)
    .rotate()
    .resize({ width: FULL_EDGE, height: FULL_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer({ resolveWithObject: true })

  const tex = await sharp(src)
    .rotate()
    .resize({ width: TEX_EDGE, height: TEX_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer()

  const thumb = await sharp(src)
    .rotate()
    .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70 })
    .toBuffer()

  await writeFile(path.join(OUT, fullRel), full.data)
  await writeFile(path.join(OUT, texRel), tex)
  await writeFile(path.join(OUT, thumbRel), thumb)

  assets[key] = {
    full: `/gallery/${fullRel}`,
    tex: `/gallery/${texRel}`,
    thumb: `/gallery/${thumbRel}`,
    width: full.info.width,
    height: full.info.height,
    aspect: Number((full.info.width / full.info.height).toFixed(4)),
    usedBy: entry.used_by,
  }

  bytesIn += entry.bytes ?? 0
  bytesOut += full.data.length + tex.length + thumb.length
  done++
}

await writeFile(path.join(ROOT, 'src', 'data', 'assets.json'), JSON.stringify(assets, null, 2))

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB'
console.log(`optimised ${done}, skipped ${skipped}`)
console.log(`${mb(bytesIn)} -> ${mb(bytesOut)}`)
