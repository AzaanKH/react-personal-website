import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowUpRight, ChevronDown } from 'lucide-react'

const projects = [
  {
    name: 'DevEnv MCP Server',
    description:
      'Model Context Protocol server enabling AI assistants to manage local development environments with Docker orchestration, virtual environments, and system monitoring.',
    highlights: [
      'Architected MCP server with 12 tools for Docker orchestration, virtual environments, process monitoring, and system health',
      'Optimized concurrent operations using asyncio.gather for parallel subprocess execution, reducing virtual environment discovery latency from 5.1s to 1.2s (4.2x speedup)',
      'Designed structured Pydantic response schemas for AI-parseable outputs with cross-platform abstractions (Windows/macOS/Linux) using psutil',
      'Built comprehensive test suite with 80+ unit tests and implemented safety patterns using confirmation dialogs for destructive operations',
    ],
    tech: 'Python, FastMCP, asyncio, Pydantic, psutil, Docker',
    metrics: '80+ unit tests · 4.2x speedup',
    url: 'https://github.com/AzaanKH/devenv-mcp',
  },
  {
    name: 'NFL Fantasy Picker',
    description:
      'Machine learning-powered fantasy football recommendations using XGBoost predictions with multi-source data pipelines.',
    highlights: [
      'Architected multi-source data pipeline with automatic fallback orchestration (Sleeper API → ESPN API → web scraping), processing 10,000+ player-week statistical records with rate limiting',
      'Trained position-specific XGBoost models achieving 2.9 MAE with confidence intervals, using 22 engineered features including rolling averages, efficiency metrics, and trend indicators',
      'Designed PostgreSQL + TimescaleDB schema for time-series statistics, enabling efficient rolling window queries across 17 weeks × 3 seasons of historical data',
    ],
    tech: 'React, Python, Flask, PostgreSQL, TimescaleDB',
    metrics: '2.9 MAE · 10,000+ records',
    url: 'https://github.com/AzaanKH/football',
  },
  {
    name: 'Distributed Paxos Consensus',
    description:
      'Fault-tolerant distributed system using the Paxos consensus algorithm, ensuring agreement across nodes under network partition scenarios.',
    highlights: [
      'Implemented Paxos consensus algorithm ensuring consensus across 12+ nodes under network partition scenarios',
      'Built communication protocols handling 1000+ messages/second with fault tolerance',
    ],
    tech: 'Java',
    metrics: '12+ nodes · 1000+ msg/sec',
    url: null,
  },
]

export default function ProjectsPage() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggle = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i)
  }

  return (
    <div className="w-full max-w-[800px] mx-auto pt-4 md:pt-8 pb-8 px-6">
      <h2
        className="font-bold tracking-[-0.02em] mb-12"
        style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: 'var(--color-text)',
        }}
      >
        Projects
      </h2>

      <div className="space-y-4">
        {projects.map((project, i) => {
          const isExpanded = expandedIndex === i

          return (
            <motion.div
              key={project.name}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                className="group block cursor-pointer rounded-xl px-6 py-5"
                style={{
                  backgroundColor: isExpanded ? 'var(--color-surface)' : 'transparent',
                  border: `1px solid ${isExpanded ? 'var(--color-border)' : 'transparent'}`,
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
                  transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
                }}
                whileHover={!isExpanded ? { x: 4 } : {}}
                transition={{ duration: 0.2 }}
                onClick={() => toggle(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(i)
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold"
                      style={{
                        fontSize: 'clamp(1.3rem, 2.5vw, 2rem)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {project.name}
                    </h3>
                    {!isExpanded && (
                      <p
                        className="mt-2 line-clamp-2"
                        style={{
                          fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="mt-2 flex-shrink-0"
                  >
                    <ChevronDown
                      size={20}
                      strokeWidth={1.5}
                      style={{
                        color: 'var(--color-text-secondary)',
                        opacity: 0.5,
                        transition: 'opacity 0.2s',
                      }}
                      aria-hidden="true"
                    />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 pb-1">
                        <ul className="space-y-2.5 mb-5">
                          {project.highlights.map((point, pi) => (
                            <motion.li
                              key={pi}
                              className="flex items-start gap-3"
                              style={{
                                fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                              }}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.05 + pi * 0.06,
                                duration: 0.3,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              <span
                                className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                                style={{ backgroundColor: 'var(--color-accent)' }}
                                aria-hidden="true"
                              />
                              <span>{point}</span>
                            </motion.li>
                          ))}
                        </ul>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech.split(', ').map((t, ti) => (
                            <motion.span
                              key={t}
                              className="px-3 py-1 rounded-full text-[0.7rem] font-medium tracking-wide"
                              style={{
                                backgroundColor: 'var(--color-border-subtle)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: 0.3 + ti * 0.05,
                                duration: 0.25,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              {t}
                            </motion.span>
                          ))}
                        </div>

                        <motion.p
                          className="text-[0.7rem] tracking-[0.15em] uppercase font-light mb-3"
                          style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 0.7, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                        >
                          {project.metrics}
                        </motion.p>

                        {project.url && (
                          <motion.a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                            style={{ color: 'var(--color-accent)' }}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                          >
                            View on GitHub
                            <ArrowUpRight size={14} strokeWidth={1.5} />
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {i < projects.length - 1 && !isExpanded && (
                <div
                  className="h-px mx-6"
                  style={{ backgroundColor: 'var(--color-border)' }}
                  aria-hidden="true"
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
