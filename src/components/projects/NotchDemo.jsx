import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Check, Hand, Pause, Sparkles, Timer } from 'lucide-react'

// A drawn re-creation of NotchRouter's compact surface, not a screen recording. Sizes,
// labels, and tints follow the app (CompactActivityView, ActivityState.tint), and the
// outline moves on the same spring as NotchMotion.surface (0.42 s, bounce 0.16).
const SURFACE_SPRING = { type: 'spring', duration: 0.42, bounce: 0.16 }
const STEP_MS = 2800

const STATES = [
  { key: 'idle', caption: 'Resting on the notch', width: 150, height: 30 },
  { key: 'running', caption: 'Codex hook · Working', width: 340, height: 58, tint: '#22d3ee' },
  { key: 'approval', caption: 'Permission request · Needs review', width: 340, height: 58, tint: '#fb923c' },
  { key: 'done', caption: 'Turn finished · Completed', width: 280, height: 30, tint: '#4ade80' },
  { key: 'music', caption: 'Music · tinted from the artwork', width: 220, height: 30, tint: '#f472b6' },
  { key: 'focus', caption: 'Focus timer · keeps running collapsed', width: 230, height: 30, tint: '#fbbf24' },
]

function Row({ children }) {
  return <div className="flex h-[30px] items-center justify-between gap-3 px-3.5">{children}</div>
}

function NotchContent({ state, active }) {
  switch (state.key) {
    case 'running':
    case 'approval':
      return (
        <div>
          <Row>
            <span className="flex items-center gap-1.5 text-white/70">
              {state.key === 'running' ? <Sparkles size={11} color={state.tint} /> : <Hand size={11} color={state.tint} />}
              T3 Code
            </span>
            <span style={{ color: state.tint }}>{state.key === 'running' ? 'Working' : 'Needs review'}</span>
          </Row>
          <div className="px-3.5 pb-2.5">
            <p className="truncate text-white">Review checkout changes</p>
            <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: state.tint }}
                initial={{ width: '35%' }}
                animate={{ width: state.key === 'running' ? '65%' : '100%' }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )
    case 'done':
      return (
        <Row>
          <span className="text-white/70">T3 Code</span>
          <span className="flex items-center gap-1" style={{ color: state.tint }}>
            <Check size={11} /> Completed
          </span>
        </Row>
      )
    case 'music':
      return (
        <Row>
          <span
            className="h-[18px] w-[18px] rounded-[4px]"
            style={{ background: `linear-gradient(135deg, ${state.tint}, #7c3aed)` }}
          />
          <span className="flex h-3 items-end gap-[2px]">
            {[0, 1, 2, 3].map((bar) => (
              <motion.span
                key={bar}
                className="w-[2px] rounded-full"
                style={{ backgroundColor: state.tint }}
                animate={{ height: active ? ['30%', '100%', '45%', '80%', '30%'] : '55%' }}
                transition={active ? { duration: 1.1, repeat: Infinity, delay: bar * 0.15, ease: 'easeInOut' } : { duration: 0.2 }}
              />
            ))}
          </span>
        </Row>
      )
    case 'focus':
      return (
        <Row>
          <span className="flex items-center gap-1.5 text-white/70">
            <Timer size={11} color={state.tint} /> Focus
          </span>
          <span className="flex items-center gap-1.5 tabular-nums text-white">
            24:59 <Pause size={10} className="text-white/60" />
          </span>
        </Row>
      )
    default:
      return null
  }
}

// Cycles through the compact states while the card is on screen and not paused (the
// pause control lives outside the card's toggle button, in ProjectsPage). Reduced motion
// shows the "needs review" state, the one the app exists for, and holds it.
export default function NotchDemo({ caption, paused }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(1)
  const cycling = inView && !prefersReducedMotion && !paused
  const state = prefersReducedMotion ? STATES[2] : STATES[step]

  useEffect(() => {
    if (!cycling) return undefined
    const timer = setTimeout(() => setStep((step + 1) % STATES.length), STEP_MS)
    return () => clearTimeout(timer)
  }, [cycling, step])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Animation of the NotchRouter panel growing out of a MacBook notch to show an AI agent working, then asking for review, then finishing, followed by the music and focus timer surfaces."
      className="relative aspect-[16/10] min-h-[190px] w-full min-w-0 overflow-hidden lg:aspect-auto lg:h-full"
      style={{
        background: 'radial-gradient(120% 90% at 30% 110%, #3b2a5c 0%, #1b2440 45%, #0b0f1a 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 flex h-[30px] items-center justify-between bg-white/[0.07] px-4 text-[0.66rem] text-white/55"
      >
        <span className="flex gap-3.5">
          <span className="font-semibold text-white/75">Finder</span>
          <span>File</span>
          <span className="hidden sm:inline">Edit</span>
          <span className="hidden sm:inline">View</span>
        </span>
        <span className="tabular-nums">Mon 9:41</span>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          className="overflow-hidden bg-black font-mono text-[0.68rem]"
          animate={{
            width: state.width,
            height: state.height,
            boxShadow: state.key === 'music' ? `0 6px 28px ${state.tint}66` : '0 4px 14px rgba(0,0,0,0.45)',
          }}
          transition={SURFACE_SPRING}
          style={{ borderRadius: '0 0 14px 14px', maxWidth: 'calc(100% - 24px)' }}
        >
          {/* Content blurs and settles toward the top edge as it swaps, like NotchMorphTransition. */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={state.key}
              initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
              transition={{ duration: 0.25 }}
            >
              <NotchContent state={state} active={cycling} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.68), transparent)', color: '#fff' }}
      >
        <p className="text-xs uppercase tracking-[0.16em]">{caption}</p>
        <p aria-hidden="true" className="truncate font-mono text-[0.62rem] text-white/70">{state.caption}</p>
      </div>
    </div>
  )
}
