import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useSpring, useTransform, useReducedMotion } from 'motion/react'
import RouteLink from './RouteLink'
import { pageIds, routes } from '../lib/routes'

const TOP_OFFSET = 24
const HOME_BOTTOM_OFFSET = 40
const HOME_BOTTOM_OFFSET_WITH_STATUS = 136
const STATUS_VISIBLE_MIN_WIDTH = 640
const STATUS_CAN_SHARE_ROW_MIN_WIDTH = 1280

function getHomeBottomOffset() {
  if (typeof window === 'undefined') return HOME_BOTTOM_OFFSET

  if (window.innerHeight <= 720) return HOME_BOTTOM_OFFSET

  const statusCornersVisible = window.innerWidth >= STATUS_VISIBLE_MIN_WIDTH
  const statusCanShareBottomRow = window.innerWidth >= STATUS_CAN_SHARE_ROW_MIN_WIDTH

  return statusCornersVisible && !statusCanShareBottomRow
    ? HOME_BOTTOM_OFFSET_WITH_STATUS
    : HOME_BOTTOM_OFFSET
}

export default function Navigation({ activePage, onNavigate }) {
  const isHome = activePage === 'home'
  const prefersReducedMotion = useReducedMotion()
  const navRef = useRef(null)
  const linkRefs = useRef({})
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
    const btn = linkRefs.current[activePage]
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

  const getTargetY = useCallback(() => {
    if (isHome) {
      return window.innerHeight - navHeight - getHomeBottomOffset()
    }
    return TOP_OFFSET
  }, [isHome, navHeight])

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
  }, [getTargetY, prefersReducedMotion, springY])

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
  }, [getTargetY, prefersReducedMotion, springY])

  const homeY = typeof window !== 'undefined'
    ? window.innerHeight - navHeight - getHomeBottomOffset()
    : 700
  const otherY = TOP_OFFSET
  const midY = (homeY + otherY) / 2

  const scale = useTransform(springY, [otherY, midY, homeY], [1, 0.97, 1])
  const glowOpacity = useTransform(springY, [otherY, midY, homeY], [0, 1, 0])

  return (
    <motion.nav
      ref={navRef}
      aria-label="Main navigation"
      className="fixed left-1/2 z-50 w-[calc(100vw-1rem)] max-w-[390px] md:w-auto md:max-w-none"
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
          className="relative flex w-full items-center justify-between gap-1 rounded-full px-1 py-1.5 backdrop-blur-sm md:w-auto md:justify-start md:px-2 md:py-2"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 9999,
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

          {pageIds.map((id) => (
            <RouteLink
              key={id}
              to={id}
              onNavigate={onNavigate}
              ref={(el) => { linkRefs.current[id] = el }}
              aria-current={activePage === id ? 'page' : undefined}
              className={`hit-area z-10 min-w-0 rounded-full px-1 py-2 text-center text-[0.68rem] font-medium uppercase tracking-[0.05em] md:px-5 md:py-2.5 md:text-[0.8rem] md:tracking-[0.12em] ${activePage !== id ? 'hover-text' : ''}`}
              style={{
                color: activePage === id ? 'var(--color-text)' : 'var(--color-text-secondary)',
                transition: 'color 0.2s ease',
              }}
            >
              {routes[id].label}
            </RouteLink>
          ))}
        </div>
      </div>
    </motion.nav>
  )
}
