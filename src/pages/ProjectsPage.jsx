import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Kicker from '../components/Kicker'
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ExternalLink,
  GitBranch,
  Layers,
  ShieldCheck,
} from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'

const projects = [
  {
    name: 'DevEnv MCP Server',
    eyebrow: 'AI infrastructure tooling',
    description:
      'Model Context Protocol server enabling AI assistants to manage local development environments with Docker orchestration, virtual environments, and system monitoring.',
    proof: 'A local automation layer with typed FastMCP tools, destructive-action confirmations, and cross-platform health/resource reporting.',
    // Outputs restate facts from this card; they are not captured real output.
    screenshot: {
      type: 'terminal',
      title: 'MCP tool surface',
      session: [
        { command: 'devenv_health_check', output: 'Docker, disk, and memory status' },
        { command: 'devenv_docker_stats', output: 'live container CPU and memory usage' },
        { command: 'devenv_venv_list', output: 'environment scan: 5.1s → 1.2s (asyncio fan-out)' },
        { command: 'devenv_port_kill 3000', output: 'destructive action: confirmation required', warn: true },
      ],
      status: ['FastMCP', '12 tools', '80+ tests'],
    },
    metrics: [
      { value: '12', label: 'MCP tools' },
      { value: '4.2x', label: 'faster venv scan' },
      { value: '80+', label: 'unit tests' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: 'AI assistants can write code, but they still need safe visibility into Docker, Python environments, ports, and machine health.',
      },
      {
        label: 'Build',
        text: 'Designed a FastMCP server with Pydantic schemas, psutil-backed platform abstractions, and asyncio fan-out for slow environment discovery.',
      },
      {
        label: 'Proof',
        text: 'Benchmarked virtual environment discovery from 5.1s to 1.2s and covered the tool surface with 80+ focused unit tests.',
      },
    ],
    highlights: [
      'Architected MCP server with tools for Docker orchestration, virtual environments, process monitoring, ports, and system health.',
      'Optimized concurrent operations using asyncio.gather for parallel subprocess execution.',
      'Designed structured Pydantic response schemas for AI-parseable outputs across Windows, macOS, and Linux.',
      'Implemented safety patterns using confirmation prompts for destructive operations.',
    ],
    architecture: [
      ['AI assistant', 'FastMCP server', 'Typed tool router', 'Docker / venv / process / health providers'],
      ['psutil + subprocess', 'Pydantic response schemas', 'AI-readable results'],
    ],
    tech: ['Python', 'FastMCP', 'asyncio', 'Pydantic', 'psutil', 'Docker'],
    links: [
      { label: 'Source', href: 'https://github.com/AzaanKH/devenv-mcp', icon: GithubIcon },
      { label: 'README', href: 'https://github.com/AzaanKH/devenv-mcp#devenv-mcp-server', icon: ExternalLink },
    ],
  },
  {
    // Copy, facts, and status come from the project's portfolio handoff. The screenshots
    // are from a Sleeper mock draft (pick 2.06); the card uses a crop of the board so
    // player names stay readable at card size.
    name: 'Fantasy Draft Assistant',
    eyebrow: 'Fantasy football tooling',
    description:
      'A local fantasy football draft workspace that tracks picks, compares available players, and explains roster fit and draft timing. Includes a Chrome extension companion for Sleeper, Yahoo, and ESPN draft rooms.',
    proof: 'The React workspace and terminal CLI share draft calculations, while a local sync server and Chrome extension bring provider picks into the board. Data readiness checks block recommendations when required inputs are missing or stale.',
    screenshot: {
      type: 'image',
      src: '/projects/fantasy-draft-assistant/board-card.webp',
      width: 1000,
      height: 808,
      position: 'top center',
      alt: 'Fantasy football draft board around My Team: Puka Nacua taken at 1.05, Amon-Ra St. Brown at 2.05, and My Team on the clock at pick 2.06.',
      caption: 'Sleeper mock draft · pick 2.06',
    },
    gallery: [
      {
        src: '/projects/fantasy-draft-assistant/board.webp',
        width: 2000,
        height: 1268,
        alt: 'Full draft workspace at pick 2.06: the draft board, the Best Pick bar recommending CeeDee Lamb, available players with value and next-pick availability, and the roster panel.',
        caption: 'Draft workspace at pick 2.06 of a Sleeper mock draft: the board, available players ranked by Best Pick, and the roster.',
      },
      {
        src: '/projects/fantasy-draft-assistant/assistant-compare.webp',
        width: 2000,
        height: 1264,
        alt: 'Draft Assistant comparing CeeDee Lamb and Justin Jefferson at pick 2.06 on value above replacement, projected points, availability at the next pick, waiting cost, tier, and ECR.',
        caption: 'The Assistant comparing CeeDee Lamb and Justin Jefferson at the same pick: Lamb grades ahead because only one WR remains in Tier 2.',
      },
    ],
    metrics: [
      { value: '3', label: 'Provider adapters' },
      { value: '4', label: 'Assistant questions' },
      { value: 'Local', label: 'App runtime' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: "During a snake draft, rankings alone don't explain roster fit or whether a player will still be there at your next pick, and switching between the draft room, rankings, and roster makes those calls harder.",
      },
      {
        label: 'Build',
        text: 'A React draft board and Assistant backed by shared draft calculations, real player data, and a local sync server. Provider adapters and a Chrome extension track picks; local mock drafts support practice, and provisional picks with reconciliation recover from a sync outage.',
      },
      {
        label: 'Proof',
        text: 'The workspace shows pick history, available players, a shortlist, and your roster. The Assistant explains recommendations, compares alternatives, analyzes waiting until the next pick, and reviews roster needs.',
      },
      {
        label: 'Status',
        text: 'Local development project. Sleeper draft sync works, as shown in the screenshots; Yahoo and ESPN sync are not yet verified.',
      },
    ],
    highlights: [
      'Four Assistant questions: why this player, compare options, can I wait until my next pick, and what does my roster need.',
      'Provider adapters for Sleeper, Yahoo, and ESPN draft rooms, with a Chrome extension that brings picks into the board.',
      'Provisional picks and reconciliation keep the board recoverable after a sync outage.',
      'The CLI exposes the same advice as the web app and replays exported drafts offline.',
    ],
    architecture: [
      ['Sleeper + FantasyPros data', 'Refresh + identity scripts', 'Local sync server', 'React workspace'],
      ['Chrome extension', 'Provider adapters', 'Shared TypeScript calculations', 'CLI + offline replay'],
    ],
    tech: ['TypeScript', 'React', 'Vite', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'Effect 4', 'Node.js', 'Chrome Extensions', 'DuckDB', 'Vitest'],
    links: [
      { label: 'Source', href: 'https://github.com/AzaanKH/fantasy-draft-assistant', icon: GithubIcon },
      { label: 'README', href: 'https://github.com/AzaanKH/fantasy-draft-assistant#fantasy-draft-assistant', icon: ExternalLink },
      { label: 'Local setup', href: 'https://github.com/AzaanKH/fantasy-draft-assistant#get-started', icon: ArrowUpRight },
    ],
  },
  {
    name: 'NFL Fantasy Picker',
    eyebrow: 'ML product system',
    description:
      'Machine learning-powered fantasy football recommendations using XGBoost predictions with multi-source data pipelines.',
    proof: 'A full local app: React search interface, Flask prediction API, TimescaleDB/Postgres feature store, and position-specific XGBoost models.',
    screenshot: {
      type: 'image',
      // Resized from the repo's 3024px website_homepage.jpeg (176 KB -> 11 KB).
      src: '/projects/fantasy-football-home.webp',
      width: 1200,
      height: 383,
      alt: 'Fantasy football predictor homepage screenshot',
    },
    metrics: [
      { value: '2.9', label: 'MAE model error' },
      { value: '10k+', label: 'player-week records' },
      { value: '800+', label: 'searchable players' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: 'Weekly start/sit decisions need current player context, matchup data, and uncertainty, not just season averages.',
      },
      {
        label: 'Build',
        text: 'Created a pipeline with Sleeper, ESPN, and scraping fallbacks, then trained position-specific XGBoost models on engineered rolling features.',
      },
      {
        label: 'Proof',
        text: 'The UI returns predictions with confidence intervals, 3-game averages, and instant player filtering over an 800+ player dataset.',
      },
    ],
    highlights: [
      'Architected multi-source data pipeline with automatic fallback orchestration and rate limiting.',
      'Trained position-specific XGBoost models using rolling averages, reliability flags, efficiency metrics, and trend indicators.',
      'Designed PostgreSQL + TimescaleDB schema for weekly statistics and efficient rolling-window feature queries.',
      'Shipped a React interface for week/position selection, player search, and prediction comparison.',
    ],
    architecture: [
      ['Sleeper API / ESPN / scraper', 'Feature pipeline', 'Postgres + TimescaleDB', 'XGBoost models'],
      ['Flask API', 'React + shadcn UI', 'Prediction cards with confidence ranges'],
    ],
    tech: ['React', 'Python', 'Flask', 'PostgreSQL', 'TimescaleDB', 'XGBoost'],
    links: [
      { label: 'Source', href: 'https://github.com/AzaanKH/football', icon: GithubIcon },
      { label: 'Screenshots', href: 'https://github.com/AzaanKH/football#screenshots', icon: ExternalLink },
      { label: 'Local demo', href: 'https://github.com/AzaanKH/football#quick-start', icon: ArrowUpRight },
    ],
  },
  {
    name: 'Distributed Paxos Consensus',
    eyebrow: 'Distributed systems',
    description:
      'Fault-tolerant distributed system using the Paxos consensus algorithm, ensuring agreement across nodes under network partition scenarios.',
    proof: 'A Java consensus simulation focused on proposer/acceptor coordination, message throughput, and partition-tolerant agreement.',
    screenshot: {
      type: 'quorum',
      title: 'Consensus under partition',
      nodes: 12,
      quorum: 7,
      phases: ['Prepare', 'Promise', 'Accept', 'Learned'],
      status: ['Java', '1000+ messages/sec'],
    },
    metrics: [
      { value: '12+', label: 'nodes tested' },
      { value: '1k+', label: 'messages/sec' },
      { value: '2', label: 'partition modes' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: 'Consensus must preserve agreement when messages arrive out of order, nodes fail, or the network splits.',
      },
      {
        label: 'Build',
        text: 'Implemented Paxos roles, quorum checks, proposal numbering, and message protocols for partition scenarios.',
      },
      {
        label: 'Proof',
        text: 'Validated agreement across 12+ simulated nodes while sustaining 1000+ protocol messages per second.',
      },
    ],
    highlights: [
      'Implemented Paxos consensus algorithm ensuring agreement across 12+ nodes under network partitions.',
      'Built communication protocols handling 1000+ messages per second with fault tolerance.',
      'Modeled proposer, acceptor, and learner flows with quorum-based acceptance.',
    ],
    architecture: [
      ['Client request', 'Proposers', 'Acceptors / quorum', 'Learners'],
      ['Partition simulator', 'Message bus', 'Consensus log'],
    ],
    tech: ['Java', 'Distributed systems', 'Consensus', 'Fault tolerance'],
    links: [],
  },
]

function MetricStrip({ metrics }) {
  return (
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
  )
}

function ProofVisual({ screenshot, name }) {
  if (screenshot.type === 'image') {
    return (
      <div
        className="relative h-full min-h-[190px] overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
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
          className="h-full w-full object-cover"
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

function ArchitectureDiagram({ rows }) {
  return (
    <div className="space-y-3">
      {rows.map((row, rowIndex) => (
        <div key={row.join('-')} className="grid gap-2 md:grid-cols-4">
          {row.map((node, nodeIndex) => (
            <div key={node} className="flex items-center gap-2">
              <div
                className="flex min-h-[58px] flex-1 items-center justify-center px-3 text-center text-[0.74rem] font-medium leading-snug"
                style={{
                  color: 'var(--color-text)',
                  backgroundColor: rowIndex === 0 ? 'var(--color-surface)' : 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                }}
              >
                {node}
              </div>
              {nodeIndex < row.length - 1 && (
                <ArrowUpRight
                  className="hidden shrink-0 rotate-45 md:block"
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: 'var(--color-text-secondary)', opacity: 0.55 }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function LinkPill({ link }) {
  const Icon = link.icon

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 items-center gap-2 px-3 font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] transition-transform hover:-translate-y-0.5 hover:opacity-85"
      style={{
        color: 'var(--color-text)',
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 9999,
      }}
    >
      <Icon size={14} strokeWidth={1.5} />
      {link.label}
    </a>
  )
}

export default function ProjectsPage() {
  const [expandedIndex, setExpandedIndex] = useState(null)

  const toggle = (i) => {
    setExpandedIndex(expandedIndex === i ? null : i)
  }

  return (
    <div className="page-shell pt-4 md:pt-8 pb-12">
      <div className="mb-10 flex flex-col gap-4 border-b pb-8 md:mb-12 md:flex-row md:items-end md:justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <Kicker className="mb-4">Selected work</Kicker>
          <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
            Projects
          </h1>
        </div>
        <p
          className="max-w-[360px] text-sm leading-6 md:text-right"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Proof-first cards: metrics, visuals, and repo evidence stay visible before you open the
          deeper build notes.
        </p>
      </div>

      <div className="space-y-5">
        {projects.map((project, i) => {
          const isExpanded = expandedIndex === i

          return (
            <motion.article
              key={project.name}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
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
                        {project.links.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1.5 text-[0.72rem]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <ExternalLink size={12} strokeWidth={1.5} />
                            {project.links.length} proof links
                          </span>
                        )}
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
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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

                  <ProofVisual screenshot={project.screenshot} name={project.name} />
                </div>
              </button>

              {project.links.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5 md:px-6">
                  {project.links.map((link) => (
                    <LinkPill key={link.label} link={link} />
                  ))}
                </div>
              )}

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border-t px-4 py-5 sm:px-5 md:px-6 md:py-6"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {/* Full card width, and each image opens at full size: app screenshots
                          are only readable when they aren't shrunk much. */}
                      {project.gallery?.map((image) => (
                        <figure key={image.src} className="mb-6">
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
                              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
                            />
                            <span className="sr-only"> (opens full size in a new tab)</span>
                          </a>
                          <figcaption
                            className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs leading-5"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <span>{image.caption}</span>
                            <span className="uppercase tracking-[0.12em]" aria-hidden="true">Click to enlarge</span>
                          </figcaption>
                        </figure>
                      ))}

                      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                        <section>
                          <div className="mb-3 flex items-center gap-2">
                            <Layers size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                              Case Study
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {project.caseStudy.map((section) => (
                              <div
                                key={section.label}
                                className="rounded-lg p-4"
                                style={{
                                  backgroundColor: 'var(--color-surface-elevated)',
                                  border: '1px solid var(--color-border)',
                                }}
                              >
                                <p
                                  className="text-[0.68rem] uppercase tracking-[0.16em]"
                                  style={{ color: 'var(--color-accent)' }}
                                >
                                  {section.label}
                                </p>
                                <p
                                  className="mt-2 text-sm leading-6"
                                  style={{ color: 'var(--color-text-secondary)' }}
                                >
                                  {section.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section
                          className="rounded-lg p-4"
                          style={{
                            backgroundColor: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <div className="mb-4 flex items-center gap-2">
                            <GitBranch size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                              Architecture
                            </h3>
                          </div>
                          <ArchitectureDiagram rows={project.architecture} />
                        </section>
                      </div>

                      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                        <section>
                          <div className="mb-3 flex items-center gap-2">
                            <ShieldCheck size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                              Implementation Proof
                            </h3>
                          </div>
                          <ul className="grid gap-2">
                            {project.highlights.map((point, pi) => (
                              <motion.li
                                key={point}
                                className="flex items-start gap-3 rounded-lg p-3"
                                style={{
                                  color: 'var(--color-text-secondary)',
                                  backgroundColor: 'var(--color-surface-elevated)',
                                  border: '1px solid var(--color-border)',
                                  fontSize: 'var(--text-body-sm)',
                                  lineHeight: 1.55,
                                }}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.05 + pi * 0.05,
                                  duration: 0.3,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                <span
                                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                  style={{ backgroundColor: 'var(--color-accent)' }}
                                  aria-hidden="true"
                                />
                                <span>{point}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <div className="mb-3 flex items-center gap-2">
                            <Layers size={16} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                              Stack
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                {t}
                              </motion.span>
                            ))}
                          </div>
                        </section>
                      </div>
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
