import Link from 'next/link'
import type { Metadata } from 'next'
import journal from '@/data/journal.json'

export const metadata: Metadata = {
  title: 'the journal wing — the riva gallery',
  description: 'Every entry written here, by year.',
}

/**
 * The archive. Mirrors the grid the live WordPress blog index used — a wall of
 * covers with lowercase captions — because that pattern was already working.
 */
export default function JournalIndex() {
  const byYear = journal.reduce<Record<string, typeof journal>>((acc, post) => {
    ;(acc[post.year] ??= []).push(post)
    return acc
  }, {})
  const years = Object.keys(byYear).sort().reverse()

  return (
    <div className="min-h-screen bg-[#FFF8EE] text-black">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/"
          className="text-sm text-[#501511] underline underline-offset-4 hover:no-underline"
        >
          ← back to the gallery
        </Link>
        <h1 className="mt-10 text-4xl font-bold md:text-5xl">the journal wing</h1>
        <p className="mt-3 text-[#5A4A38]">
          {journal.length} entries — thoughts that don’t quite fit anywhere else.
        </p>

        {years.map((year) => (
          <section key={year} className="mt-14">
            <h2 className="mb-6 text-sm tracking-[0.2em] text-[#8A7A60]">{year}</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
              {byYear[year].map((post) => (
                <li key={post.slug}>
                  <Link href={`/journal/${post.slug}`} className="group block">
                    {post.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover.thumb}
                        alt=""
                        width={post.cover.width}
                        height={post.cover.height}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-opacity group-hover:opacity-85"
                      />
                    )}
                    <p className="mt-3 text-center text-sm leading-snug group-hover:text-[#501511]">
                      {post.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
