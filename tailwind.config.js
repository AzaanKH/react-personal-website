import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#1a1a1a',
        bone: '#f5f0eb',
        terracotta: {
          DEFAULT: '#c45d3e',
          light: '#e07a5f',
          dark: '#b04e32',
        },
        slate: '#64748b',
      },
      transitionDuration: {
        '800': '800ms',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
