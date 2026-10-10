import { useEffect, useState } from 'react'
import { motion, useAnimate, useReducedMotion } from 'motion/react'
import { ArrowRight, Mail, FileText } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from '../components/BrandIcons'
import RouteLink from '../components/RouteLink'
import StatusCorner from '../components/StatusCorner'

const MotionRouteLink = motion.create(RouteLink)

let hasPlayedIntro = false

const socialLinks = [
  { icon: GithubIcon, href: 'https://github.com/AzaanKH', label: 'GitHub' },
  { icon: LinkedinIcon, href: 'https://www.linkedin.com/in/azaan-khalfe-43b90b221/', label: 'LinkedIn' },
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

  useEffect(() => {
    hasPlayedIntro = true
  }, [])

  // Once the intro has settled, the View projects arrow nudges right twice to point at
  // the next step. First visit only, so it never loops or replays. Started imperatively:
  // App's AnimatePresence initial={false} skips mount animations on a direct visit.
  // useState pins the first render's value; playIntro turns false on later renders.
  const [nudgeArrow] = useState(playIntro)
  const [arrowScope, animateArrow] = useAnimate()

  useEffect(() => {
    if (!nudgeArrow) return undefined
    const controls = animateArrow(
      arrowScope.current,
      { x: [0, 5, 0, 5, 0] },
      { delay: 1.8, duration: 1.1, ease: 'easeInOut' },
    )
    return () => controls.stop()
  }, [nudgeArrow, animateArrow, arrowScope])

  return (
    <div
      className="page-shell relative flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center overflow-hidden px-1 pb-32 pt-8 text-center lg:pb-24"
    >
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

        <motion.div {...reveal(0.86, playIntro, 10)} className="mt-8">
          <RouteLink
            to="projects"
            onNavigate={onNavigate}
            className="press group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em] hover-accent-bg"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-bg)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            View projects
            <span ref={arrowScope} className="inline-flex" aria-hidden="true">
              <ArrowRight
                size={15}
                strokeWidth={1.75}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </RouteLink>
        </motion.div>

        <motion.div
          {...reveal(0.94, playIntro, 10)}
          className="mt-7 flex items-center justify-center"
        >
          {/* Each link is a 44px tap target around a 19px icon; the box edges stand in
              for the old gap-5 spacing. */}
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="hover-accent grid size-11 place-items-center rounded-full"
              style={{ color: 'var(--color-text-secondary)' }}
              {...socialMotion}
            >
              <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
            </motion.a>
          ))}

          <MotionRouteLink
            to="contact"
            onNavigate={onNavigate}
            aria-label="Contact me"
            className="hover-accent grid size-11 place-items-center rounded-full"
            style={{ color: 'var(--color-text-secondary)' }}
            {...socialMotion}
          >
            <Mail size={19} strokeWidth={1.5} aria-hidden="true" />
          </MotionRouteLink>

          <span className="mx-2 h-4 w-px" style={{ backgroundColor: 'var(--color-border)' }} aria-hidden="true" />

          <motion.a
            href="/Azaan_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.7rem] font-light uppercase tracking-[0.16em] hover-accent sm:text-xs"
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
