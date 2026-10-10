import { useId, useState } from 'react'
import { motion } from 'motion/react'

const SLIDERS = [
  { key: 'stiffness', label: 'Stiffness', min: 20, max: 600, step: 10 },
  { key: 'damping', label: 'Damping', min: 2, max: 60, step: 1 },
  { key: 'mass', label: 'Mass', min: 0.2, max: 4, step: 0.1 },
]

// Example interactive component for posts (see src/posts/hello-mdx.mdx). Tune a spring,
// then send the dot across the track. Under reduced motion it moves without animating.
export default function SpringPlayground() {
  const id = useId()
  const [spring, setSpring] = useState({ stiffness: 200, damping: 24, mass: 1.2 })
  const [atEnd, setAtEnd] = useState(false)

  return (
    <figure className="hairline-card my-8 p-5 md:p-6">
      <div className={`flex rounded-full p-1 ${atEnd ? 'justify-end' : 'justify-start'}`} style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
        <motion.span
          layout
          transition={{ type: 'spring', ...spring }}
          className="block h-7 w-7 rounded-full"
          style={{ background: 'var(--color-accent)', boxShadow: 'var(--shadow-sm)' }}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {SLIDERS.map(({ key, label, min, max, step }) => (
          <label key={key} htmlFor={`${id}-${key}`} className="grid gap-2">
            <span className="eyebrow flex justify-between" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
              <output htmlFor={`${id}-${key}`} style={{ color: 'var(--color-text)' }}>{spring[key]}</output>
            </span>
            <input
              id={`${id}-${key}`}
              type="range"
              min={min}
              max={max}
              step={step}
              value={spring[key]}
              onChange={(e) => setSpring((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              style={{ accentColor: 'var(--color-accent)' }}
            />
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <figcaption className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Lower damping overshoots; more mass is slower to start and stop.
        </figcaption>
        <button
          type="button"
          onClick={() => setAtEnd((v) => !v)}
          className="press hover-accent-bg rounded-full px-5 py-2 text-[0.75rem] font-medium uppercase tracking-[0.15em]"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
        >
          Play
        </button>
      </div>
    </figure>
  )
}
