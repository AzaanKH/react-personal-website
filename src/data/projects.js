// The projects shown on /projects, in display order. Plain data (no JSX), so the build
// (vite.config.js) can read it for prerendering and the sitemap.
//
// `slug` is the project's URL: /projects/<slug> opens the page with that card expanded.
// public/projects/ holds the screenshots, so a slug must never match a folder or file
// name there (Netlify would have two things to serve at one path).
export const projects = [
  {
    // Copy and facts come from the mac-dynamic-notch README and source. The card's visual
    // is a drawn re-creation of the compact surface (NotchDemo), not a screen recording.
    slug: 'notchrouter',
    name: 'NotchRouter',
    eyebrow: 'macOS app · AI activity',
    description:
      'A native macOS notch panel that shows what your AI agents are doing: working, waiting for your review, or done. It also holds a focus timer, a file shelf, music controls, clipboard history, and system status.',
    proof: 'Agents report through a local CLI and a token-authenticated private Unix socket; Codex lifecycle hooks map straight onto activity states. Every integration is opt-in, and 155 Swift tests cover the API, security boundaries, and notch geometry.',
    screenshot: {
      type: 'notch',
      caption: 'Compact surface',
    },
    metrics: [
      { value: '6', label: 'Panel sections' },
      { value: '7', label: 'Activity states' },
      { value: '155', label: 'Swift tests' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: "Coding agents run in terminals and background windows, so it's easy to miss the moment one stops to ask for approval, finishes, or loses its connection.",
      },
      {
        label: 'Build',
        text: 'A Swift 6 AppKit panel with SwiftUI views that sits over the notch (or the top of an external display) and follows Spaces and full-screen apps.',
        points: [
          'One spring drives the window, outline, and content together, and content blurs as it swaps, so the panel grows out of the notch instead of popping in.',
          'notchctl and Codex hooks post to a private Unix socket that needs a per-user token; requests are size, time, and connection capped, and legacy TCP is off by default.',
          'Music samples the artwork for an ambient tint. Music, clipboard history, downloads, notifications, and system metrics stay off until you enable them, and the file shelf only bookmarks files you drop or choose.',
        ],
      },
      {
        label: 'Result',
        text: 'The compact surface shows one live signal at a time and puts an agent that needs you first. Hover to peek, click to open six sections, or press Option-N.',
      },
      {
        label: 'Status',
        text: 'Builds from source as a universal app. A tag-driven release pipeline (Developer ID, notarization, Sparkle updates) is set up, but no public release has shipped yet.',
      },
    ],
    // Commands, states, and paths are from the README; the example follows one Codex turn.
    architecture: {
      scenario: 'a Codex turn that needs your approval',
      lanes: [
        {
          label: 'Agent to notch',
          nodes: [
            {
              label: 'Codex hooks',
              detail: 'Installed with notchctl install-codex-hooks. Each lifecycle event maps onto an activity state, and if the app is closed the hook still exits cleanly so it never interrupts the agent.',
              example: ['UserPromptSubmit  → running', 'PermissionRequest → needs_approval', 'PostToolUse       → running (heartbeat)', 'Stop              → succeeded'],
            },
            {
              label: 'notchctl',
              detail: 'The bundled CLI. Any agent, script, or Shortcut can send an activity with a stable ID and update it as the work changes state.',
              example: ['$ notchctl send --id checkout-42 \\', '    --source "Codex" \\', '    --title "Review checkout changes" \\', '    --state needs_approval'],
            },
            {
              label: 'Private socket + token',
              detail: 'Requests go to a Unix socket in a directory only your account can read, with a bearer token. Bodies are capped at 64 KiB, requests at 10 seconds, and connections at 64. Rotating the token drops open connections.',
              example: ['POST /v1/activities', 'Authorization: Bearer <token>', '→ 64 KiB · 10 s · 64 connections max'],
            },
          ],
        },
        {
          label: 'Notch',
          nodes: [
            {
              label: 'Activity store',
              detail: 'Keeps the history and liveness of every activity. Unfinished activities without an update for five minutes are marked Disconnected, while finished ones keep their result; identical heartbeats refresh liveness without adding history.',
              example: ['checkout-42  needs_approval', 'last update  12 s ago', 'no update for 5 min → Disconnected'],
            },
            {
              label: 'Compact surface',
              detail: 'Shows one signal at a time. An agent that needs you takes priority over downloads, the focus timer, and music, and the panel springs open from the notch.',
              example: ['Codex · Needs review', 'Review checkout changes'],
            },
            {
              label: 'Expanded panel',
              detail: 'Six sections: Activity, Focus, Files, Music, Clipboard, and System. Approval opens the action URL in the source app; NotchRouter never approves work on its behalf.',
              example: ['1 Activity  2 Focus  3 Files', '4 Music     5 Clipboard  6 System', 'Open → action_url in the source app'],
            },
          ],
        },
      ],
    },
    tech: ['Swift 6', 'SwiftUI', 'AppKit', 'Swift Testing', 'Unix sockets', 'Native messaging', 'Sparkle'],
    repo: 'https://github.com/AzaanKH/mac-dynamic-notch',
  },
  {
    slug: 'devenv-mcp',
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
    // are from a Sleeper mock draft (pick 2.06); the card uses a crop of the Assistant's
    // Best Pick panel, the product's actual answer, whose big numbers stay readable at
    // card size.
    slug: 'draft-assistant',
    name: 'Fantasy Draft Assistant',
    eyebrow: 'Fantasy football tooling',
    description:
      'A local fantasy football draft workspace that tracks picks, compares available players, and explains roster fit and draft timing. Includes a Chrome extension companion for Sleeper, Yahoo, and ESPN draft rooms.',
    proof: 'The React workspace and terminal CLI share draft calculations, while a local sync server polls Sleeper and Yahoo for picks and the Chrome extension relays ESPN draft observations. Data readiness checks block recommendations when required inputs are missing or stale.',
    screenshot: {
      type: 'image',
      src: '/projects/fantasy-draft-assistant/best-pick-card.webp',
      width: 680,
      height: 900,
      position: 'top center',
      alt: 'Assistant at pick 2.06 recommending CeeDee Lamb: 18.3 points of waiting cost to pick 3.05 and +88 above replacement, with a side-by-side comparison against Justin Jefferson.',
      caption: 'Best Pick · Sleeper mock draft · pick 2.06',
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
    // Copy, model details, and evaluation numbers come from the football repo README.
    // The screenshot is the live site's week 5 RB comparison; the architecture
    // example follows it.
    slug: 'start-sit',
    name: 'Start/Sit Predictor',
    eyebrow: 'ML product system',
    description:
      "A fantasy football start/sit site: pick the players you're deciding between and see each one's projected PPR points with a calibrated 80% range.",
    proof: 'A local Python pipeline (Sleeper and ESPN data, Postgres features, position-specific models) is checked against baselines, then exported as static JSON to a hosted site, so no API or database runs in production.',
    screenshot: {
      type: 'image',
      src: '/projects/start-sit-compare.webp',
      width: 805,
      height: 650,
      // Shown whole on the site's own green, so the verdict and both point totals are
      // never cropped, whatever shape the frame takes.
      fit: 'contain',
      background: '#173a29',
      alt: 'Start/Sit comparing two running backs for week 5 of 2026: Start Kyren Williams, projected 18.7 PPR points, 3.1 more than James Cook at 15.6, each with an 80% range bar.',
      caption: 'Live site · week 5 RB start/sit',
    },
    metrics: [
      {
        value: '74%',
        label: 'RB start/sit accuracy',
        note: 'Held-out 2025 weeks 5–18: pairs of RBs projected for 5+ points whose actual scores differed by 3+ points. Closer calls aren’t counted.',
      },
      { value: '80%', label: 'Calibrated ranges' },
      { value: 'Live', label: 'Hosted site' },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: 'Weekly start/sit decisions need current player context, matchup data, and uncertainty, not just season averages.',
      },
      {
        label: 'Build',
        text: "Each prediction is anchored on Sleeper's weekly PPR projection, given a calibrated 80% range, and published as static JSON to a comparison site.",
        points: [
          'A learned correction is kept only when it lowers error without hurting start/sit accuracy; players without a projection fall back to an XGBoost model on engineered features.',
          '10th and 90th percentile models are conformally calibrated (CQR), so the range covers about 80% of outcomes.',
          'Python, Postgres, and the model stay local. Cloudflare Pages rebuilds from a published snapshot, and missing or invalid data fails the build instead of shipping.',
        ],
      },
      {
        label: 'Result',
        text: 'On held-out 2025 weeks 5–18, start/sit accuracy beats a 3-game average at every position: RB 74.3% vs 68.3%, WR 70.9% vs 65.6%, QB 62.2% vs 59.7%. It counts pairs of players projected for 5+ points whose actual scores differed by 3+ points, so close calls are excluded.',
      },
    ],
    architecture: {
      scenario: 'a week 5 running back start/sit',
      lanes: [
        {
          label: 'Local, weekly',
          nodes: [
            {
              label: 'Sleeper + ESPN sync',
              detail: "Reads the current season and week from Sleeper, then syncs only what's missing: the schedule, stats for finished weeks, and Sleeper's projections. In the offseason the stat syncs skip cleanly.",
              example: ['$ python setup_season.py --dry-run', 'schedule · stats · projections', '$ python setup_season.py'],
            },
            {
              label: 'Postgres feature pipeline',
              detail: 'Turns weekly stats into features: rolling averages, reliability flags for thin early-season samples, efficiency, consistency, usage trends, and matchup context. Only games a player actually played count.',
              example: ['rolling   points over 3 / 5 / 10 games', 'reliable  games played, prior-season blend', 'form      boom rate, bust rate, floor', 'matchup   opponent defense, snap share, rest'],
            },
            {
              label: 'Weekly predictor',
              detail: "The point estimate is Sleeper's projection, plus a shallow correction only where it measurably helps. Quantile models give the 80% range, calibrated on the latest weeks. Temporal splits only.",
              example: ['point   Sleeper projection (+ correction)', 'range   p10 / p90, conformal (CQR)', 'no projection → XGBoost fallback'],
            },
            {
              label: 'Evaluation vs baselines',
              detail: 'Every modeling choice is checked against a 3-game average and the previous standalone model on held-out weeks, by error, start/sit accuracy, and range coverage.',
              example: ['$ python evaluation.py rb', 'RB  3-game avg  5.35 MAE  68.3%', 'RB  current     4.69 MAE  74.3%', '80% range coverage  77.8%'],
            },
          ],
        },
        {
          label: 'Published',
          nodes: [
            {
              label: 'Static JSON snapshot',
              detail: 'Predictions are exported to JSON, 200 sampled requests are verified against the local predictor, and the snapshot is uploaded as a GitHub Release asset.',
              example: ['$ ./scripts/publish-data.ps1', 'export → verify 200 samples', '→ predictions.json.gz (release asset)'],
            },
            {
              label: 'Cloudflare Pages build',
              detail: 'Each build downloads the snapshot and validates every manifest file. If anything is missing or invalid, the build fails and the current deployment stays live. No hosted API or database.',
              example: ['$ npm run build:site', 'download snapshot · validate manifest', '→ football-start-sit.pages.dev'],
            },
            {
              label: 'Start/Sit comparison',
              detail: 'Pick a season, week, and position, add the players you are deciding between, and get a verdict with projected PPR points and the range each lands in 8 times out of 10.',
              example: ['week 5 · RB', 'Kyren Williams  18.7', 'James Cook      15.6', '→ Start Kyren Williams (+3.1)'],
            },
          ],
        },
      ],
    },
    tech: ['React', 'shadcn/ui', 'Python', 'Flask', 'PostgreSQL', 'TimescaleDB', 'XGBoost', 'Cloudflare Pages'],
    repo: 'https://github.com/AzaanKH/football',
    demo: 'https://football-start-sit.pages.dev',
  },
  {
    // Coursework: the Paxos lab from the DSLabs framework (github.com/emichael/dslabs,
    // labs/lab3-paxos). The solution can't be published, so there is no repo link. What
    // the system does and every number here come from the lab's public spec (README) and
    // its test suite (PaxosTest.java): cluster sizes, timings, drop rate, and limits are
    // the tests' own. The card's diagram is the suite's 5-server, 3 / 2 partition.
    slug: 'paxos',
    name: 'Distributed Paxos Consensus',
    eyebrow: 'Distributed systems · coursework',
    description:
      'A replicated key-value store in Java built on multi-instance Paxos: a group of servers agrees on one ordered log of client commands, and stays correct while servers are partitioned and messages are dropped.',
    proof: 'Built against the DSLabs Paxos lab. Its 27 tests run 3- and 5-server clusters through partitions, a network that drops 20% of messages, and model-checking searches for any ordering of messages that breaks agreement. Coursework, so the source stays private.',
    screenshot: {
      type: 'quorum',
      title: 'Consensus under partition',
      nodes: 5,
      quorum: 3,
      phases: ['Prepare', 'Promise', 'Accept', 'Decided'],
      status: ['Java', 'Multi-Paxos', '27 lab tests'],
    },
    metrics: [
      { value: '27', label: 'lab tests' },
      { value: '20%', label: 'messages dropped' },
      {
        value: '2 s',
        label: 'max client wait',
        note: 'The lab’s bound: five clients send requests for 30 seconds while the network is repartitioned every 2 seconds, and no request may wait longer than 2 seconds.',
      },
    ],
    caseStudy: [
      {
        label: 'Problem',
        text: 'A replicated service has to keep answering, and keep every replica’s history identical, when servers become unreachable, messages are lost or reordered, or the network splits in two.',
      },
      {
        label: 'Build',
        text: 'One PaxosServer class plays every Paxos role at once. The servers agree on a shared log one slot at a time and each executes it in order, so clients see a single linearizable store.',
        points: [
          'Stable leader: a leader that sees a higher ballot steps back to follower, and only campaigns again after two heartbeat checks pass without hearing from the leader.',
          'Log compaction: servers report the last slot they executed on the heartbeat exchange, the leader works out what every server has executed, and older slots are freed. Servers that fell behind are sent the decisions they missed.',
          'At-most-once execution, so a command that reaches the log twice (a client retry) is only applied once.',
        ],
      },
      {
        label: 'Result',
        text: 'The lab’s suite checks progress with a majority and none in a minority, a server switching sides of a partition, and 25 clients appending concurrently. It caps traffic at 75 server messages per agreed command, and requires memory to fall back under 2 MB once old slots are compacted. Search tests then explore message orderings for any state where two servers decide different values.',
      },
      {
        label: 'Status',
        text: 'A course project. The lab framework and its tests are public; the solution isn’t, at the course’s request.',
      },
    ],
    // The example walks one textbook Paxos round on the 3 / 2 split drawn on the card.
    architecture: {
      scenario: 'agreeing on one log slot while the network is split 3 / 2',
      lanes: [
        {
          label: 'Consensus round',
          nodes: [
            {
              label: 'Client request',
              detail: 'A client sends its command to the servers and waits for one reply. Every server that executes the log must see the same command in the same slot.',
              example: ['Put("k", "v")', '→ sent to every server'],
            },
            {
              label: 'Leader',
              detail: 'The server with the highest ballot. It wins a majority of promises once, then proposes each new command for the next free slot.',
              example: ['ballot 5, server 1', 'Prepare(5) → every reachable server', 'Accept(5, slot 7, Put) once a majority promises'],
            },
            {
              label: 'Acceptors / quorum',
              detail: 'Promise to ignore lower ballots, then accept. A slot is decided once a majority, 3 of 5, accepts it.',
              example: ['Promise(5) × 3     quorum 3/5 ✓', 'Accepted(5, slot 7) × 3', '→ slot 7 is decided'],
            },
            {
              label: 'Execute + reply',
              detail: 'Each server executes decided slots in order, with no gaps, on its own copy of the store. The client gets its result once the command has run.',
              example: ['slot 6 done → run slot 7', 'reply PutOk to the client'],
            },
          ],
        },
        {
          label: 'Lab test harness',
          nodes: [
            {
              label: 'Partitions',
              detail: 'Tests cut the network into groups and heal it again. The side holding a majority keeps committing; the minority side must not decide anything.',
              example: ['split  {1, 2, 3} | {4, 5}', 'minority: Prepare(6) → 2 promises', '→ needs 3, cannot decide'],
            },
            {
              label: 'Unreliable network',
              detail: 'The unreliable tests deliver only 80% of messages, in no guaranteed order, so every step has to be safe to retry.',
              example: ['deliver rate 0.8', 'Accepted from server 3 is lost', '→ leader resends, slot still decided once'],
            },
            {
              label: 'Invariants + search',
              detail: 'After each run the tests check that clients got correct results and that no two servers hold different commands in a slot. Search tests check the same over explored message orderings.',
              example: ['RESULTS_OK ✓', 'LOGS_CONSISTENT ✓', 'search: no state with two values in one slot'],
            },
          ],
        },
      ],
    },
    tech: ['Java', 'Multi-Paxos', 'Replicated state machine', 'Model checking'],
    reference: { href: 'https://github.com/emichael/dslabs/tree/master/labs/lab3-paxos', label: 'Lab spec' },
  },
]

export const getProject = (slug) => projects.find((project) => project.slug === slug)
