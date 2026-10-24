'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useGalleryStore } from '@/lib/store'
import { GALLERY_ROOMS } from '@/data/content'

/**
 * How far the view can turn from straight ahead. Wide enough to bring a side
 * wall into frame when standing close to it, which portrait does.
 */
const LOOK_LIMIT = Math.PI * 0.46

/**
 * How much a pinch has to spread before it counts, in pixels of finger
 * separation. Two fingers landing together always wobble a few pixels; below
 * this the view would twitch on every two-finger rest.
 */
const PINCH_DEADZONE = 8

/** Trackpad pinches arrive as ctrl+wheel; this turns deltaY into a zoom ratio. */
const TRACKPAD_PINCH_RATE = 0.01

/**
 * Radians of tilt per pixel dragged. Matches the horizontal rate, so a diagonal
 * drag turns and tilts by the same amount of wrist.
 */
const PITCH_RATE = 0.005

export function GalleryController() {
  const hasEntered = useGalleryStore((s) => s.hasEntered)
  const progress = useGalleryStore((s) => s.progress)
  const setProgress = useGalleryStore((s) => s.setProgress)
  const setLookAngle = useGalleryStore((s) => s.setLookAngle)
  const setZoom = useGalleryStore((s) => s.setZoom)
  const setLookPitch = useGalleryStore((s) => s.setLookPitch)
  const activeExhibit = useGalleryStore((s) => s.activeExhibit)

  const dragStart = useRef<{ x: number; y: number; angle: number; pitch: number } | null>(null)
  const currentLookAngle = useRef(0)
  const currentPitch = useRef(0)
  const touchStartY = useRef<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const touchAxis = useRef<'x' | 'y' | null>(null)
  const pinchStartDistance = useRef<number | null>(null)
  const pinchStartZoom = useRef(1)
  const pinchStartMidY = useRef(0)
  const isModalOpen = !!activeExhibit

  // Scroll handling
  useEffect(() => {
    if (!hasEntered || isModalOpen) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      // A trackpad pinch reaches the page as ctrl+wheel. Without this it would
      // walk the viewer between rooms instead of zooming.
      if (e.ctrlKey) {
        const { zoom } = useGalleryStore.getState()
        setZoom(zoom * (1 - e.deltaY * TRACKPAD_PINCH_RATE))
        return
      }

      const delta = e.deltaY * 0.003
      const maxRooms = GALLERY_ROOMS.length - 1
      const next = Math.max(0, Math.min(maxRooms, progress + delta))
      setProgress(next)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
      if (e.key === 'ArrowDown' || e.key === 's') {
        setProgress(Math.min(GALLERY_ROOMS.length - 1, progress + 0.1))
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setProgress(Math.max(0, progress - 0.1))
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        const next = currentLookAngle.current + 0.08
        currentLookAngle.current = next
        setLookAngle(next)
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        const next = currentLookAngle.current - 0.08
        currentLookAngle.current = next
        setLookAngle(next)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasEntered, isModalOpen, progress, setProgress, setLookAngle, setZoom])

  // Escape lives outside the movement effect: that one bails out while the
  // modal is open, which is exactly when Escape has to work.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useGalleryStore.getState().setActiveExhibit(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Touch: a vertical swipe walks between rooms, a horizontal swipe looks left
  // and right. Touch does not synthesise mousemove, so without the horizontal
  // case the side walls are unreachable on a phone — which is most of the art.
  useEffect(() => {
    if (!hasEntered || isModalOpen) return

    const spread = (e: TouchEvent) => {
      const [a, b] = [e.touches[0], e.touches[1]]
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }

    const midY = (e: TouchEvent) => (e.touches[0].clientY + e.touches[1].clientY) / 2

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        pinchStartDistance.current = spread(e)
        pinchStartZoom.current = useGalleryStore.getState().zoom
        pinchStartMidY.current = midY(e)
        // A second finger ends whatever the first one was doing, so a pinch
        // that starts mid-swipe does not also drag the room along with it.
        touchStartX.current = null
        touchStartY.current = null
        touchAxis.current = null
        return
      }
      pinchStartDistance.current = null
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchAxis.current = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        if (pinchStartDistance.current === null) {
          pinchStartDistance.current = spread(e)
          pinchStartZoom.current = useGalleryStore.getState().zoom
          pinchStartMidY.current = midY(e)
          return
        }
        // Stops the browser treating the same gesture as a page zoom or scroll.
        e.preventDefault()

        const distance = spread(e)
        if (Math.abs(distance - pinchStartDistance.current) >= PINCH_DEADZONE) {
          setZoom(pinchStartZoom.current * (distance / pinchStartDistance.current))
        }

        // Two fingers sliding together tilt the gaze. Spread and slide are read
        // independently, so one gesture can zoom and tilt at once — which is
        // what a hand does when it moves in to look up at a tall canvas.
        const slide = midY(e) - pinchStartMidY.current
        if (Math.abs(slide) >= PINCH_DEADZONE) {
          pinchStartMidY.current = midY(e)
          currentPitch.current += slide * PITCH_RATE
          setLookPitch(currentPitch.current)
          currentPitch.current = useGalleryStore.getState().lookPitch
        }
        return
      }

      if (touchStartX.current === null || touchStartY.current === null) return
      const dx = touchStartX.current - e.touches[0].clientX
      const dy = touchStartY.current - e.touches[0].clientY

      // Lock to whichever axis the gesture commits to first, so a slightly
      // diagonal swipe does not both move and turn.
      if (touchAxis.current === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
        touchAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }

      if (touchAxis.current === 'y') {
        const maxRooms = GALLERY_ROOMS.length - 1
        setProgress(Math.max(0, Math.min(maxRooms, progress + dy * 0.002)))
      } else {
        const next = currentLookAngle.current + dx * 0.004
        const clamped = Math.max(-LOOK_LIMIT, Math.min(LOOK_LIMIT, next))
        currentLookAngle.current = clamped
        setLookAngle(clamped)
      }

      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchStartDistance.current = null
      touchStartX.current = null
      touchStartY.current = null
      touchAxis.current = null
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [hasEntered, isModalOpen, progress, setProgress, setLookAngle, setZoom, setLookPitch])

  // Mouse drag to look around
  useEffect(() => {
    if (!hasEntered || isModalOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        angle: currentLookAngle.current,
        pitch: currentPitch.current,
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStart.current) return
      const dx = e.clientX - dragStart.current.x
      const newAngle = dragStart.current.angle + dx * -0.005
      const clamped = Math.max(-LOOK_LIMIT, Math.min(LOOK_LIMIT, newAngle))
      currentLookAngle.current = clamped
      setLookAngle(clamped)

      // Dragging down pulls the room down, which puts the ceiling in view —
      // the same grab-the-world direction the horizontal drag uses.
      const dy = e.clientY - dragStart.current.y
      currentPitch.current = dragStart.current.pitch + dy * PITCH_RATE
      setLookPitch(currentPitch.current)
      currentPitch.current = useGalleryStore.getState().lookPitch
    }

    const handleMouseUp = () => {
      dragStart.current = null
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [hasEntered, isModalOpen, setLookAngle, setLookPitch])

  return null
}
