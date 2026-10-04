# Claude AI Memory - React Portfolio Project

## Quick Start

**Always use `netlify dev`** (not `npm run dev`). It loads `.env`, runs the Netlify Functions, and proxies Vite at http://localhost:8888.

```bash
netlify dev
npm run check      # lint + unit tests + build — run before committing
npm run test:live  # network smoke test of /api/steam (TEST_BASE_URL to override)
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
| Tests | Vitest 5 + Testing Library + jsdom (`tests/unit`) |
| Node | 24 (netlify.toml, CI, `.nvmrc`); Vite 8 needs ≥ 22.12 |

---

## Routing (`src/lib/routes.js`)

- `routes` is the single source of truth: path, nav label, `<title>`, meta description.
- `applyPageMetadata(page)` updates title, description, canonical, og:*, twitter:* on every page change. `index.html` ships the home page's values for non-JS crawlers.
- Nav and in-page links use `components/RouteLink.jsx`: a real `<a href>` that does client-side navigation on a plain left click and leaves modifier clicks to the browser.
- After in-app navigation (not the first load), `PageTransition` focuses the new page's `h1`. **Every page must render exactly one `h1`.** GamingPage uses a stable `sr-only` h1 because its visible heading changes with loading/playing state.
- `netlify.toml` lists SPA routes explicitly. **Do not reintroduce a `/*` → `/index.html` rewrite**: under `netlify dev` it rewrites Vite's `/src/*` and `/@vite/*` modules to HTML and the page goes blank. Adding a page means updating `routes.js` and `netlify.toml`.
- Unknown paths: `public/404.html` in production (Vite's own fallback in dev).

---

## Netlify Functions

Modern (v2) functions: `export default async (req, context) => Response` plus `export const config = { path, rateLimit }`. Read env with `Netlify.env.get()`. Handler logic lives in `netlify/lib/*.js` and takes explicit params, so it can be unit-tested without the runtime.

| Path | Files | Behaviour |
|------|-------|-----------|
| `GET /api/steam?endpoint=` | `functions/steam-proxy.js`, `lib/steam.js` | Endpoints: profile, recent, games, level. Ignores `steamid`, clamps `count` to 1–20, builds URLs with `URLSearchParams`, 8s upstream timeout (504), never echoes upstream bodies. Cache: profile 60s, recent 10m, games 1h, level 1d. Platform limit 60/min/IP. |
| `POST /api/contact` | `functions/contact.js`, `lib/contact.js` | JSON only, same-origin only, ≤20 KB. Honeypot field `website` → fake 200. Validates with `src/lib/contactValidation.js` (shared with the form), then sends via Resend REST. Rate limiting is Netlify's platform limit only (5 per 3 min per IP, 429 before the function runs, no JSON body; ContactPage handles that). Upstash was removed: its database stopped resolving, and the old fail-open limiter had been hiding that. |
| `/.netlify/functions/weather` | `functions/weather.js` | Bellevue, WA; 15 min cache. |

Platform rate limits (`config.rateLimit`): the free plan allows **2 code-based rules per project**, and both are used (contact, steam-proxy). Netlify checks that rules are active during the deploy's post-processing stage, and they also apply to deploy previews. Enforcement can lag up to ~10s after a client crosses the threshold, so a fast burst can get a few extra requests through before 429s begin. Verified on deploy-preview-1: the 429 has an empty body.

Netlify Forms is **no longer used**: there is no hidden form in `index.html`. Delivery happens only inside the function, so the rate limit can't be bypassed.

Local testing: `CONTACT_FROM_EMAIL=Portfolio <onboarding@resend.dev>` only delivers to the Resend account's email (azaankhalfe@gmail.com), which is also `CONTACT_TO_EMAIL`. Every local submit sends a real email.

---

## Hooks

- **`useSteamData(endpoints)`**: `endpoints` must be a stable reference (module constant or `useMemo`). Returns `{ steamData, loading, refreshing, error, errors, partialFailure, lastUpdated, usingCache, refetch, formatPlaytime, ... }`. Per-endpoint localStorage cache TTLs mirror the proxy. If everything is fresh in cache, the first render skips the network. `refetch()` uses `cache: 'reload'`. Requests abort on unmount and time out after 10s. Failed endpoints keep previously shown data and are reported in `errors`.
- **`useDarkMode()`**: `{ theme, resolvedTheme, setTheme }`. System preference comes from `useSyncExternalStore(matchMedia)`. The stored key `v8-theme` is also read by the inline script in `index.html` to avoid a flash; keep them in sync.
- **`useWeather()`**: cached 15 min; aborts on unmount; fails silently.

ESLint uses `eslint-plugin-react-hooks` 7, which includes the React Compiler rules. Calling `setState` synchronously in an effect body is an error, so derive values or set state in callbacks instead.

---

## Contact page

- Fields `name`, `email`, `message` (+ hidden honeypot `website`).
- Drafts are saved to `sessionStorage['contact-draft']` and cleared on success.
- Server field errors (`{ errors }` in a 400) are merged into the client errors.

---

## Theming

CSS variables in `src/index.css` (`:root` / `.dark`): `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-text-secondary`, `--color-accent` (#c45d3e / #e07a5f), `--color-border`, `--shadow-*`. Use `var(--color-*)` rather than Tailwind colour classes. Helpers: `.hover-accent`, `.hover-text`, `.hover-accent-bg`, `.grain-overlay`, `.skip-link`.

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
