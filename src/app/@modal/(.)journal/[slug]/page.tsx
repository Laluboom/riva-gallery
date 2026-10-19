import { notFound } from 'next/navigation'
import journal from '@/data/journal.json'
import { Prose } from '@/components/reader/Prose'
import { ArticleOverlay } from '@/components/reader/ArticleOverlay'

type Post = (typeof journal)[number]

const bySlug = new Map<string, Post>(journal.map((p) => [p.slug, p]))

export default function JournalPostOverlay({ params }: { params: { slug: string } }) {
  const post = bySlug.get(params.slug)
  if (!post) notFound()

  return (
    <ArticleOverlay title={post.title} meta={`${post.date} · ${post.words} words`}>
      <Prose html={post.body} />
    </ArticleOverlay>
  )
}
