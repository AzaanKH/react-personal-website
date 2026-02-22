import { motion } from 'motion/react'

export default function PageTransition({ children }) {
  return (
    <motion.div
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
