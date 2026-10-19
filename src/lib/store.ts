import { create } from 'zustand'
import { Exhibit } from '@/types'
import { GALLERY_ROOMS } from '@/data/content'

/**
 * Where the visitor had got to, remembered for this tab only.
 *
 * sessionStorage rather than localStorage on purpose: coming back from an
 * article should drop you where you left off, but opening the site fresh
 * tomorrow should start at the entrance with the full introduction.
 *
 * Read and written through try/catch — it throws in private windows and with
 * site data blocked, and the gallery must work without it.
 */
const VISIT_KEY = 'rg:visit'

interface SavedVisit {
  entered: boolean
  room: number
}

function readVisit(): SavedVisit | null {
  try {
    const raw = sessionStorage.getItem(VISIT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SavedVisit>
    if (typeof parsed.room !== 'number' || typeof parsed.entered !== 'boolean') return null
    return {
      entered: parsed.entered,
      room: Math.max(0, Math.min(parsed.room, GALLERY_ROOMS.length - 1)),
    }
  } catch {
    return null
  }
}

function saveVisit(visit: SavedVisit) {
  try {
    sessionStorage.setItem(VISIT_KEY, JSON.stringify(visit))
  } catch {
    /* storage unavailable; the gallery just forgets, which is survivable */
  }
}

interface GalleryStore {
  currentRoom: number
  activeExhibit: Exhibit | null
  isLoading: boolean
  progress: number
  isDragging: boolean
  lookAngle: number
  hasEntered: boolean
  setCurrentRoom: (room: number) => void
  setActiveExhibit: (exhibit: Exhibit | null) => void
  setProgress: (p: number) => void
  setLookAngle: (a: number) => void
  setHasEntered: (v: boolean) => void
  setIsLoading: (v: boolean) => void
  nextRoom: () => void
  prevRoom: () => void
  /** Applies a remembered visit. Returns true if there was one. */
  restoreVisit: () => boolean
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  currentRoom: 0,
  activeExhibit: null,
  isLoading: true,
  progress: 0,
  isDragging: false,
  lookAngle: 0,
  hasEntered: false,

  setCurrentRoom: (room) => {
    const next = Math.max(0, Math.min(room, GALLERY_ROOMS.length - 1))
    set({ currentRoom: next })
    saveVisit({ entered: get().hasEntered, room: next })
  },
  setActiveExhibit: (exhibit) => set({ activeExhibit: exhibit }),
  setProgress: (p) => set({ progress: p }),
  setLookAngle: (a) => set({ lookAngle: a }),
  setHasEntered: (v) => {
    set({ hasEntered: v })
    saveVisit({ entered: v, room: get().currentRoom })
  },
  setIsLoading: (v) => set({ isLoading: v }),
  nextRoom: () => {
    const { currentRoom, hasEntered } = get()
    const next = Math.min(currentRoom + 1, GALLERY_ROOMS.length - 1)
    set({ currentRoom: next, progress: next })
    saveVisit({ entered: hasEntered, room: next })
  },
  prevRoom: () => {
    const { currentRoom, hasEntered } = get()
    const prev = Math.max(currentRoom - 1, 0)
    set({ currentRoom: prev, progress: prev })
    saveVisit({ entered: hasEntered, room: prev })
  },

  // Called from an effect after mount, never during render: reading storage
  // while rendering would make the server and client markup disagree.
  restoreVisit: () => {
    const visit = readVisit()
    if (!visit?.entered) return false
    set({
      hasEntered: true,
      currentRoom: visit.room,
      progress: visit.room,
      isLoading: false,
    })
    return true
  },
}))
