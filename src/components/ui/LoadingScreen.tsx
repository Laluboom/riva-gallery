'use client'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingScreen({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1612]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: 'easeInOut' } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-8 flex items-center justify-center">
              <motion.div
                className="h-px bg-[#C9A84C]"
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
              />
              <span className="mx-5 font-serif text-4xl tracking-[0.3em] text-[#C9A84C]">RG</span>
              <motion.div
                className="h-px bg-[#C9A84C]"
                initial={{ width: 0 }}
                animate={{ width: 120 }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            <p className="mb-1 font-serif text-2xl tracking-[0.25em] text-[#F5EDD6]">THE RIVA GALLERY</p>
            <p className="text-sm tracking-[0.3em] text-[#8A7A60]">A GALLERY OF A LIFE</p>

            <div className="mt-12 flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1 w-1 rounded-full bg-[#C9A84C]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="mt-4 text-xs tracking-[0.2em] text-[#5A4A38]">PREPARING THE GALLERY</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
