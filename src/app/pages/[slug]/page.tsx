import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import pages from '@/data/pages.json'
import { Prose } from '@/components/reader/Prose'
import { ReaderShell } from '@/components/reader/ReaderShell'
import { CONTACT_EMAIL, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/data/site'

/** The résumé tree and the other standalone pages, reachable from the Studio. */
const READABLE = [
  'about-me',
  'books',
  'contact',
  'customs',
  'quotes',
  'resume',
  'consulting-and-strategy',
  'leadership-impact',
  'consult-your-community',
  'case-competitions',
  'ai-consulting-unc',
  'the-big-leaf-safe-start',
  'side-quests-2',
  'the-overflow',
  'sos',
] as const

type PageMap = Record<string, { slug: string; title: string; text: string; body: string }>

export function generateStaticParams() {
  return READABLE.map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = (pages as PageMap)[params.slug]
  if (!page) return {}
  return {
    title: `${page.title || params.slug} — the riva gallery`,
    description: page.text.slice(0, 200),
  }
}

export default function StandalonePage({ params }: { params: { slug: string } }) {
  const page = (pages as PageMap)[params.slug]
  if (!page || !READABLE.includes(params.slug as (typeof READABLE)[number])) notFound()

  return (
    <ReaderShell title={page.title || params.slug.replace(/-/g, ' ')}>
      <Prose html={page.body} />
      {params.slug === 'contact' && <ContactLinks />}
    </ReaderShell>
  )
}

/** Replaces the WordPress form, which does not survive the migration. */
function ContactLinks() {
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {CONTACT_EMAIL && (
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="border border-[#501511] px-6 py-3 text-sm text-[#501511] transition-colors hover:bg-[#501511] hover:text-white"
        >
          email me
        </a>
      )}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="border border-[#501511] px-6 py-3 text-sm text-[#501511] transition-colors hover:bg-[#501511] hover:text-white"
      >
        {INSTAGRAM_HANDLE}
      </a>
    </div>
  )
}
