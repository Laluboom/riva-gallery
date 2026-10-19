'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { EntryScreen } from '@/components/ui/EntryScreen'
import { GalleryNavigation } from '@/components/ui/Navigation'
import { ExhibitModal } from '@/components/ui/ExhibitModal'
import { GalleryController } from '@/components/GalleryController'
import { useGalleryStore } from '@/lib/store'
import { GalleryIndex } from '@/components/ui/GalleryIndex'

const GalleryCanvas = dynamic(
  () => import('@/components/gallery/GalleryCanvas').then((m) => ({ default: m.GalleryCanvas })),
  { ssr: false }
)

/** Cheapest reliable probe: try to get a context and throw the canvas away. */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

export default function Home() {
  const setIsLoading = useGalleryStore((s) => s.setIsLoading)
  const isLoading = useGalleryStore((s) => s.isLoading)
  const restoreVisit = useGalleryStore((s) => s.restoreVisit)
  // null until probed, so the first paint does not flash the wrong one.
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [forcedFlat, setForcedFlat] = useState(false)

  useEffect(() => {
    // ?no3d=1 forces the flat index. It is the link to hand someone whose
    // machine struggles with the canvas, and it makes the fallback testable.
    const forced = new URLSearchParams(window.location.search).has('no3d')
    setForcedFlat(forced)
    setWebgl(forced ? false : hasWebGL())
  }, [])

  // The intro is for arriving, not for coming back. A visitor returning from an
  // article in the same tab skips the loading screen and the entry portal and
  // lands in the room they left.
  useEffect(() => {
    if (restoreVisit()) return
    const timer = setTimeout(() => setIsLoading(false), 2200)
    return () => clearTimeout(timer)
  }, [restoreVisit, setIsLoading])

  // The gallery is the only route that locks scrolling; the reading pages and
  // the no-WebGL fallback scroll.
  useEffect(() => {
    if (webgl === false) return
    document.body.classList.add('gallery-route')
    return () => document.body.classList.remove('gallery-route')
  }, [webgl])

  if (webgl === false)
    return <GalleryIndex visible reason={forcedFlat ? 'chosen' : 'unsupported'} />

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#1A1612] no-select">
      <LoadingScreen visible={isLoading} />

      {/* Rendered unconditionally so it is present in the server HTML: behind
          the loading flag, crawlers saw only the loading screen. Hidden
          visually; the visible copy is the no-WebGL branch above. */}
      <GalleryIndex />

      {!isLoading && (
        <>
          <GalleryCanvas />
          <EntryScreen />
          <GalleryNavigation />
          <ExhibitModal />
          <GalleryController />

        </>
      )}
    </main>
  )
}
