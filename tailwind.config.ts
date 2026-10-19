import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Measured from the live site; see MIGRATION_PLAN.md §3.
        gallery: {
          wall: '#FFF8EE',
          background: '#FFF8EE',
          floor: '#8B6914',
          gold: '#C9A84C',
          primary: '#501511',
          dark: '#1A1612',
          warm: '#F5EDD6',
          accent: '#501511',
          plaque: '#E8DFC8',
          rule: '#E2D9C6',
        },
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'plaque-in': 'plaqueIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spotlight-pulse': 'spotlightPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        plaqueIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        spotlightPulse: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
