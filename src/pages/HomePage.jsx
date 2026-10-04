import { useEffect } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Github, Linkedin, Mail, FileText } from 'lucide-react'
import StatusCorner from '../components/StatusCorner'

let hasPlayedIntro = false

const socialLinks = [
  { icon: Github, href: 'https://github.com/AzaanKH', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/azaan-khalfe-43b90b221/', label: 'LinkedIn' },
]

const reveal = (delay, playIntro, distance = 16) => ({
  initial: playIntro ? { opacity: 0, y: distance } : false,
  animate: { opacity: 1, y: 0 },
  transition: playIntro
    ? { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    : { duration: 0 },
})

function AnimatedNameLine({ text, startDelay, playIntro }) {
  return (
    <span className="block overflow-hidden" aria-hidden="true">
      <span className="block whitespace-nowrap">
        {text.split('').map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            className="inline-block"
            initial={playIntro ? { opacity: 0, y: '85%', rotate: 1.5 } : false}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={playIntro ? {
              delay: startDelay + index * 0.035,
              duration: 0.62,
              ease: [0.16, 1, 0.3, 1],
            } : { duration: 0 }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </span>
  )
}

const socialMotion = {
  whileHover: { y: -3, scale: 1.06 },
  whileTap: { scale: 0.94 },
  transition: { type: 'spring', stiffness: 360, damping: 22 },
}

export default function HomePage({ onNavigate }) {
  const prefersReducedMotion = useReducedMotion()
  const isFirstVisit = !hasPlayedIntro
  const playIntro = isFirstVisit && !prefersReducedMotion
  const glowX = useMotionValue(0)
  const glowY = useMotionValue(0)
  const smoothGlowX = useSpring(glowX, { stiffness: 90, damping: 24, mass: 0.7 })
  const smoothGlowY = useSpring(glowY, { stiffness: 90, damping: 24, mass: 0.7 })

  useEffect(() => {
    hasPlayedIntro = true
  }, [])

  const handlePointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType === 'touch') return

    const bounds = event.currentTarget.getBoundingClientRect()
    glowX.set(event.clientX - bounds.left - bounds.width / 2)
    glowY.set(event.clientY - bounds.top - bounds.height * 0.42)
  }

  const resetGlow = () => {
    glowX.set(0)
    glowY.set(0)
  }

  return (
    <div
      className="page-shell relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-1 pb-32 pt-8 text-center lg:pb-24"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetGlow}
    >
      <div className="pointer-events-none absolute left-1/2 top-[42%] hidden -translate-x-1/2 -translate-y-1/2 md:block" aria-hidden="true">
        <motion.div
          className="h-[420px] w-[420px] rounded-full"
          style={{
            x: smoothGlowX,
            y: smoothGlowY,
            opacity: prefersReducedMotion ? 0 : 1,
            willChange: 'transform',
            background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 11%, transparent) 0%, transparent 68%)',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <h1
          className="select-none font-bold uppercase leading-[0.8] tracking-[-0.065em]"
          style={{ color: 'var(--color-text)', fontSize: 'clamp(4rem, min(12vw, 20vh), 9.5rem)' }}
          aria-label="Azaan Khalfe"
        >
          <AnimatedNameLine text="AZAAN" startDelay={0.02} playIntro={playIntro} />
          <AnimatedNameLine text="KHALFE" startDelay={0.15} playIntro={playIntro} />
        </h1>

        <motion.p
          {...reveal(0.58, playIntro, 10)}
          className="mt-7 text-[0.72rem] font-light uppercase tracking-[0.32em] sm:text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Software Engineer
        </motion.p>

        <motion.div
          className="mt-5 h-[3px] rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
          initial={playIntro ? { opacity: 0, width: 0 } : false}
          animate={{ opacity: 1, width: 56 }}
          transition={playIntro ? { delay: 0.7, duration: 0.55, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
          aria-hidden="true"
        />

        <motion.p
          {...reveal(0.78, playIntro, 12)}
          className="mt-5 max-w-[560px] px-4 text-sm leading-6 sm:text-[0.95rem]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          I build reliable developer tools, intelligent systems, and polished web experiences.
        </motion.p>

        <motion.div
          {...reveal(0.94, playIntro, 10)}
          className="mt-7 flex items-center justify-center gap-5"
        >
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hover-accent"
              style={{ color: 'var(--color-text-secondary)' }}
              {...socialMotion}
            >
              <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            </motion.a>
          ))}

          <motion.button
            type="button"
            onClick={() => onNavigate('contact')}
            aria-label="Send email"
            className="hover-accent"
            style={{ color: 'var(--color-text-secondary)' }}
            {...socialMotion}
          >
            <Mail size={19} strokeWidth={1.5} aria-hidden="true" />
          </motion.button>

          <span className="h-4 w-px" style={{ backgroundColor: 'var(--color-border)' }} aria-hidden="true" />

          <motion.a
            href="/Azaan_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[0.7rem] font-light uppercase tracking-[0.16em] hover-accent sm:text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
            {...socialMotion}
          >
            <FileText size={15} strokeWidth={1.5} aria-hidden="true" />
            Résumé
          </motion.a>
        </motion.div>
      </div>

      <StatusCorner enterDelay={1.12} animate={playIntro} />
    </div>
  )
}
