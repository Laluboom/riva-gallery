'use client'
import { useEffect, useRef } from 'react'

/**
 * Renders a converted WordPress body.
 *
 * The HTML comes from scripts/convert-content.mjs, which has already stripped
 * scripts, styles and forms and rewritten image URLs to local files. The one
 * thing it leaves behind is `<div data-youtube="ID">` markers, which are
 * hydrated here so the iframes are only created once the page is interactive.
 */
export function Prose({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('[data-youtube]').forEach((node) => {
      if (node.dataset.hydrated) return
      const id = node.dataset.youtube
      if (!id) return
      node.dataset.hydrated = 'true'
      const frame = document.createElement('iframe')
      frame.src = `https://www.youtube-nocookie.com/embed/${id}`
      frame.title = 'Embedded video'
      frame.loading = 'lazy'
      frame.allow = 'accelerometer; encrypted-media; picture-in-picture'
      frame.allowFullscreen = true
      frame.className = 'aspect-video w-full rounded-sm border-0'
      node.replaceChildren(frame)
    })
  }, [html])

  return <div ref={ref} className="prose-riva" dangerouslySetInnerHTML={{ __html: html }} />
}
