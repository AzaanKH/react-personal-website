import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react'

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'contact', label: 'Contact' },
]

export default function Navigation({ activePage, onNavigate }) {
  const isHome = activePage === 'home'
  const prefersReducedMotion = useReducedMotion()
  const navRef = useRef(null)
  const buttonRefs = useRef({})
  const [navHeight, setNavHeight] = useState(56)
  const [indicator, setIndicator] = useState(null)

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setNavHeight(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const measureIndicator = useCallback(() => {
    const btn = buttonRefs.current[activePage]
    if (btn) {
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
      })
    }
  }, [activePage])

  useEffect(() => {
    measureIndicator()
  }, [measureIndicator])

  useEffect(() => {
    window.addEventListener('resize', measureIndicator)
    return () => window.removeEventListener('resize', measureIndicator)
  }, [measureIndicator])

  const getTargetY = () => {
    if (isHome) {
      return window.innerHeight - navHeight - 40
    }
    return 24
  }

  const springY = useSpring(getTargetY(), {
    stiffness: 200,
    damping: 24,
    mass: 1.2,
  })

  useEffect(() => {
    if (prefersReducedMotion) {
      springY.jump(getTargetY())
    } else {
      springY.set(getTargetY())
    }
  }, [isHome, navHeight, prefersReducedMotion])

  useEffect(() => {
    const handleResize = () => {
      const target = getTargetY()
      if (prefersReducedMotion) {
        springY.jump(target)
      } else {
        springY.set(target)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isHome, navHeight, prefersReducedMotion])

  const homeY = typeof window !== 'undefined' ? window.innerHeight - navHeight - 40 : 700
  const otherY = 24
  const midY = (homeY + otherY) / 2

  const scale = useTransform(springY, [otherY, midY, homeY], [1, 0.97, 1])
  const glowOpacity = useTransform(springY, [otherY, midY, homeY], [0, 1, 0])

  return (
    <motion.nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className="fixed left-1/2 z-50"
      style={{
        top: 0,
        y: springY,
        x: '-50%',
        scale,
      }}
    >
      <div className="relative">
        {/* Glow during travel */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            opacity: glowOpacity,
            boxShadow: '0 0 30px 10px var(--color-accent)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative rounded-full px-2 py-2 flex items-center gap-1 backdrop-blur-sm"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Active indicator — terracotta dot beneath text */}
          {indicator && (
            <motion.div
              className="absolute bottom-1.5 h-[3px] rounded-full pointer-events-none"
              style={{
                left: 0,
                backgroundColor: 'var(--color-accent)',
              }}
              initial={false}
              animate={{
                x: indicator.left + indicator.width * 0.25,
                width: indicator.width * 0.5,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              aria-hidden="true"
            />
          )}

          {navItems.map(({ id, label }) => (
            <button
              key={id}
              ref={(el) => { buttonRefs.current[id] = el }}
              onClick={() => onNavigate(id)}
              aria-current={activePage === id ? 'page' : undefined}
              className={`relative z-10 px-5 py-2.5 rounded-full text-[0.8rem] font-medium uppercase tracking-[0.12em] cursor-pointer ${activePage !== id ? 'hover-text' : ''}`}
              style={{
                color: activePage === id ? 'var(--color-text)' : 'var(--color-text-secondary)',
                transition: 'color 0.2s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
