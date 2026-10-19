import Link from 'next/link'
import { GALLERY_ROOMS } from '@/data/content'

/**
 * A flat, readable version of the whole gallery.
 *
 * It serves two jobs at once. When WebGL is available it is rendered `sr-only`,
 * so crawlers and screen readers get the full contents of a scene they cannot
 * otherwise reach. When WebGL is missing it is rendered visibly, and becomes the
 * site — every exhibit, every collection item, every reading page, no canvas.
 */
export function GalleryIndex({
  visible = false,
  reason = 'unsupported',
}: {
  visible?: boolean
  /** Why the flat view is showing — the notice must not claim a missing feature
      when the visitor simply chose this view. */
  reason?: 'unsupported' | 'chosen'
}) {
  return (
    <div className={visible ? 'min-h-screen overflow-y-auto bg-[#FFF8EE] text-black' : 'sr-only'}>
      <div className={visible ? 'mx-auto max-w-3xl px-6 py-14' : undefined}>
        <h1 className={visible ? 'text-4xl font-bold md:text-5xl' : undefined}>the riva gallery</h1>
        <p className={visible ? 'mt-4 text-lg leading-relaxed text-[#3A3028]' : undefined}>
          A collection of the things I’ve done with love — art I’ve made, things I’ve written,
          books that stuck with me, and all the random things I’ve gotten curious about along the
          way.
        </p>
        {visible && (
          <p className="mt-4 rounded-sm border border-[#E2D9C6] bg-white/50 px-4 py-3 text-sm text-[#5A4A38]">
            {reason === 'chosen' ? (
              <>
                Everything in the gallery, as a list.{' '}
                {/* A full load, not a client transition: ?no3d=1 and / are the
                    same route, so a <Link> would not re-run the WebGL probe. */}
                <a href="/" className="text-[#501511] underline underline-offset-4">
                  walk through it in 3d instead
                </a>
              </>
            ) : (
              <>
                The three-dimensional gallery needs WebGL, which this browser does not have.
                Everything in it is below.
              </>
            )}
          </p>
        )}

        {GALLERY_ROOMS.map((room) => (
          <section key={room.id} className={visible ? 'mt-14' : undefined}>
            <h2 className={visible ? 'text-2xl font-bold' : undefined}>{room.name}</h2>
            <p className={visible ? 'mt-1 text-sm text-[#8A7A60]' : undefined}>{room.subtitle}</p>

            <ul className={visible ? 'mt-6 space-y-8' : undefined}>
              {room.exhibits.map((exhibit) => (
                <li key={exhibit.id}>
                  <h3 className={visible ? 'text-lg font-semibold' : undefined}>
                    {exhibit.link?.startsWith('/') ? (
                      <Link href={exhibit.link} className={visible ? 'text-[#501511] underline underline-offset-4' : undefined}>
                        {exhibit.title}
                      </Link>
                    ) : (
                      exhibit.title
                    )}
                  </h3>
                  {exhibit.subtitle && (
                    <p className={visible ? 'text-sm text-[#8A7A60]' : undefined}>
                      {exhibit.subtitle}
                    </p>
                  )}
                  <p className={visible ? 'mt-2 leading-relaxed text-[#3A3028]' : undefined}>
                    {exhibit.description}
                  </p>

                  {exhibit.thumbUrl && visible && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={exhibit.thumbUrl}
                      alt=""
                      loading="lazy"
                      className="mt-3 max-h-64 w-auto"
                    />
                  )}

                  {exhibit.collection && (
                    <ul className={visible ? 'mt-3 space-y-1 border-l-2 border-[#E2D9C6] pl-4' : undefined}>
                      {exhibit.collection.items.map((item, i) => (
                        <li key={i} className={visible ? 'text-sm' : undefined}>
                          {item.href ? (
                            <Link
                              href={item.href}
                              className={visible ? 'text-[#501511] underline underline-offset-4' : undefined}
                            >
                              {item.title}
                            </Link>
                          ) : (
                            item.title
                          )}
                          {item.subtitle && (
                            <span className={visible ? ' text-[#8A7A60]' : undefined}>
                              {' '}
                              — {item.subtitle}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={visible ? 'mt-14' : undefined}>
          <Link href="/journal" className={visible ? 'text-[#501511] underline underline-offset-4' : undefined}>
            the full journal archive
          </Link>
        </p>
      </div>
    </div>
  )
}
