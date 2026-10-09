import { Fragment, useEffect, useId, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

// Each trace step stays up long enough to read its description and example: a base
// pause plus ~250 ms per word (about 240 wpm), clamped so short steps don't flash by.
function readingTime(step) {
  const words = [step.detail, ...(step.example ?? [])].join(' ').split(/\s+/).filter(Boolean).length
  return Math.min(Math.max(3000 + words * 250, 6000), 14000)
}

// Interactive system diagram. Every node is a button: selecting one lights the path up
// to it and shows what that part does, plus what happens to one running example there.
// "Trace" walks the whole flow. Steps are numbered across lanes in reading order, so
// "visited" is just index <= active. The packet on the connector into the selected node
// loops only while tracing; otherwise it makes a single pass, so a paused diagram is still.
export default function ArchitectureFlow({ flow, name }) {
  const panelId = useId()
  const { lanes, scenario } = flow
  const steps = lanes.flatMap((lane) => lane.nodes.map((node) => ({ ...node, lane: lane.label })))
  const last = steps.length - 1
  const [active, setActive] = useState(0)
  const [tracing, setTracing] = useState(false)
  const current = steps[active]
  const stepMs = readingTime(current)

  useEffect(() => {
    if (!tracing) return undefined
    const timer = setTimeout(() => {
      if (active >= last) setTracing(false)
      else setActive(active + 1)
    }, stepMs)
    return () => clearTimeout(timer)
  }, [tracing, active, last, stepMs])

  const select = (index) => {
    setTracing(false)
    setActive(Math.min(Math.max(index, 0), last))
  }

  const toggleTrace = () => {
    if (tracing) {
      setTracing(false)
      return
    }
    if (active >= last) setActive(0)
    setTracing(true)
  }

  // Index of each lane's first node in `steps`.
  const laneStarts = lanes.map((_, i) => lanes.slice(0, i).reduce((sum, lane) => sum + lane.nodes.length, 0))

  return (
    <div>
      <div className="space-y-5">
        {lanes.map((lane, laneIndex) => {
          const start = laneStarts[laneIndex]

          return (
            <div key={lane.label} role="group" aria-label={lane.label}>
              <p
                className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {String(laneIndex + 1).padStart(2, '0')} · {lane.label}
              </p>
              <ol className="flex flex-col md:flex-row md:items-stretch">
                {lane.nodes.map((node, nodeIndex) => {
                  const index = start + nodeIndex
                  const isActive = index === active
                  const visited = index <= active

                  return (
                    <Fragment key={node.label}>
                      {nodeIndex > 0 && (
                        <li aria-hidden="true" className="arch-connector" data-lit={visited}>
                          <span className="arch-connector-fill" />
                          {isActive && (
                            <span key={active} className="arch-packet" data-loop={tracing} />
                          )}
                        </li>
                      )}
                      <motion.li
                        className="md:min-w-0 md:flex-1"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <button
                          type="button"
                          onClick={() => select(index)}
                          aria-pressed={isActive}
                          aria-controls={panelId}
                          className="relative flex h-full min-h-[58px] w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left text-[0.74rem] font-medium leading-snug md:flex-col md:items-start md:justify-center md:gap-1 hover:-translate-y-0.5"
                          style={{
                            color: visited ? 'var(--color-text)' : 'var(--color-text-secondary)',
                            backgroundColor: isActive ? 'var(--color-surface)' : 'var(--color-surface-elevated)',
                            border: `1px solid ${visited ? 'color-mix(in srgb, var(--color-accent) 40%, var(--color-border))' : 'var(--color-border)'}`,
                            borderRadius: 10,
                            boxShadow: isActive ? 'var(--shadow-md)' : 'none',
                            transition: 'transform 0.15s ease, color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                          }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId={`arch-ring-${name}`}
                              className="pointer-events-none absolute -inset-px"
                              style={{ border: '1.5px solid var(--color-accent)', borderRadius: 10 }}
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className="font-mono text-[0.58rem] tracking-[0.1em]"
                            style={{ color: visited ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
                            aria-hidden="true"
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {node.label}
                        </button>
                      </motion.li>
                    </Fragment>
                  )
                })}
              </ol>
            </div>
          )
        })}
      </div>

      <div
        className="mt-5 rounded-lg p-4"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="mb-4 flex gap-1" aria-hidden="true">
          {steps.map((step, index) => {
            const filling = index === active && tracing

            return (
              <span
                key={step.label}
                className="h-[3px] flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                {index <= active && (
                  <motion.span
                    key={filling ? `filling-${active}` : 'filled'}
                    className="block h-full"
                    style={{ backgroundColor: 'var(--color-accent)', originX: 0 }}
                    initial={{ scaleX: filling ? 0 : 1 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: filling ? stepMs / 1000 : 0, ease: 'linear' }}
                  />
                )}
              </span>
            )
          })}
        </div>

        <div id={panelId} aria-live="polite" className="min-h-[150px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <div className="min-w-0">
                <p
                  className="font-mono text-[0.6rem] uppercase tracking-[0.14em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Step {active + 1} of {steps.length} · {current.lane}
                </p>
                <p className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {current.label}
                </p>
                <p className="mt-1 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {current.detail}
                </p>
              </div>

              {current.example && (
                <ExampleTrace scenario={scenario} lines={current.example} live={tracing} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-[0.68rem] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
            Example values are illustrative.
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            <FlowButton label="Previous step" onClick={() => select(active - 1)} disabled={active === 0}>
              <ChevronLeft size={15} strokeWidth={1.75} aria-hidden="true" />
            </FlowButton>
            <FlowButton label={tracing ? 'Pause trace' : 'Trace the flow'} onClick={toggleTrace} wide>
              {tracing ? (
                <Pause size={13} strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Play size={13} strokeWidth={1.75} aria-hidden="true" />
              )}
              <span aria-hidden="true">{tracing ? 'Pause' : 'Trace'}</span>
            </FlowButton>
            <FlowButton label="Next step" onClick={() => select(active + 1)} disabled={active === last}>
              <ChevronRight size={15} strokeWidth={1.75} aria-hidden="true" />
            </FlowButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// The running example at this step, printed line by line like a console. Only the
// newest line shows the cursor, and it blinks only while the trace is playing.
function ExampleTrace({ scenario, lines, live }) {
  return (
    <figure
      className="min-w-0 overflow-hidden rounded-md"
      style={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
    >
      <figcaption
        className="flex items-center gap-2 border-b px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.14em]"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} aria-hidden="true" />
        <span className="truncate">Example · {scenario}</span>
      </figcaption>
      <div className="px-3 py-2.5">
        {lines.map((line, index) => (
          <motion.p
            key={`${index}-${line}`}
            className="whitespace-pre-wrap break-words font-mono text-[0.68rem] leading-[1.7]"
            style={{ color: line.startsWith('→') ? 'var(--color-accent)' : 'var(--color-text)' }}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.22, duration: 0.25 }}
          >
            {line || ' '}
            {index === lines.length - 1 && (
              <span
                className={live ? 'terminal-cursor' : undefined}
                style={{ color: 'var(--color-accent)' }}
                aria-hidden="true"
              >
                {' ▍'}
              </span>
            )}
          </motion.p>
        ))}
      </div>
    </figure>
  )
}

function FlowButton({ label, onClick, disabled, wide, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-[0.08em] hover:opacity-80 disabled:cursor-default disabled:opacity-35 ${wide ? 'px-3' : 'w-8'}`}
      style={{
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 9999,
      }}
    >
      {children}
    </button>
  )
}
