'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * The reading frame for an intercepted article: a panel over the live gallery.
 *
 * It deliberately does not reuse ReaderShell — that shell's "back" link
 * soft-navigates to another route, which would leave this overlay stacked on
 * top of whatever loaded next. Closing here means unwinding the history entry
 * the interception pushed, so the gallery underneath is the one we return to.
 */
export function ArticleOverlay({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    /* Capture phase: the gallery's handlers sit on window in the bubble phase,
       so stopping here keeps Escape from also dismissing the exhibit panel
       waiting underneath, and keeps the arrows from walking the rooms while
       someone is reading. */
    const WALK_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        router.back()
        return
      }
      if (WALK_KEYS.includes(e.key)) e.stopPropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [router])

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-[#FFF8EE] text-black"
      /* The gallery's wheel listener sits on window and preventDefaults to walk
         the rooms. React's handlers run first, so stopping here lets the
         article scroll normally and keeps the camera still. */
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#501511] underline underline-offset-4 hover:no-underline"
        >
          ← close
        </button>
        <span className="text-xs tracking-[0.2em] text-[#8A7A60]">esc</span>
      </header>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <h1 className="text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {meta && <p className="mt-3 text-sm text-[#5A4A38]">{meta}</p>}
        <div className="mt-10">{children}</div>
      </article>
    </div>
  )
}
