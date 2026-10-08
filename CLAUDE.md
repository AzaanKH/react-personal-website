# Claude AI Memory - React Portfolio Project

## Quick Start

**Always use `netlify dev`** (not `npm run dev`). It loads `.env`, runs the Netlify Functions, and proxies Vite at http://localhost:8888.

```bash
netlify dev
npm run check      # lint + unit tests + build — run before committing
npm run test:live  # network smoke test of /api/steam (TEST_BASE_URL to override)
npm run add -- movie "Dune: Part Two" 2024   # also show|anime|game; see "Interests page"
```

---

## Architecture Overview

**"Architectural Minimalism" (v8)**: a single-page app with a hand-rolled router. `App.jsx` holds `activePage`; `pushState`/`popstate` keep the URL in sync. No router library.

| Layer | Technology |
|-------|-----------|
| Framework | React 19.3 + Vite 8 |
| Styling | Tailwind CSS 3.4 + CSS custom properties (`--color-*`). Tailwind 4 migration not done yet. |
| Animation | Motion 12 (`motion/react`) |
| Icons | lucide-react 1.x. Brand icons were removed upstream, so GitHub/LinkedIn are in `components/BrandIcons.jsx`. |
| Contact | `POST /api/contact` function → Resend email; Netlify platform rate limit |
| Steam | `GET /api/steam` function (always the configured `STEAM_ID`) |
| Weather | `/.netlify/functions/weather` → Open-Meteo |
| Fantasy football | Sleeper API, fetched **directly from the browser** (no key, CORS `*`) |
| Posters | TMDB (movies/shows/anime), Steam CDN, IGDB (non-Steam games). IDs stored in `src/data/interests.json` by `npm run add` |
| Tests | Vitest 5 + Testing Library + jsdom (`tests/unit`) |
| Node | 24 (netlify.toml, CI, `.nvmrc`); Vite 8 needs ≥ 22.12 |

---

## Routing (`src/lib/routes.js`)

- `routes` is the single source of truth: path, nav label, `<title>`, meta description.
- `applyPageMetadata(page)` updates title, description, canonical, og:*, twitter:* on every page change.
- Non-JS crawlers: the `prerender-route-heads` plugin in `vite.config.js` emits `dist/<page>.html` (a copy of the built `index.html` with `renderPageHead(html, page)` applied). Netlify serves `/projects` from `projects.html` because a static file shadows the non-forced SPA rewrite; under `netlify dev` the rewrite to `index.html` still applies. `renderPageHead` throws if `index.html` loses one of the tags in `HEAD_TAGS`, which keeps the key attribute first (`<meta name="…" content="…">`).
- Nav and in-page links use `components/RouteLink.jsx`: a real `<a href>` that does client-side navigation on a plain left click and leaves modifier clicks to the browser.
- After in-app navigation (not the first load), `PageTransition` focuses the new page's `h1`. **Every page must render exactly one `h1`.** GamingPage uses a stable `sr-only` h1 because its visible heading changes with loading/playing state.
- `/gaming` was folded into `/interests`: `routes.interests.aliases` maps it client-side and `netlify.toml` 301s it to `/interests#gaming`. Keep the two in sync. App keeps `location.hash` when canonicalizing the path.
- `netlify.toml` lists SPA routes explicitly. **Do not reintroduce a `/*` → `/index.html` rewrite**: under `netlify dev` it rewrites Vite's `/src/*` and `/@vite/*` modules to HTML and the page goes blank. Adding a page means updating `routes.js` and `netlify.toml`.
- Unknown paths: `public/404.html` in production (Vite's own fallback in dev).

---

## Netlify Functions

Modern (v2) functions: `export default async (req, context) => Response` plus `export const config = { path, rateLimit }`. Read env with `Netlify.env.get()`. Handler logic lives in `netlify/lib/*.js` and takes explicit params, so it can be unit-tested without the runtime.

| Path | Files | Behaviour |
|------|-------|-----------|
| `GET /api/steam?endpoint=` | `functions/steam-proxy.js`, `lib/steam.js` | Endpoints: profile, recent, games, level. Ignores `steamid`, clamps `count` to 1–20, builds URLs with `URLSearchParams`, 8s upstream timeout (504), never echoes upstream bodies. Cache: profile 60s, recent 10m, games 1h, level 1d, with `Netlify-Vary: query=endpoint|count|refresh`. Any `refresh` param → `no-store` (Refresh button; always reaches Steam). Fetch *and* body parse are both inside the try (bad JSON → 502, mid-body timeout → 504). `_metadata.timestamp` = when Steam was queried. Platform limit 60/min/IP. |
| `POST /api/contact` | `functions/contact.js`, `lib/contact.js` | JSON only, same-origin only, ≤20 KB. Honeypot field `website` → fake 200. Validates with `src/lib/contactValidation.js` (shared with the form), then sends via Resend REST. Rate limiting is Netlify's platform limit only (5 per 3 min per IP, 429 before the function runs, no JSON body; ContactPage handles that). Upstash was removed: its database stopped resolving, and the old fail-open limiter had been hiding that. |
| `/.netlify/functions/weather` | `functions/weather.js` | Bellevue, WA; 15 min cache. |
| `GET /api/nfl-players` | `functions/nfl-players.js`, `lib/nflPlayers.js` | Sleeper player names for the fantasy lineups. Downloads Sleeper's ~15 MB `/players/nfl` (Sleeper asks for at most once a day) and returns `{ players: { id: [name, pos, team] } }` for active QB/RB/WR/TE/K + DEF (~3,200 players, ~35 KB gzipped). `Netlify-CDN-Cache-Control: durable, max-age=86400, stale-while-revalidate`; `Netlify-Vary: query=none` so query strings can't bypass the cache. No platform rate limit (both free rules are used). Requested by the browser only when a lineup is opened (`src/lib/nflPlayers.js`), then kept in `localStorage['nfl_players_v1']` for 24 h. Only the in-flight request promise is shared, and it's cleared once settled, so an open tab refetches after the TTL. |

Platform rate limits (`config.rateLimit`): the free plan allows **2 code-based rules per project**, and both are used (contact, steam-proxy). Netlify checks that rules are active during the deploy's post-processing stage, and they also apply to deploy previews. Enforcement can lag up to ~10s after a client crosses the threshold, so a fast burst can get a few extra requests through before 429s begin. Verified on deploy-preview-1: the 429 has an empty body.

Netlify Forms is **no longer used**: there is no hidden form in `index.html`. Delivery happens only inside the function, so the rate limit can't be bypassed.

Local testing: `CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>` only delivers to the Resend account's email (azaankhalfe@gmail.com), which is also `CONTACT_TO_EMAIL`. Every local submit sends a real email.

---

## Hooks

- **`useSteamData(endpoints)`**: `endpoints` must be a stable reference (module constant or `useMemo`). Returns `{ steamData, loading, refreshing, error, errors, partialFailure, lastUpdated, usingCache, refetch, formatPlaytime, ... }`. Per-endpoint localStorage cache TTLs mirror the proxy. If everything is fresh in cache, the first render skips the network. `refetch()` adds a unique `refresh=<nonce>` and `cache: 'no-store'`. (`cache: 'reload'` alone was not enough, because it skips the browser cache but not Netlify's CDN.) `lastUpdated` is the oldest server `_metadata.timestamp` on screen, not the client's receive time, and the localStorage TTLs are measured from it too. Requests abort on unmount and time out after 10s. Failed endpoints keep previously shown data and are reported in `errors`.
- **`useDarkMode()`**: `{ theme, resolvedTheme, setTheme }`. System preference comes from `useSyncExternalStore(matchMedia)`. The stored key `v8-theme` is also read by the inline script in `index.html` to avoid a flash; keep them in sync.
- **`useWeather()`**: cached 15 min; aborts on unmount; fails silently.

ESLint uses `eslint-plugin-react-hooks` 7, which includes the React Compiler rules. Calling `setState` synchronously in an effect body is an error, so derive values or set state in callbacks instead.

---

## Interests page (`pages/InterestsPage.jsx`, `components/interests/`)

- Sections: Football (`FantasySection`), Gaming (`GamingSection`), then Movies/Shows/Anime (`MediaSection`), which render only when their list in `src/data/interests.json` is non-empty. The in-page jump links use `scrollIntoView` and **don't change the hash**: a hash change fires `popstate`, which App treats as navigation.
- **Sleeper** (`lib/sleeper.js`, `hooks/useSleeper.js`): the user ID is hard-coded; the league is found by name (`SLEEPER_LEAGUE_NAME`) for `state.league_season`, because keeper leagues get a new `league_id` each season. Polls every 3 min while the tab is visible; the last good result is kept in `localStorage['sleeper_summary_v3']`. **Only the owner's team is ever named**; opponents are a score only (some league team names aren't portfolio-safe). The league name, ID, and Sleeper link are deliberately left out of the summary (not just hidden), so the league can't be found from the page. Game state per player comes from Sleeper's **undocumented** `api.sleeper.app/schedule/nfl/{regular|post}/{season}` (CORS `*`, 10-min cache): 0 points before kickoff shows "Yet to play", a live game gets a pulsing dot, no game is "Bye". It has its own 4 s timeout (`SCHEDULE_TIMEOUT_MS`) so it can never hold back scores; if it fails or times out, `gameStatus` is null and rows just show points. Headshots come from Sleeper's **undocumented** image CDN (`sleepercdn.com/content/nfl/players/thumb/{id}.jpg`; team logos for DEF), fall back to initials, and render only once the name list has loaded. "Show lineups" expands both starting lineups (`buildLineup` pairs non-bench `roster_positions` with `starters`/`starters_points`). The league has median games on, so the record has two results per week. `matchupResult(matchup)` returns won/lost/tied only once **every** game in the week's schedule is `complete` (null without the schedule, so a Thursday lead never counts). It's head-to-head only and is derived in the component, so the cache shape is unchanged. A win gets a stamped "Won" badge, plus confetti from the score (`VictoryBurst.jsx`) the first time the card is 40% on screen. It plays once per week per page load (`celebratedWeeks`), and there's no confetti under reduced motion.
- **Gaming**: `useSteamData(['profile', 'recent', 'games'])`. Most Played = top 6 by `playtime_forever`. Favorites come from `interests.games`: Steam entries (`appid`) get live hours from the library; others use the `hours` typed into the file.
- **Poster carousels** (`PosterShelf rotate` → `PosterCarousel.jsx`, math in `lib/carousel.js`): rows with ≥ 7 posters are a native horizontal scroll container (scrollbar hidden) that an rAF loop advances ~30 px/s. The list renders 3×; position stays within the middle copy and wraps by one copy width. The outer copies scroll into view, so they must stay **clickable**: `aria-hidden` on the list plus `tabIndex=-1` on their links via `CarouselCopyContext` (never `inert`). While focus is inside the row (`viewport.contains(document.activeElement)`, not focusin/focusout events, which don't always fire) the row neither moves nor wraps, so a focused poster can't jump offscreen. Speed eases to 0 on hover, focus, drag, touch (resumes 2 s after), or offscreen. Mouse drag uses pointer events (capture only after 5 px, so clicks still reach links; the click ending a drag is swallowed); touch/trackpad use native scrolling. The hairline rail is a custom scrollbar that wraps like the loop, with a `07 / 23` counter. "Show all" swaps to the grid (WCAG 2.2.2). Reduced motion: no auto-scroll, drag and rail still work. Prefer this over a carousel library (GSAP/Embla/Splide/Swiper were considered; native scroll gives trackpad, momentum, and focus scrolling for free).
- **PosterCard**: 2:3 frame; image → `fallbackSrc` (letterboxed) → text tile. Steam portrait art is `library_600x900.jpg`, falling back to `header.jpg`.
- **`npm run add`** (`scripts/add.js`, lookups in `scripts/lib/catalog.js`): needs `TMDB_API_KEY`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` in `.env` (local only, not Netlify). Entries display in file order (the script prepends; reorder by hand). Re-adding moves an entry to the front and keeps its rating/review. Ratings are 0.5–5 in half steps. Pass `--pick N` when not in a TTY.
- Attribution: the TMDB notice shows at the bottom of the page when any media shelf renders; the IGDB credit shows under Favorites when a non-Steam game is listed.

---

## Contact page

- Fields `name`, `email`, `message` (+ hidden honeypot `website`).
- State (draft, status, error, server errors) lives in `src/lib/contactForm.js`, a module-level `useSyncExternalStore` store, **not** in ContactPage. The page unmounts on navigation while a send can still be in flight, so `submitContact` itself clears the draft on success, but only if the draft still equals what was sent (edits made while sending are kept). On return, the page shows the in-flight "Sending…" or the "sent" result.
- Drafts are mirrored to `sessionStorage['contact-draft']` (survive reload). Tests call `resetContactForm()` in `beforeEach`.
- Server field errors (`{ errors }` in a 400) are merged into the client errors.

---

## Theming

CSS variables in `src/index.css` (`:root` / `.dark`): `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-text-secondary`, `--color-accent` (#b04e32 / #e07a5f), `--color-border`, `--shadow-*`. Use `var(--color-*)` rather than Tailwind colour classes. Light-mode secondary text and accent are tuned to just clear 4.5:1 on `--color-bg`, including `--color-bg` text on an accent button. Re-check contrast before lightening them. `.dark` also sets `color-scheme`; `useDarkMode` points the `theme-color` metas at the resolved `--color-bg`. Helpers: `.hover-accent`, `.hover-text`, `.hover-accent-bg` (hover-gated to `(hover: hover) and (pointer: fine)`, as are Tailwind `hover:` variants via `hoverOnlyWhenSupported`), `.press` (primary-button press scale), `.hit-area` (44px tap target around a smaller visual), `.grain-overlay`, `.skip-link`. Font sizes come from the `--text-*` clamp tokens in `:root`. Don't write new bare-`vw` clamps.

**Page conventions** (keep these consistent across pages):
- Every page wraps its content in `.page-shell` (1080px max, 1.5rem gutters), so the left edge lines up everywhere.
- Page titles (`h1`) use `display-heading page-title`. Two display voices only: heavy Space Grotesk for the name on Home, Cormorant for every page and section title.
- Small labels above headings use `components/Kicker.jsx` ("── SELECTED WORK"; with `number` on long pages: "01 ── FANTASY FOOTBALL"). **A kicker must add something the heading doesn't say** (what a playful heading is about, or why the page exists). Don't repeat the nav label or the heading, and don't stack labels (a single-shelf section has no shelf title). Interests numbers come from the `SECTIONS` order and are shared with the jump links.

---

## Testing

- `tests/setup.js` sets `MotionGlobalConfig.skipAnimations`, stubs `matchMedia`/`ResizeObserver`, and clears storage and the URL before each test.
- Stub network calls with `vi.stubGlobal('fetch', ...)`; it is reset automatically.
- `tests/live/` is never run by `npm test` or CI. Use `npm run test:live`.

---

## Key Patterns

1. `netlify dev` for local development.
2. Import from `motion/react`, not `framer-motion`.
3. `hasPlayedIntro` (module-level, HomePage) prevents replaying the intro animation.
4. `MotionConfig reducedMotion="user"` handles reduced motion globally; Navigation also jumps its spring.
5. Keep the dependency list lean. `clsx`, `tailwind-merge`, `tailwindcss-animate`, `node-fetch`, `dotenv`, `@upstash/*`, and shadcn config were removed.

## Known follow-ups

- Tailwind 4 migration (the only remaining `npm audit` findings are dev-only and come from Tailwind 3's `chokidar`/`micromatch` → `braces`).
- motion 14 and further lucide upgrades: check changelogs first.
