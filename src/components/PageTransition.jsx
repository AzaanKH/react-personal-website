import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { EASE_OUT } from '../lib/motion'

export default function PageTransition({ children, focusHeading = false }) {
  const ref = useRef(null)

  // After client-side navigation, move focus to the new page's heading so screen
  // reader and keyboard users land on the new content instead of the old nav link.
  useEffect(() => {
    if (!focusHeading) return
    const heading = ref.current?.querySelector('h1')
    if (!heading) return

    heading.setAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
  }, [focusHeading])

  return (
    <motion.div
      ref={ref}
      // Navigation is the most frequent motion on the site, and mode="wait" runs exit then
      // enter back to back, so both stay short: ~450ms door to door. The exit is ease-out
      // too; an ease-in exit spends its first frames looking like nothing happened.
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: EASE_OUT },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.15, ease: 'easeOut' },
      }}
      className="w-full"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}
