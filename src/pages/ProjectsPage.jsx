import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  GitBranch,
  Layers,
  Pause,
  Play,
} from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'
import ArchitectureFlow from '../components/projects/ArchitectureFlow'
import NotchDemo from '../components/projects/NotchDemo'
import { projects } from '../data/projects'
import { EASE_OUT } from '../lib/motion'


// A metric with a `note` gets an asterisk and a footnote under the strip, for numbers
// that need their method stated (e.g. which decisions an accuracy figure counts).
function MetricStrip({ metrics }) {
  const notes = metrics.filter((metric) => metric.note)

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={`${metric.value}-${metric.label}`}
            className="min-h-[68px] px-3 py-3"
            style={{
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
            }}
          >
            <p
              className="font-semibold leading-none"
              style={{ color: 'var(--color-text)', fontSize: 'var(--text-metric)' }}
            >
              {metric.value}
              {metric.note && (
                <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>*</span>
              )}
            </p>
            <p
              className="mt-2 text-[0.68rem] uppercase tracking-[0.12em] leading-tight"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {metric.label}
            </p>
          </div>
        ))}
      </div>
      {notes.map((metric) => (
        <p
          key={metric.label}
          className="mt-2 text-xs leading-5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>* </span>
          {metric.note}
        </p>
      ))}
    </div>
  )
}

function ProofVisual({ screenshot, name, paused }) {
  if (screenshot.type === 'notch') return <NotchDemo caption={screenshot.caption} paused={paused} />

  if (screenshot.type === 'image') {
    return (
      // The image never sets the card's height: below lg the frame is a fixed 16:10 box,
      // and from lg it stretches to the text column. Tall crops show their top.
      <div
        className="relative aspect-[16/10] min-h-[190px] overflow-hidden lg:aspect-auto lg:h-full"
        style={{
          backgroundColor: screenshot.background ?? 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
        }}
      >
        <img
          src={screenshot.src}
          alt={screenshot.alt}
          width={screenshot.width}
          height={screenshot.height}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full ${screenshot.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
          style={{ objectPosition: screenshot.position ?? 'center' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 px-4 py-3"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.68), transparent)',
            color: '#fff',
          }}
        >
          <p className="text-xs uppercase tracking-[0.16em]">{screenshot.caption ?? 'Screenshot'}</p>
        </div>
      </div>
    )
  }

  return (
    <PanelFrame title={screenshot.title} status={screenshot.status} label={`${name}: ${screenshot.title}`}>
      {screenshot.type === 'quorum' ? <QuorumDiagram {...screenshot} /> : <TerminalSession session={screenshot.session} />}
    </PanelFrame>
  )
}

// Shared frame for the drawn panels: hairline title bar, content that fills the card's
// height, and a status bar pinned to the bottom (so the panel never looks half empty).
function PanelFrame({ title, status, label, children }) {
  return (
    <figure
      className="flex h-full min-h-[240px] flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 10,
      }}
      aria-label={label}
    >
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
          ))}
        </div>
        <figcaption className="text-[0.64rem] uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-secondary)' }}>
          {title}
        </figcaption>
      </div>
      <div className="flex flex-1 flex-col p-4">{children}</div>
      {status && (
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t px-4 py-2.5 font-mono text-[0.62rem] uppercase tracking-[0.12em]"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {status.map((item, index) => (
            <span key={item} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true" style={{ color: 'var(--color-border)' }}>│</span>}
              {item}
            </span>
          ))}
        </div>
      )}
    </figure>
  )
}

function TerminalSession({ session }) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-3 font-mono text-[0.72rem] leading-relaxed">
      {session.map(({ command, output, warn }, index) => (
        <motion.div
          key={command}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 + index * 0.08, duration: 0.25 }}
        >
          <p style={{ color: 'var(--color-text)' }}>
            <span style={{ color: 'var(--color-accent)' }}>$ </span>
            {command}
          </p>
          <p className="pl-4" style={{ color: warn ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
            {warn ? '! ' : '→ '}
            {output}
          </p>
        </motion.div>
      ))}
      <p aria-hidden="true" style={{ color: 'var(--color-accent)' }}>
        $ <span className="terminal-cursor">▍</span>
      </p>
    </div>
  )
}

// Paxos under a network partition: the majority side still forms a quorum and commits;
// the minority side can't. The phase row steps through one round on a loop (CSS, so
// reduced motion leaves it still).
function QuorumNode({ active }) {
  return (
    <span
      className="h-4 w-4 rounded-full"
      style={
        active
          ? { backgroundColor: 'var(--color-accent)' }
          : { border: '1px solid var(--color-text-secondary)', opacity: 0.55 }
      }
    />
  )
}

function QuorumDiagram({ nodes, quorum, phases }) {
  const minority = nodes - quorum

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <div className="grid w-fit grid-cols-4 gap-3" aria-hidden="true">
            {Array.from({ length: quorum }, (_, i) => <QuorumNode key={i} active />)}
          </div>
          <p className="mt-3 text-[0.72rem] font-medium" style={{ color: 'var(--color-text)' }}>
            Majority · {quorum} of {nodes}
          </p>
          <p className="text-[0.68rem]" style={{ color: 'var(--color-text-secondary)' }}>
            Forms a quorum and commits
          </p>
        </div>

        <div className="flex h-full min-h-[120px] flex-col items-center gap-1.5" aria-hidden="true">
          <span className="w-px flex-1" style={{ borderLeft: '1px dashed var(--color-text-secondary)', opacity: 0.6 }} />
          <span className="text-[0.55rem] uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-secondary)', writingMode: 'vertical-rl' }}>
            Partition
          </span>
          <span className="w-px flex-1" style={{ borderLeft: '1px dashed var(--color-text-secondary)', opacity: 0.6 }} />
        </div>

        <div>
          <div className="grid w-fit grid-cols-4 gap-3" aria-hidden="true">
            {Array.from({ length: minority }, (_, i) => <QuorumNode key={i} />)}
          </div>
          <p className="mt-3 text-[0.72rem] font-medium" style={{ color: 'var(--color-text)' }}>
            Minority · {minority} of {nodes}
          </p>
          <p className="text-[0.68rem]" style={{ color: 'var(--color-text-secondary)' }}>
            Isolated, can&apos;t reach quorum
          </p>
        </div>
      </div>

      <div>
      <p className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-secondary)' }}>
        One Paxos round
      </p>
      <ol className="grid grid-cols-4 gap-1.5">
        {phases.map((phase, index) => (
          <li
            key={phase}
            className="phase-step rounded-md px-1 py-1.5 text-center font-mono text-[0.6rem] uppercase tracking-[0.08em]"
            style={{ animationDelay: `${index}s` }}
          >
            {phase}
          </li>
        ))}
      </ol>
      </div>
    </div>
  )
}

// Problem → Build → Result as one story. Build can carry a few key decisions as bullets,
// so there is a single place for "what was built" and nothing to repeat elsewhere.
function CaseStudy({ steps }) {
  return (
    <ol className="relative">
      {steps.map((step, index) => (
        <motion.li
          key={step.label}
          className="relative grid gap-1 pb-5 pl-6 last:pb-0 md:grid-cols-[96px_minmax(0,1fr)] md:gap-6 md:pl-0"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 + index * 0.07, duration: 0.3, ease: EASE_OUT }}
        >
          {index < steps.length - 1 && (
            <span
              className="absolute bottom-0 left-[3px] top-4 w-px md:left-[99px]"
              style={{ backgroundColor: 'var(--color-border)' }}
              aria-hidden="true"
            />
          )}
          <span
            className="absolute left-0 top-[0.4rem] h-[7px] w-[7px] rounded-full md:left-[96px]"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-hidden="true"
          />
          <p
            className="pt-px font-mono text-[0.64rem] uppercase tracking-[0.16em] md:text-right"
            style={{ color: 'var(--color-accent)' }}
          >
            {step.label}
          </p>
          <div className="md:pl-6">
            <p className="max-w-[68ch] text-sm leading-6" style={{ color: 'var(--color-text)' }}>
              {step.text}
            </p>
            {step.points && (
              <ul className="mt-2 max-w-[68ch] space-y-1.5">
                {step.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2.5 text-sm leading-6"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <span aria-hidden="true" style={{ color: 'var(--color-accent)' }}>—</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.li>
      ))}
    </ol>
  )
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Icon size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        {children}
      </h3>
    </div>
  )
}

// Links sit outside the card's toggle button (a link can't be nested in a button).
// The live demo, when there is one, is the filled primary action; source is secondary.
// The primary button stays opaque and darkens on hover: fading it would drop its text
// below 4.5:1 in light mode. Its transparent border lets the hover colour fill the edge.
function ProjectLink({ href, label, primary, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (opens in a new tab)`}
      className={`inline-flex h-9 items-center gap-2 px-3.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] hover:-translate-y-0.5 ${primary ? 'hover-accent-bg' : 'hover:opacity-85'}`}
      style={{
        color: primary ? 'var(--color-bg)' : 'var(--color-text)',
        backgroundColor: primary ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
        border: `1px solid ${primary ? 'transparent' : 'var(--color-border)'}`,
        borderRadius: 9999,
        transition: 'transform 0.15s ease, opacity 0.2s ease, background-color 0.2s ease',
      }}
    >
      {children}
    </a>
  )
}

// An auto-cycling visual needs a pause control (WCAG 2.2.2). It sits here rather than on
// the visual because the visual is inside the card's toggle button.
function AnimationToggle({ paused, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 px-3.5 font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] hover:opacity-85"
      style={{
        color: 'var(--color-text-secondary)',
        backgroundColor: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: 9999,
        transition: 'opacity 0.2s ease',
      }}
    >
      {paused ? <Play size={13} strokeWidth={1.75} aria-hidden="true" /> : <Pause size={13} strokeWidth={1.75} aria-hidden="true" />}
      {paused ? 'Play animation' : 'Pause animation'}
    </button>
  )
}

function ProjectLinks({ project, animationPaused, onToggleAnimation }) {
  const animated = project.screenshot.type === 'notch'
  if (!project.demo && !project.repo && !project.reference && !animated) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-5 md:px-6">
      {project.demo && (
        <ProjectLink href={project.demo} label={`${project.name} live demo`} primary>
          Live demo
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </ProjectLink>
      )}
      {project.repo && (
        <ProjectLink href={project.repo} label={`${project.name} source on GitHub`}>
          <GithubIcon size={14} strokeWidth={1.5} aria-hidden="true" />
          Source
        </ProjectLink>
      )}
      {/* For work whose source can't be linked (coursework): the public spec it was built to. */}
      {project.reference && (
        <ProjectLink href={project.reference.href} label={`${project.name}: ${project.reference.label}`}>
          {project.reference.label}
          <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
        </ProjectLink>
      )}
      {animated && (
        <AnimationToggle paused={animationPaused} onToggle={onToggleAnimation} />
      )}
    </div>
  )
}

// The open card is the URL: /projects/<slug>. Opening one swaps the address in place
// (no history entry), so a case study can be linked and shared; an unknown slug just
// shows the list with nothing open.
export default function ProjectsPage({ slug, onNavigate }) {
  const expandedIndex = projects.findIndex((project) => project.slug === slug)
  const [animationPaused, setAnimationPaused] = useState(false)

  const toggle = (i) => {
    onNavigate('projects', expandedIndex === i ? null : projects[i].slug, { replace: true })
  }

  // Arriving on a project's link lands on its card. Only on arrival: opening a card by
  // hand shouldn't move the page. useState pins the slug the page mounted with.
  const [arrivalSlug] = useState(slug)
  useEffect(() => {
    if (arrivalSlug) document.getElementById(`project-${arrivalSlug}`)?.scrollIntoView({ block: 'start' })
  }, [arrivalSlug])

  return (
    <div className="page-shell pt-4 md:pt-8 pb-12">
      <div className="mb-10 flex flex-col gap-4 border-b pb-8 md:mb-12 md:flex-row md:items-end md:justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
            Projects
          </h1>
        </div>
        <p
          className="max-w-[360px] text-sm leading-6 md:text-right"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Tools and systems I&apos;ve built, from a macOS notch panel to an ML pipeline. Open a card
          for its case study and architecture.
        </p>
      </div>

      <div className="space-y-5">
        {projects.map((project, i) => {
          const isExpanded = expandedIndex === i

          return (
            <motion.article
              key={project.name}
              id={`project-${project.slug}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: EASE_OUT }}
              className="relative scroll-mt-24 overflow-hidden"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: isExpanded ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                borderRadius: 16,
              }}
            >
              <button
                type="button"
                className="block w-full cursor-pointer p-4 text-left sm:p-5 md:p-6"
                onClick={() => toggle(i)}
                aria-expanded={isExpanded}
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                  <div className="flex min-w-0 flex-col justify-between gap-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[0.64rem] uppercase tracking-[0.14em]"
                          style={{
                            color: 'var(--color-accent)',
                            backgroundColor: 'var(--color-border-subtle)',
                            borderRadius: 9999,
                          }}
                        >
                          <BarChart3 size={12} strokeWidth={1.5} />
                          {project.eyebrow}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2
                            className="font-display font-semibold tracking-[-0.035em]"
                            style={{
                              fontSize: 'var(--text-card-title)',
                              color: 'var(--color-text)',
                            }}
                          >
                            {project.name}
                          </h2>
                          <p
                            className="mt-3 max-w-[640px] leading-6"
                            style={{
                              fontSize: 'var(--text-body)',
                              color: 'var(--color-text-secondary)',
                            }}
                          >
                            {project.description}
                          </p>
                        </div>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25, ease: EASE_OUT }}
                          className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center"
                          style={{
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 9999,
                          }}
                        >
                          <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
                        </motion.span>
                      </div>
                    </div>

                    <MetricStrip metrics={project.metrics} />

                    <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                        Proof:
                      </span>{' '}
                      {project.proof}
                    </p>
                  </div>

                  <ProofVisual screenshot={project.screenshot} name={project.name} paused={animationPaused} />
                </div>
              </button>

              <ProjectLinks
                project={project}
                animationPaused={animationPaused}
                onToggleAnimation={() => setAnimationPaused(!animationPaused)}
              />

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t px-4 py-5 sm:px-5 md:px-6 md:py-6"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {/* Two up from sm, so the screenshots don't push the case study a screen
                          down; each opens at full size, where app text is readable. */}
                      {project.gallery && (
                        <div className="mb-6 grid gap-4 sm:grid-cols-2">
                          {project.gallery.map((image) => (
                            <figure key={image.src}>
                              <a
                                href={image.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block overflow-hidden"
                                style={{ border: '1px solid var(--color-border)', borderRadius: 10 }}
                              >
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  width={image.width}
                                  height={image.height}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                                <span className="sr-only"> (opens full size in a new tab)</span>
                              </a>
                              <figcaption
                                className="mt-2 text-xs leading-5"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                {image.caption}
                                <span className="ml-2 uppercase tracking-[0.12em]" aria-hidden="true">· Click to enlarge</span>
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      )}

                      <section>
                        <SectionHeading icon={Layers}>Case study</SectionHeading>
                        <CaseStudy steps={project.caseStudy} />
                      </section>

                      <section
                        className="mt-6 rounded-lg p-4 sm:p-5"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <SectionHeading icon={GitBranch}>
                          Architecture
                          <span className="ml-2 font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                            Select a part, or trace the flow
                          </span>
                        </SectionHeading>
                        <ArchitectureFlow flow={project.architecture} name={project.name} />

                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
                          <h4 className="mr-1 font-mono text-[0.6rem] uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-secondary)' }}>
                            Stack
                          </h4>
                          {project.tech.map((t, ti) => (
                            <motion.span
                              key={t}
                              className="rounded-full px-3 py-1.5 text-[0.72rem] font-medium"
                              style={{
                                backgroundColor: 'var(--color-border-subtle)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                delay: 0.2 + ti * 0.04,
                                duration: 0.25,
                                ease: EASE_OUT,
                              }}
                            >
                              {t}
                            </motion.span>
                          ))}
                        </div>
                      </section>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
