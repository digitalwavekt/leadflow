/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        head: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          2: '#111118',
          3: '#16161f',
        },
        surface: {
          DEFAULT: '#1c1c28',
          2: '#222232',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          2: '#a78bfa',
          3: '#4ade80',
          4: '#f472b6',
          5: '#fb923c',
        },
        brand: {
          purple: '#7c5cfc',
          violet: '#a78bfa',
          green: '#4ade80',
          pink: '#f472b6',
          orange: '#fb923c',
          gold: '#fbbf24',
          red: '#f87171',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(120%)', opacity: 0 },
          to: { transform: 'translateX(0)', opacity: 1 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
