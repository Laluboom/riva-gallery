import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import journal from '@/data/journal.json'
import { Prose } from '@/components/reader/Prose'
import { ReaderShell } from '@/components/reader/ReaderShell'

type Post = (typeof journal)[number]

const bySlug = new Map<string, Post>(journal.map((p) => [p.slug, p]))

export function generateStaticParams() {
  return journal.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = bySlug.get(params.slug)
  if (!post) return {}
  return {
    title: `${post.title} — the riva gallery`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover ? [post.cover.full] : undefined,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default function JournalPost({ params }: { params: { slug: string } }) {
  const post = bySlug.get(params.slug)
  if (!post) notFound()

  return (
    <ReaderShell
      title={post.title}
      meta={`${post.date} · ${post.words} words`}
      back={{ href: '/journal', label: 'the journal wing' }}
    >
      <Prose html={post.body} />
    </ReaderShell>
  )
}
