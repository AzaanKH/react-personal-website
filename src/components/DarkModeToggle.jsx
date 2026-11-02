import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon, Monitor } from 'lucide-react'

const themeOrder = ['system', 'light', 'dark']
const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}
const themeLabels = {
  system: 'Switch to light mode',
  light: 'Switch to dark mode',
  dark: 'Switch to system theme',
}

export default function DarkModeToggle({ theme, setTheme, isHome, isScrolled = false }) {
  const cycle = () => {
    const idx = themeOrder.indexOf(theme)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }

  const Icon = themeIcons[theme] || Monitor
  // On mobile the toggle sits under the nav and would float over scrolling content,
  // so it fades out once the page scrolls (keyboard focus still brings it back).
  const fadeOnMobile = !isHome && isScrolled

  return (
    <button
      onClick={cycle}
      aria-label={themeLabels[theme] || 'Toggle theme'}
      className={`fixed right-5 z-50 grid size-11 place-items-center rounded-full cursor-pointer hover-text hover:bg-[var(--color-border-subtle)] ${isHome ? 'top-5' : 'top-20 sm:top-5'} ${fadeOnMobile ? 'max-sm:pointer-events-none max-sm:opacity-0 max-sm:focus-visible:pointer-events-auto max-sm:focus-visible:opacity-100' : ''}`}
      style={{
        color: 'var(--color-text-secondary)',
        borderRadius: 9999,
        transition: 'color 0.2s ease, background-color 0.2s ease, opacity 0.25s ease',
      }}
    >
      {/* The outgoing and incoming icons share one grid cell and crossfade, so a click
          answers immediately instead of waiting out an exit. Blur blends the two shapes
          into one change rather than two icons swapping. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={theme}
          className="[grid-area:1/1]"
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
        >
          <Icon size={18} strokeWidth={1.5} />
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
