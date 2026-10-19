'use client'
import { motion } from 'framer-motion'
import { useGalleryStore } from '@/lib/store'
import { GALLERY_ROOMS } from '@/data/content'

export function GalleryNavigation() {
  const currentRoom = useGalleryStore((s) => s.currentRoom)
  const setCurrentRoom = useGalleryStore((s) => s.setCurrentRoom)
  const setProgress = useGalleryStore((s) => s.setProgress)
  const hasEntered = useGalleryStore((s) => s.hasEntered)

  if (!hasEntered) return null

  const goTo = (idx: number) => {
    setCurrentRoom(idx)
    setProgress(idx)
  }

  return (
    <>
      {/* Top bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-[#501511]" />
          <span className="text-lg font-bold uppercase tracking-[0.2em] text-[#1A1410]">
            the riva gallery
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {GALLERY_ROOMS.map((room, idx) => (
            <button
              key={room.id}
              onClick={() => goTo(idx)}
              className={`text-xs tracking-[0.15em] transition-all duration-300 ${
                currentRoom === idx
                  ? 'text-[#501511]'
                  : 'text-[#5A4A38] hover:text-[#1A1410]'
              }`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Room indicator dots - left side */}
      <motion.div
        className="fixed left-5 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        {GALLERY_ROOMS.map((room, idx) => (
          <button
            key={room.id}
            onClick={() => goTo(idx)}
            className="group relative"
            title={room.name}
          >
            <div
              className={`h-2 w-2 rounded-full transition-all duration-400 ${
                currentRoom === idx
                  ? 'scale-150 bg-[#501511]'
                  : 'bg-[#2A1E14] hover:bg-[#8A7A60]'
              }`}
            />
            {currentRoom === idx && (
              <motion.div
                className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs tracking-widest text-[#5A4A38]"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {room.name}
              </motion.div>
            )}
          </button>
        ))}
      </motion.div>

      {/* Room navigation arrows */}
      <motion.div
        className="fixed bottom-20 right-4 z-30 flex flex-col gap-2 md:bottom-8 md:right-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => goTo(Math.max(0, currentRoom - 1))}
          disabled={currentRoom === 0}
          className="flex h-10 w-10 items-center justify-center border border-[#8A7A60] text-[#5A4A38] transition-all hover:border-[#501511] hover:text-[#501511] disabled:opacity-30"
        >
          ↑
        </button>
        <button
          onClick={() => goTo(Math.min(GALLERY_ROOMS.length - 1, currentRoom + 1))}
          disabled={currentRoom === GALLERY_ROOMS.length - 1}
          className="flex h-10 w-10 items-center justify-center border border-[#8A7A60] text-[#5A4A38] transition-all hover:border-[#501511] hover:text-[#501511] disabled:opacity-30"
        >
          ↓
        </button>
      </motion.div>

      {/* Room counter */}
      <motion.div
        className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-sm bg-[#FFF8EE]/75 px-4 py-2 text-center backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="text-xs tracking-[0.3em] text-[#2A1E14]">
          room {currentRoom + 1} / {GALLERY_ROOMS.length}
        </span>
        <p className="mt-1 text-[10px] tracking-widest text-[#2A1E14]">
          {GALLERY_ROOMS[currentRoom]?.name}
        </p>
      </motion.div>

      {/* Hint overlay */}
      <HintOverlay />
    </>
  )
}

function HintOverlay() {
  return (
    <motion.div
      className="fixed left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#FFF8EE]/75 px-6 py-4 backdrop-blur-[2px]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 5, duration: 2 }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Stacked rather than inline: centred in the frame it has the room to
          read as a list, and it stays on one screen width on a phone. */}
      <div className="flex flex-col items-center gap-2 whitespace-nowrap text-center text-xs tracking-[0.15em] text-[#2A1E14]">
        <span>scroll or swipe to walk</span>
        <span className="h-px w-8 bg-[#2A1E14]/50" />
        <span>drag to look</span>
        <span className="h-px w-8 bg-[#2A1E14]/50" />
        <span>tap a piece</span>
      </div>
    </motion.div>
  )
}
