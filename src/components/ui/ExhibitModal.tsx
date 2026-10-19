'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useGalleryStore } from '@/lib/store'
import { Exhibit } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  artwork: 'customs',
  journal: 'journal',
  travel: 'travel',
  book: 'book review',
  project: 'work',
  about: 'about',
}

export function ExhibitModal() {
  const activeExhibit = useGalleryStore((s) => s.activeExhibit)
  const setActiveExhibit = useGalleryStore((s) => s.setActiveExhibit)

  return (
    <AnimatePresence>
      {activeExhibit && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-[#1A1612]/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveExhibit(null)}
          />

          {/* Modal panel */}
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-[#FFF8EE] shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <ExhibitDetail exhibit={activeExhibit} onClose={() => setActiveExhibit(null)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function ExhibitDetail({ exhibit, onClose }: { exhibit: Exhibit; onClose: () => void }) {
  return (
    <div className="min-h-full">
      {/* Artwork preview area */}
      <div
        className="relative flex h-64 items-end p-8"
        style={{
          background: `linear-gradient(135deg, ${exhibit.gradientFrom || '#1A1612'}, ${exhibit.gradientTo || '#3D2B1F'})`,
        }}
      >
        <ArtPreview exhibit={exhibit} />
        <button
          onClick={onClose}
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center text-white/60 transition-colors hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        <div className="relative">
          <span className="block text-xs tracking-[0.2em] text-white/50 mb-2">
            {CATEGORY_LABELS[exhibit.category]}
          </span>
          <h2 className="font-serif text-2xl leading-tight text-white md:text-3xl">
            {exhibit.title}
          </h2>
          {exhibit.subtitle && (
            <p className="mt-1 text-sm text-white/60">{exhibit.subtitle}</p>
          )}
        </div>
      </div>

      {/* Museum plaque detail */}
      <div className="border-b border-[#D8CEB8] bg-[#E8DFC8] px-8 py-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs tracking-widest text-[#6A5A48]">
          {exhibit.year && (
            <span>{exhibit.year}</span>
          )}
          {exhibit.medium && (
            <span>{exhibit.medium}</span>
          )}
          {exhibit.tags?.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <p className="mb-6 text-base leading-relaxed text-[#3A3028]">{exhibit.description}</p>

        {exhibit.longDescription && (
          <div className="border-l-2 border-[#C9A84C] pl-6">
            {exhibit.longDescription.split('\n\n').map((para, i) => (
              <p key={i} className="mb-4 text-sm leading-relaxed text-[#5A4A38] last:mb-0">
                {para}
              </p>
            ))}
          </div>
        )}

        {exhibit.collection && <CollectionPanel collection={exhibit.collection} />}

        {exhibit.metadata && Object.keys(exhibit.metadata).length > 0 && (
          <div className="mt-8 border-t border-[#D8CEB8] pt-6">
            <p className="mb-4 text-xs tracking-[0.2em] text-[#8A7A60]">details</p>
            <div className="grid gap-3">
              {Object.entries(exhibit.metadata).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[#8A7A60] uppercase tracking-wider">{key}</span>
                  <span className="text-sm text-[#3A3028] text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {exhibit.link &&
          (exhibit.link.startsWith('/') ? (
            /* A <Link> keeps this client-side, which is what lets the article
               route be intercepted into an overlay over the live canvas. */
            <Link
              href={exhibit.link}
              className="mt-8 inline-flex items-center gap-2 border border-[#501511] px-6 py-3 text-xs tracking-[0.2em] text-[#501511] transition-all hover:bg-[#501511] hover:text-white"
            >
              read in full →
            </Link>
          ) : (
            <a
              href={exhibit.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border border-[#C9A84C] px-6 py-3 text-xs tracking-[0.2em] text-[#6A5A38] transition-all hover:bg-[#C9A84C] hover:text-white"
            >
              view more ↗
            </a>
          ))}
      </div>

      {/* Footer */}
      <div className="px-8 pb-8">
        <div className="border-t border-[#D8CEB8] pt-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-[#D8CEB8]" />
            <span className="font-serif text-sm tracking-[0.2em] text-[#8A7A60]">RG</span>
            <div className="h-px flex-1 bg-[#D8CEB8]" />
          </div>
          <p className="mt-3 text-xs tracking-widest text-[#A89878]">the riva gallery</p>
        </div>
      </div>
    </div>
  )
}

function ArtPreview({ exhibit }: { exhibit: Exhibit }) {
  const src = exhibit.fullUrl ?? exhibit.imageUrl
  if (!src) return null
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover opacity-35"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
    </div>
  )
}

/** A series, archive, index or quote wall rendered as a list inside the panel. */
function CollectionPanel({ collection }: { collection: NonNullable<Exhibit['collection']> }) {
  if (collection.kind === 'quotes') {
    return (
      <div className="mt-6 space-y-5">
        {collection.items.map((q, i) => (
          <blockquote key={i} className="border-l-2 border-[#501511] pl-5">
            <p className="text-sm italic leading-relaxed text-[#3A3028]">{q.title}</p>
            {q.subtitle && (
              <footer className="mt-1 text-xs text-[#8A7A60]">— {q.subtitle}</footer>
            )}
          </blockquote>
        ))}
      </div>
    )
  }

  return (
    <ul className="mt-6 divide-y divide-[#E2D9C6]">
      {collection.items.map((item, i) => {
        const body = (
          <div className="flex items-center gap-4 py-3">
            {item.thumbUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbUrl}
                alt=""
                className="h-12 w-12 flex-none rounded-sm object-cover"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#3A3028] group-hover:text-[#501511]">
                {item.title}
              </p>
              {item.subtitle && (
                <p className="truncate text-xs text-[#8A7A60]">{item.subtitle}</p>
              )}
            </div>
            {item.meta && (
              <span className="flex-none text-xs text-[#A89878]">{item.meta}</span>
            )}
          </div>
        )
        return (
          <li key={i}>
            {item.href ? (
              item.href.startsWith('/') ? (
                <Link href={item.href} className="group block">
                  {body}
                </Link>
              ) : (
                <a href={item.href} className="group block">
                  {body}
                </a>
              )
            ) : (
              body
            )}
          </li>
        )
      })}
    </ul>
  )
}
