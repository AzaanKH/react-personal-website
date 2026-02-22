import { motion, AnimatePresence } from 'motion/react'
import { Sun, Moon, Monitor } from 'lucide-react'

const themeOrder = ['system', 'light', 'dark']
const themeIcons = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}
const themeLabels = {
  system: 'Using system theme',
  light: 'Switch to dark mode',
  dark: 'Switch to system theme',
}

export default function DarkModeToggle({ theme, setTheme }) {
  const cycle = () => {
    const idx = themeOrder.indexOf(theme)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }

  const Icon = themeIcons[theme] || Monitor

  return (
    <button
      onClick={cycle}
      aria-label={themeLabels[theme] || 'Toggle theme'}
      className="fixed top-6 right-6 z-50 p-2.5 rounded-full cursor-pointer hover-text hover:bg-[var(--color-border-subtle)]"
      style={{
        color: 'var(--color-text-secondary)',
        transition: 'color 0.2s ease, background-color 0.2s ease',
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon size={18} strokeWidth={1.5} />
        </motion.div>
      </AnimatePresence>
    </button>
  )
}
