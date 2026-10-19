import { notFound } from 'next/navigation'
import pages from '@/data/pages.json'
import { Prose } from '@/components/reader/Prose'
import { ArticleOverlay } from '@/components/reader/ArticleOverlay'
import { CONTACT_EMAIL, INSTAGRAM_URL, INSTAGRAM_HANDLE } from '@/data/site'

/* Copied from app/pages/[slug]/page.tsx — a page file cannot export the list
   for reuse, and an overlay that showed a slug the full route 404s on would
   break on refresh. Keep the two in sync. */
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

export default function StandalonePageOverlay({ params }: { params: { slug: string } }) {
  const page = (pages as PageMap)[params.slug]
  if (!page || !READABLE.includes(params.slug as (typeof READABLE)[number])) notFound()

  return (
    <ArticleOverlay title={page.title || params.slug.replace(/-/g, ' ')}>
      <Prose html={page.body} />
      {params.slug === 'contact' && <ContactLinks />}
    </ArticleOverlay>
  )
}

/** Mirrors the full route's replacement for the WordPress contact form. */
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
