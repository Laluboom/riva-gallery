'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useGalleryStore } from '@/lib/store'
import { GALLERY_ROOMS } from '@/data/content'

export function EntryScreen() {
  const hasEntered = useGalleryStore((s) => s.hasEntered)
  const setHasEntered = useGalleryStore((s) => s.setHasEntered)

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#1A1612]/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.0 } }}
        >
          <motion.div
            className="max-w-lg px-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <div className="mb-10 flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-[#C9A84C]/60" />
              <span className="font-serif text-3xl tracking-[0.3em] text-[#C9A84C]">RG</span>
              <div className="h-px w-20 bg-[#C9A84C]/60" />
            </div>

            <h1 className="mb-4 font-serif text-4xl leading-tight tracking-wide text-[#F5EDD6] md:text-5xl">
              the riva gallery
            </h1>
            <p className="mb-2 text-sm tracking-[0.25em] text-[#8A7A60]">
              “what is done with love is done well.”
            </p>
            <p className="text-xs tracking-[0.2em] text-[#6A5A48]">vincent van gogh</p>

            <div className="my-8 h-px w-full bg-[#3A3028]" />

            <p className="mb-8 leading-relaxed text-[#A89878] text-sm md:text-base">
              A collection of the things I’ve done with love — art I’ve made, things I’ve written,
              books that stuck with me, and all the random things I’ve gotten curious about along
              the way. Scroll or swipe to walk through the rooms. Tap any piece to learn more.
            </p>

            <div className="mb-10 grid grid-cols-2 gap-3 text-xs text-[#6A5A48] md:grid-cols-4">
              {GALLERY_ROOMS.map((room) => (
                <div key={room.id} className="border border-[#3A3028] px-3 py-2 tracking-widest">
                  {room.name.replace(/^the /, '')}
                </div>
              ))}
            </div>

            <motion.button
              onClick={() => setHasEntered(true)}
              className="group relative overflow-hidden border border-[#C9A84C] px-10 py-4 text-sm tracking-[0.25em] text-[#C9A84C] transition-all duration-500 hover:text-[#1A1612]"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <motion.div
                className="absolute inset-0 bg-[#C9A84C]"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                style={{ originX: 0 }}
                transition={{ duration: 0.4 }}
              />
              <span className="relative">enter the gallery</span>
            </motion.button>

            <p className="mt-6 text-xs tracking-widest text-[#3A3028]">
              scroll · explore · discover
            </p>

            <a
              href="?no3d=1"
              className="mt-4 inline-block text-xs text-[#6A5A48] underline underline-offset-4 transition-colors hover:text-[#C9A84C]"
            >
              or browse without 3d
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
