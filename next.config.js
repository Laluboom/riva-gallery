/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei'],
  },
  /** Keep every link that ever pointed at the WordPress site working. */
  async redirects() {
    return [
      { source: '/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug', destination: '/journal/:slug', permanent: true },
      { source: '/193-2', destination: '/journal', permanent: true },
      { source: '/blog', destination: '/journal', permanent: true },
      ...[
        'about-me',
        'books',
        'contact',
        'customs',
        'quotes',
        'resume',
        'consulting-and-strategy',
        'leadership-impact',
        'consult-your-community',
        'case-competitions',
        'ai-consulting-unc',
        'the-big-leaf-safe-start',
        'side-quests-2',
        'the-overflow',
        'sos',
      ].map((slug) => ({ source: `/${slug}`, destination: `/pages/${slug}`, permanent: true })),
    ]
  },
}

module.exports = nextConfig
