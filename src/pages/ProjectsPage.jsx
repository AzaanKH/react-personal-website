import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Kicker from '../components/Kicker'
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  GitBranch,
  Layers,
} from 'lucide-react'
import { GithubIcon } from '../components/BrandIcons'
import ArchitectureFlow from '../components/projects/ArchitectureFlow'

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
      status: ['FastMCP', '20 tools', '80+ tests'],
    },
    metrics: [
      { value: '20', label: 'MCP tools' },
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
        text: 'A FastMCP server with tools for Docker orchestration, virtual environments, process monitoring, ports, and system health.',
        points: [
          'asyncio.gather fans slow environment discovery out into parallel subprocesses.',
          'Read and query tools return Pydantic models the assistant can parse on Windows, macOS, and Linux; action tools return a short status message.',
          'Destructive operations ask the user to confirm through MCP elicitation before they run.',
        ],
      },
      {
        label: 'Result',
        text: 'Virtual environment discovery dropped from 5.1s to 1.2s, and 80+ focused unit tests cover the tool surface.',
      },
    ],
    // Tool names, signatures, and model fields are from the devenv-mcp source; the
    // example's venv names, versions, and counts are illustrative.
    architecture: {
      scenario: 'the assistant lists your Python environments',
      lanes: [
        {
          label: 'Request path',
          nodes: [
            {
              label: 'AI assistant',
              detail: 'An MCP client calls a tool by name with typed arguments. Here the assistant wants to know which virtual environments exist before it installs anything.',
              example: ['devenv_venv_list(', '  working_dir=".",', '  include_global=True,', ')'],
            },
            {
              label: 'FastMCP server',
              detail: 'Registers each tool from its Python signature and docstring, so the assistant sees a typed schema for every argument and return value.',
              example: ['tool    devenv_venv_list', 'args    working_dir: str', '        include_global: bool', '        name_pattern: str | None', 'returns list[VenvInfo]'],
            },
            {
              label: 'Typed tool router',
              detail: 'Checks the arguments against that schema and dispatches the call. Read-only tools run straight away; destructive ones (remove a container, delete a venv, kill a port, clean up) ask the user first through MCP elicitation.',
              example: ['venv_list → read-only, runs now', '', 'docker_remove_container("api") →', '  ctx.elicit("Are you sure you want to', "    remove container 'api'?\")", '→ runs only if confirm = true'],
            },
            {
              label: 'Docker / venv / process / health providers',
              detail: 'Do the actual work. venv_list looks in ./venv, ./.venv, and ~/.venvs, then inspects every match at once with asyncio.gather instead of one by one. That fan-out took the scan from 5.1s to 1.2s.',
              example: ['found 3 venvs', 'await asyncio.gather(', '  _get_venv_info(".venv"),', '  _get_venv_info("~/.venvs/ml"),', '  _get_venv_info("~/.venvs/old-env"),', ')'],
            },
          ],
        },
        {
          label: 'Response path',
          nodes: [
            {
              label: 'psutil + subprocess',
              detail: 'For each venv, its own Python and pip run in parallel subprocesses. Other tools read ports, processes, CPU, memory, and disk through psutil, the same way on Windows, macOS, and Linux.',
              example: ['$ .venv/bin/python --version', 'Python 3.11.5', '$ .venv/bin/pip list --format=json', '[ … 42 packages ]'],
            },
            {
              label: 'Pydantic response schemas',
              detail: 'Read and query tools (container lists, logs, stats, venvs, packages, health) return validated Pydantic models. Action tools such as start, stop, remove, and port kill return a short status message instead.',
              example: ['VenvInfo(', '  name=".venv",', '  python_version="3.11.5",', '  packages_count=42,', '  is_valid=True,', ')'],
            },
            {
              label: 'AI-readable results',
              detail: 'The assistant gets the same fields every time, so it can reason over them, like noticing a broken venv from is_valid=False rather than parsing shell output.',
              example: ['→ "You have 3 environments. .venv runs', '   Python 3.11.5 with 42 packages.', '   old-env is broken (is_valid=False)."'],
            },
          ],
        },
      ],
    },
    tech: ['Python', 'FastMCP', 'asyncio', 'Pydantic', 'psutil', 'Docker'],
    repo: 'https://github.com/AzaanKH/devenv-mcp',
  },
  {
    // Copy, facts, and status come from the project's portfolio handoff. The screenshots
    // are from a Sleeper mock draft (pick 2.06); the card uses a crop of the board so
    // player names stay readable at card size.
    name: 'Fantasy Draft Assistant',
    eyebrow: 'Fantasy football tooling',
    description:
      'A local fantasy football draft workspace that tracks picks, compares available players, and explains roster fit and draft timing. Includes a Chrome extension companion for Sleeper, Yahoo, and ESPN draft rooms.',
    proof: 'The React workspace and terminal CLI share draft calculations, while a local sync server polls Sleeper and Yahoo for picks and the Chrome extension relays ESPN draft observations. Data readiness checks block recommendations when required inputs are missing or stale.',
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
      { value: 'Live', label: 'Hosted demo' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: "During a snake draft, rankings alone don't explain roster fit or whether a player will still be there at your next pick, and switching between the draft room, rankings, and roster makes those calls harder.",
      },
      {
        label: 'Build',
        text: 'A React draft board and Assistant backed by shared draft calculations, real player data, and a local sync server.',
        points: [
          'The local server polls Sleeper and Yahoo for picks; ESPN picks come from Chrome extension observations of your signed-in draft tab.',
          'Provisional picks with reconciliation keep the board recoverable after a sync outage.',
          'The CLI gives the same advice as the web app and replays exported drafts offline; local mock drafts support practice.',
        ],
      },
      {
        label: 'Result',
        text: 'One workspace for pick history, available players, a shortlist, and your roster, plus an Assistant that answers four questions: why this player, compare options, can I wait until my next pick, and what does my roster need.',
      },
      {
        label: 'Status',
        text: 'A hosted demo runs the workspace in preview mode with local mock drafts. Live provider sync runs locally: Sleeper works, as shown in the screenshots; Yahoo and ESPN are not yet verified.',
      },
    ],
    // Connection paths follow the repo README ("Provider support and current limits"):
    // Sleeper and Yahoo use local server polling; ESPN uses Chrome extension observations.
    // The example follows the pick 2.06 mock draft in the screenshots.
    architecture: {
      scenario: 'your pick at 2.06 in a Sleeper mock draft',
      lanes: [
        {
          label: 'Player data',
          nodes: [
            {
              label: 'Sleeper + FantasyPros inputs',
              detail: 'Player data from Sleeper and rankings from FantasyPros are the base every recommendation is built on.',
              example: ['$ pnpm dev:live', 'refreshing Sleeper + FantasyPros inputs…'],
            },
            {
              label: 'Refresh + identity scripts',
              detail: 'Rebuild player identities so the same player matches across sources, then validate the Core Draft Data.',
              example: ['rebuild player identities', '  Sleeper "CeeDee Lamb" = FantasyPros "CeeDee Lamb"', 'validate Core Draft Data'],
            },
            {
              label: 'Readiness gate',
              detail: 'Missing or stale core inputs block live recommendations. Optional signals can drop out without stopping the draft.',
              example: ['core inputs      fresh ✓', 'optional signal  missing → still drafting', '→ live recommendations unlocked'],
            },
          ],
        },
        {
          label: 'Sleeper + Yahoo picks',
          nodes: [
            {
              label: 'Provider draft',
              detail: "You connect a draft by URL or ID and confirm your slot, scoring, roster settings, and keepers. Picks are still made in the provider's own draft room.",
              example: ['$ draft connect sleeper:<draft-id> --slot 5', '2.05  Amon-Ra St. Brown', '2.06  My Team · on the clock'],
            },
            {
              label: 'Local server polling',
              detail: 'For Sleeper and Yahoo, the local server polls the provider for new picks. If the connection stalls, the board flags the delay and you can record provisional picks until it reconnects.',
              example: ['poll sleeper → 1 new pick (2.05)', '', 'outage during the Sleeper rehearsal:', '  provisional pick 14: Ashton Jeanty', '  reconnect → official pick 14 matches', '→ Confirmed · 1'],
            },
            {
              label: 'Canonical draft snapshot',
              detail: 'The server keeps one canonical snapshot of the draft in memory, with picks, keepers, settings, and rosters. Every view reads from it.',
              example: ['snapshot  picks, keepers, settings, rosters', 'last pick 2.05', 'clock     2.06 → My Team'],
            },
          ],
        },
        {
          label: 'ESPN picks',
          nodes: [
            {
              label: 'Signed-in ESPN tab',
              detail: 'ESPN is not polled. The draft is read from your own signed-in tab, which has to stay open, and the observer must start before the page opens its live draft connection.',
              example: ['(not used in this Sleeper draft)', 'ESPN draft tab · signed in · kept open'],
            },
            {
              label: 'Extension observations',
              detail: "The Chrome extension sends sanitized draft state to the local server and never forwards account credentials. Its side panel sits beside any provider's draft room.",
              example: ['observation → draft state only', 'no account credentials forwarded', '> 5 min from server time → rejected'],
            },
            {
              label: 'Paired local server',
              detail: 'Both local services bind to loopback, and every API request needs the pairing token from pnpm sync:pair.',
              example: ['$ pnpm sync:pair', '→ paste the token into extension Options', 'requests without the token → refused'],
            },
          ],
        },
        {
          label: 'Advice',
          nodes: [
            {
              label: 'Shared TypeScript calculations',
              detail: 'One set of draft calculations weighs roster fit, tiers, positional depth, and the chance a player lasts to your next pick.',
              example: ['Best Pick @ 2.06', '  CeeDee Lamb       ↑', '  Justin Jefferson', '→ only one WR left in Tier 2'],
            },
            {
              label: 'React workspace + Assistant',
              detail: 'The board, Best Pick bar, available players, shortlist, and roster. The Assistant explains a pick, compares options, says whether you can wait, and reviews roster needs.',
              example: ['Q: Can I wait on a WR until my next pick?', '→ compares next-pick availability', '  and the cost of waiting'],
            },
            {
              label: 'CLI + offline replay',
              detail: 'The same advice and readiness gates in a terminal. Export a session to replay its picks and run advice offline.',
              example: ['$ draft recommend --lens best-pick --limit 5', '$ draft export --out session.json', '$ draft replay session.json --pick 24'],
            },
          ],
        },
      ],
    },
    tech: ['TypeScript', 'React', 'Vite', 'TanStack Query', 'Zustand', 'Tailwind CSS', 'Effect 4', 'Node.js', 'Chrome Extensions', 'DuckDB', 'Vitest'],
    repo: 'https://github.com/AzaanKH/fantasy-draft-assistant',
    // Cloudflare Pages build in preview mode: mock drafts only, no provider sync.
    demo: 'https://fantasy-draft-demo.pages.dev/draft',
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
        text: 'A multi-source data pipeline feeding position-specific XGBoost models, served through a Flask API to a React interface.',
        points: [
          'Sleeper, ESPN, and a scraper sit behind automatic fallback orchestration and rate limiting.',
          'Models train on rolling averages, reliability flags, efficiency metrics, and trend indicators.',
          'A Postgres + TimescaleDB schema for weekly stats keeps rolling-window feature queries efficient.',
        ],
      },
      {
        label: 'Result',
        text: 'Pick a week and position, search 800+ players instantly, and compare predictions with confidence intervals and 3-game averages.',
      },
    ],
    // Endpoints, scheduler commands, and feature groups come from the football repo
    // README; the example's players and numbers are illustrative.
    architecture: {
      scenario: 'a Week 18 running back start/sit',
      lanes: [
        {
          label: 'Training',
          nodes: [
            {
              label: 'Sleeper API / ESPN / scraper',
              detail: 'Sleeper and ESPN integrations sync players, stats, matchups, and projections, with a scraper fallback and rate limiting. In the offseason, when Sleeper reports week 0, the stat syncs skip cleanly.',
              example: ['$ python scheduler.py run-now --sync', 'players · stats · matchups · projections'],
            },
            {
              label: 'Feature pipeline',
              detail: 'Turns raw weekly stats into model features: rolling averages, reliability flags for thin early-season samples, efficiency, consistency, usage trends, and matchup context.',
              example: ['$ python run_pipeline.py compute-features 2025 18', 'rolling   points over 3 / 5 / 10 games', 'reliable  games played, full-window flag', 'form      boom rate, bust rate, floor', 'matchup   opponent, home/away, rest days'],
            },
            {
              label: 'Postgres + TimescaleDB',
              detail: '10k+ player-week records: players, stats, projections, features, and matchup context in a schema built for rolling-window queries.',
              example: ['GET /available_weeks', '→ weeks with computed features', '  … 2025 · week 18'],
            },
            {
              label: 'XGBoost models',
              detail: 'Separate models for QBs, RBs, and WRs, trained on temporal splits so future games never leak into training, and checked with walk-forward backtests. 2.9 MAE.',
              example: ['models  qb · rb · wr', 'split   temporal, walk-forward backtest', 'saved   models/weekly_predictor.pkl'],
            },
          ],
        },
        {
          label: 'Serving',
          nodes: [
            {
              label: 'Flask API',
              detail: 'POST /predict_week takes a position, players, week, and season, and returns predictions with confidence intervals.',
              example: ['POST /predict_week', '{ "position": "rb",', '  "player_ids": ["4034", "6794"],', '  "week": 18, "season": 2025 }'],
            },
            {
              label: 'React + shadcn UI',
              detail: 'Pick the week and position, then search and filter 800+ players instantly to build the comparison.',
              example: ['week 18 · RB', 'search → instant filter, 800+ players', 'add 2 players → compare'],
            },
            {
              label: 'Prediction cards with confidence ranges',
              detail: 'Each card shows predicted points, the confidence range around them, and the 3-game average, so the start/sit call accounts for uncertainty.',
              example: ['RB A  14.2 pts  (10.8–17.6)  3-gm 12.9', 'RB B  11.7 pts   (8.1–15.0)  3-gm 13.4', '→ start RB A'],
            },
          ],
        },
      ],
    },
    tech: ['React', 'Python', 'Flask', 'PostgreSQL', 'TimescaleDB', 'XGBoost'],
    repo: 'https://github.com/AzaanKH/football',
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
        text: 'Proposer, acceptor, and learner roles with proposal numbering, quorum-based acceptance, and fault-tolerant message protocols for partition scenarios.',
      },
      {
        label: 'Result',
        text: 'Agreement held across 12+ simulated nodes under network partitions while sustaining 1000+ protocol messages per second.',
      },
    ],
    // The example walks one textbook Paxos round on the 7 / 5 split drawn on the card.
    architecture: {
      scenario: 'agreeing on one value while the network is split 7 / 5',
      lanes: [
        {
          label: 'Consensus round',
          nodes: [
            {
              label: 'Client request',
              detail: 'A client asks the cluster to agree on a value. Every node that learns a value must learn the same one.',
              example: ['propose(value = "X")'],
            },
            {
              label: 'Proposers',
              detail: 'Pick a unique, increasing proposal number and send Prepare. Once a majority promises, send Accept with the value.',
              example: ['n = 5', 'Prepare(5) → every reachable acceptor'],
            },
            {
              label: 'Acceptors / quorum',
              detail: 'Promise to ignore lower-numbered proposals, then accept. A value is chosen once a majority, 7 of 12, accepts it.',
              example: ['Promise(5) × 7     quorum 7/12 ✓', 'Accept(5, "X")', 'Accepted × 7', '→ "X" is chosen'],
            },
            {
              label: 'Learners',
              detail: 'Learn the chosen value once a quorum has accepted it.',
              example: ['learned "X" (n = 5)'],
            },
          ],
        },
        {
          label: 'Test harness',
          nodes: [
            {
              label: 'Partition simulator',
              detail: 'Splits the network in two partition modes. The side holding a majority can still commit; the minority side cannot.',
              example: ['split  {1…7} | {8…12}', 'minority: Prepare(6) → 5 promises', '→ needs 7, cannot commit'],
            },
            {
              label: 'Message bus',
              detail: 'Carries protocol messages between roles at 1000+ per second, where messages can arrive out of order or never cross the split.',
              example: ['1000+ messages / sec', 'Promise(5) from node 3 arrives late', '→ still counted for proposal 5'],
            },
            {
              label: 'Consensus log',
              detail: 'Records each chosen value so agreement can be checked across 12+ nodes after the run.',
              example: ['slot 1  "X"  on every node that learned it', '→ no node holds a different value'],
            },
          ],
        },
      ],
    },
    tech: ['Java', 'Distributed systems', 'Consensus', 'Fault tolerance'],
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
          transition={{ delay: 0.05 + index * 0.07, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

function ProjectLinks({ project }) {
  if (!project.demo && !project.repo) return null

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
    </div>
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

              <ProjectLinks project={project} />

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
                                ease: [0.16, 1, 0.3, 1],
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
