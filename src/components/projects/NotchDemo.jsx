import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import {
  Check,
  ClipboardList,
  FastForward,
  Gauge,
  Hand,
  Inbox,
  Music2,
  Pause,
  Power,
  Rewind,
  Sparkles,
  Timer,
  VolumeX,
} from 'lucide-react'

// A drawn re-creation of NotchRouter on a 14" MacBook Pro, not a screen recording. The
// stage is laid out in macOS points and scaled to the card. Sizes follow NotchGeometry:
// collapsed surfaces are exactly menu-bar height and only add "wings" beside the camera
// (+80 pt for music, +220 pt otherwise); hovering opens a taller peek. Every surface also
// carries two concave "ears" where it flares into the menu bar (NotchSurfaceMetrics).
// The outline moves on NotchMotion.surface (spring, 0.42 s, bounce 0.16).
const SURFACE_SPRING = { type: 'spring', duration: 0.42, bounce: 0.16 }
const STAGE_WIDTH = 560
const STAGE_HEIGHT = 220
const NOTCH = 180
const MENU_BAR = 34
const COMPACT = { ear: 6, bottom: 10 }
const PEEK = { ear: 10, bottom: 18 }

const CYAN = '#22d3ee'
const ORANGE = '#fb923c'
const GREEN = '#4ade80'
const INDIGO = '#818cf8'
const MUSIC = '#f0a46b'

const STATES = [
  { key: 'idle', caption: 'At rest · just the notch', body: NOTCH, height: MENU_BAR, ...COMPACT },
  { key: 'running', caption: 'Codex hook · Working', body: NOTCH + 220, height: MENU_BAR, ...COMPACT },
  { key: 'running-peek', caption: 'Hover · peek with shortcuts', body: Math.max(NOTCH + 208, 408), height: Math.max(MENU_BAR + 52, 90), ...PEEK, ms: 3400 },
  { key: 'approval', caption: 'Permission request · Needs review', body: NOTCH + 220, height: MENU_BAR, ...COMPACT },
  { key: 'done', caption: 'Turn finished · Completed', body: NOTCH + 220, height: MENU_BAR, ...COMPACT },
  { key: 'music', caption: 'Music · cover and playback only', body: NOTCH + 80, height: MENU_BAR, ...COMPACT, glow: MUSIC },
  { key: 'music-peek', caption: 'Hover · mini-player', body: Math.max(NOTCH + 238, 438), height: Math.max(MENU_BAR + 126, 158), ...PEEK, glow: MUSIC, ms: 3800 },
  { key: 'focus', caption: 'Focus timer · keeps counting', body: NOTCH + 220, height: MENU_BAR, ...COMPACT },
]
const DEFAULT_MS = 2600
const HELD = STATES.findIndex((state) => state.key === 'approval')

// Content sits in the wings; the middle stays clear for the camera housing.
function Wings({ left, right, padding = 12 }) {
  return (
    <div className="flex items-center gap-2" style={{ height: MENU_BAR, paddingInline: padding }}>
      <div className="flex min-w-0 flex-1 items-center gap-[7px]">{left}</div>
      <div className="shrink-0" style={{ width: NOTCH - 20 }} />
      <div className="flex min-w-0 flex-1 items-center justify-end gap-[7px]">{right}</div>
    </div>
  )
}

function Glyph({ icon: Icon, tint }) {
  return (
    <span
      className="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${tint}2e`, boxShadow: `inset 0 0 0 1px ${tint}38`, color: tint }}
    >
      <Icon size={9} strokeWidth={2.5} />
    </span>
  )
}

function Bars({ active, tint }) {
  return (
    <span className="flex h-[11px] items-end gap-[2px]">
      {[0, 1, 2, 3].map((bar) => (
        <motion.span
          key={bar}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: tint }}
          animate={{ height: active ? ['30%', '100%', '45%', '80%', '30%'] : '55%' }}
          transition={active ? { duration: 1.1, repeat: Infinity, delay: bar * 0.15, ease: 'easeInOut' } : { duration: 0.2 }}
        />
      ))}
    </span>
  )
}

function Artwork({ size, radius }) {
  return (
    <span
      className="block shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(160deg, #2b4a6b 0%, #c98a5a 55%, #3a2618 100%)',
      }}
    />
  )
}

function SectionShortcuts({ sections, power }) {
  return (
    <div className="flex gap-1.5">
      {sections.map(({ label, icon: Icon }) => (
        <span
          key={label}
          className="flex h-[26px] flex-1 items-center justify-center gap-1 rounded-[7px] bg-white/[0.09] text-[10px] font-semibold text-white/85"
        >
          <Icon size={10} strokeWidth={2} />
          {label}
        </span>
      ))}
      {power && (
        <span className="flex h-[26px] w-8 items-center justify-center rounded-[7px] bg-white/[0.09] text-red-400">
          <Power size={10} strokeWidth={2.5} />
        </span>
      )}
    </div>
  )
}

const ACTIVITY_SHORTCUTS = [
  { label: 'Focus', icon: Timer },
  { label: 'Files', icon: Inbox },
  { label: 'Music', icon: Music2 },
  { label: 'Clipboard', icon: ClipboardList },
  { label: 'System', icon: Gauge },
]
const MUSIC_SHORTCUTS = [
  { label: 'Activity', icon: Sparkles },
  { label: 'Focus', icon: Timer },
  { label: 'Files', icon: Inbox },
  { label: 'Clipboard', icon: ClipboardList },
  { label: 'System', icon: Gauge },
]

function ActivityRow({ icon, tint, label, title }) {
  return (
    <Wings
      left={
        <>
          <Glyph icon={icon} tint={tint} />
          <span className="truncate text-[12px] font-semibold text-white">Codex</span>
        </>
      }
      right={
        <span className="flex min-w-0 flex-col items-end leading-tight">
          <span className="text-[10px] font-semibold" style={{ color: tint }}>{label}</span>
          {title && <span className="max-w-full truncate text-[10px] text-white/60">{title}</span>}
        </span>
      }
    />
  )
}

function NotchContent({ state, active }) {
  switch (state.key) {
    case 'idle':
      return null
    case 'running':
      return <ActivityRow icon={Sparkles} tint={CYAN} label="Working" />
    case 'running-peek':
      return (
        <div className="space-y-[5px] pb-[7px]">
          <ActivityRow icon={Sparkles} tint={CYAN} label="Working" title="Review checkout changes" />
          <div className="px-3">
            <SectionShortcuts sections={ACTIVITY_SHORTCUTS} />
          </div>
        </div>
      )
    case 'approval':
      return <ActivityRow icon={Hand} tint={ORANGE} label="Needs review" />
    case 'done':
      return <ActivityRow icon={Check} tint={GREEN} label="Completed" />
    case 'music':
      return <Wings padding={9} left={<Artwork size={19} radius={5} />} right={<Bars active={active} tint={MUSIC} />} />
    case 'music-peek':
      return (
        <div className="space-y-[5px] px-2.5 pb-[7px]">
          <Wings
            padding={0}
            left={
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white">
                <Bars active={active} tint={MUSIC} /> Spotify
              </span>
            }
            right={<Bars active={active} tint={MUSIC} />}
          />
          <div className="flex items-center gap-[9px]">
            <span className="shrink-0" style={{ boxShadow: `0 0 8px ${MUSIC}73`, borderRadius: 8 }}>
              <Artwork size={34} radius={8} />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[12px] font-semibold text-white">Water</span>
              <span className="block truncate text-[10px] text-white/60">Jordan Mitchell</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12] text-white"><Rewind size={11} fill="currentColor" /></span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"><Pause size={12} fill="currentColor" /></span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12] text-white"><FastForward size={11} fill="currentColor" /></span>
            </span>
          </div>
          <div className="ml-auto flex max-w-[190px] items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-white/80"><VolumeX size={10} /></span>
            <span className="relative h-[3px] flex-1 rounded-full bg-white/20">
              <span className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-white/60" />
              <span className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white/80" style={{ left: 'calc(62% - 6px)' }} />
            </span>
          </div>
          <SectionShortcuts sections={MUSIC_SHORTCUTS} power />
        </div>
      )
    case 'focus':
      return (
        <Wings
          left={
            <>
              <Glyph icon={Timer} tint={INDIGO} />
              <span className="text-[12px] font-semibold text-white">Focus</span>
            </>
          }
          right={<span className="text-[12px] font-bold tabular-nums" style={{ color: INDIGO }}>24:59</span>}
        />
      )
    default:
      return null
  }
}

// The surface: a body with bottom corners plus two concave ears that flare into the
// menu bar, all animated together so the outline reads as part of the cutout.
function Surface({ state, active }) {
  const width = state.body + 2 * state.ear
  const ear = (side) => ({
    width: state.ear,
    height: state.ear,
    background: `radial-gradient(circle at ${side === 'left' ? '0' : '100%'} 100%, transparent ${state.ear - 0.5}px, #000 ${state.ear}px)`,
  })

  return (
    <motion.div
      className="relative"
      initial={false}
      animate={{ width, height: state.height }}
      transition={SURFACE_SPRING}
    >
      <motion.span className="absolute left-0 top-0" initial={false} animate={ear('left')} transition={SURFACE_SPRING} />
      <motion.span className="absolute right-0 top-0" initial={false} animate={ear('right')} transition={SURFACE_SPRING} />
      <motion.div
        className="absolute inset-y-0 overflow-hidden bg-black font-sans"
        initial={false}
        animate={{
          left: state.ear,
          right: state.ear,
          borderBottomLeftRadius: state.bottom,
          borderBottomRightRadius: state.bottom,
          boxShadow: state.glow ? `0 4px 22px ${state.glow}55` : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={SURFACE_SPRING}
      >
        {/* Content is laid out at its final width and blurs as it swaps, like
            NotchMorphTransition, so it never reflows while the outline springs. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={state.key}
            className="absolute left-1/2 top-0"
            style={{ width: state.body, marginLeft: -state.body / 2 }}
            initial={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.25 }}
          >
            <NotchContent state={state} active={active} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

// Cycles through the states while the card is on screen and not paused (the pause
// control lives outside the card's toggle button, in ProjectsPage). Reduced motion
// shows the "needs review" state, the one the app exists for, and holds it.
export default function NotchDemo({ caption, paused }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.4 })
  const prefersReducedMotion = useReducedMotion()
  const [step, setStep] = useState(1)
  const [scale, setScale] = useState(0.8)
  const cycling = inView && !prefersReducedMotion && !paused
  const state = prefersReducedMotion ? STATES[HELD] : STATES[step]

  useEffect(() => {
    if (!cycling) return undefined
    const timer = setTimeout(() => setStep((step + 1) % STATES.length), state.ms ?? DEFAULT_MS)
    return () => clearTimeout(timer)
  }, [cycling, step, state.ms])

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / STAGE_WIDTH))
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Animation of the NotchRouter panel on a MacBook notch: collapsed to menu-bar height while Codex works, asks for review, and finishes, opening into a taller peek on hover, then the music, mini-player, and focus timer surfaces."
      className="relative aspect-[16/10] min-h-[190px] w-full min-w-0 overflow-hidden lg:aspect-auto lg:h-full"
      style={{
        background: 'radial-gradient(120% 90% at 30% 110%, #3b2a5c 0%, #1b2440 45%, #0b0f1a 100%)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-between bg-black/45 px-4 text-[13px] text-white/80"
          style={{ height: MENU_BAR }}
        >
          <span className="font-semibold text-white">Finder</span>
          <span className="tabular-nums">Mon 9:41</span>
        </div>
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <Surface state={state} active={cycling} />
        </div>
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
