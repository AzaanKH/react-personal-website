import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'

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
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      }}
      exit={{
        opacity: 0,
        transition: { duration: 0.25, ease: [0.7, 0, 0.84, 0] },
      }}
      className="w-full"
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </motion.div>
  )
}
