import Link from 'next/link'

/** The 2D reading frame: a quiet page that sits behind the gallery, not beside it. */
export function ReaderShell({
  title,
  meta,
  back = { href: '/', label: 'back to the gallery' },
  children,
}: {
  title: string
  meta?: string
  back?: { href: string; label: string }
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FFF8EE] text-black">
      <header className="mx-auto max-w-3xl px-6 pt-10">
        <Link
          href={back.href}
          className="text-sm text-[#501511] underline underline-offset-4 hover:no-underline"
        >
          ← {back.label}
        </Link>
      </header>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {meta && <p className="mt-3 text-sm text-[#8A7A60]">{meta}</p>}
        <div className="mt-10">{children}</div>
      </article>
    </div>
  )
}
