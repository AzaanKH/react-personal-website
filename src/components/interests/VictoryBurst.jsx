import { motion } from 'motion/react'

// Palette colours only, so the burst matches the theme in light and dark.
const COLORS = [
  'var(--color-accent)',
  'var(--color-text)',
  'color-mix(in srgb, var(--color-accent) 55%, var(--color-bg))',
  'var(--color-text-secondary)',
]

// Deterministic "random" in [0, 1): the particles are the same every render, which keeps
// rendering pure (the React Compiler lint rejects Math.random during render).
const noise = (n) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Each particle is thrown up and out in a fan between -160° and -20° (screen y points
// down, so negative is up), then falls and fades.
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = ((-160 + noise(i) * 140) * Math.PI) / 180
  const speed = 90 + noise(i + 100) * 110
  const size = 5 + noise(i + 200) * 4
  const round = i % 3 === 0
  return {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed,
    fall: 60 + noise(i + 300) * 80,
    rotate: (noise(i + 400) - 0.5) * 720,
    width: size,
    height: round ? size : size * 1.6,
    round,
    color: COLORS[i % COLORS.length],
    delay: noise(i + 500) * 0.12,
  }
})

// Confetti from the centre of its positioned parent. Plays once on mount. Callers skip it
// under reduced motion: MotionConfig would drop the transforms and leave a fading blob.
export default function VictoryBurst() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{
            left: -p.width / 2,
            top: -p.height / 2,
            width: p.width,
            height: p.height,
            borderRadius: p.round ? 9999 : 1,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0.4, opacity: 1 }}
          animate={{
            x: [0, p.x * 0.8, p.x],
            y: [0, p.y, p.y + p.fall],
            rotate: [0, p.rotate * 0.5, p.rotate],
            scale: [0.4, 1, 0.8],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.5, delay: p.delay, times: [0, 0.4, 1], ease: ['easeOut', 'easeIn'] }}
        />
      ))}
    </span>
  )
}
