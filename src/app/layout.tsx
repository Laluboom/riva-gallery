import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://therivagallery.com'),
  title: 'the riva gallery',
  description:
    'A collection of the things I’ve done with love — art I’ve made, things I’ve written, books that stuck with me, and all the random things I’ve gotten curious about along the way.',
  keywords: ['art', 'custom art', 'blog', 'book reviews', 'the riva gallery'],
  openGraph: {
    title: 'the riva gallery',
    description: 'art made to be lived with.',
    type: 'website',
  },
}

/* The @modal slot renders alongside children rather than replacing them, so an
   intercepted article can sit over a gallery whose WebGL canvas stays mounted. */
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {modal}
      </body>
    </html>
  )
}
