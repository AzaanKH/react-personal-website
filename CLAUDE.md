# Claude AI Memory - React Portfolio Project

## Quick Start

**IMPORTANT:** Always use `netlify dev` to run the development server (NOT `npm run dev`).

```bash
netlify dev
# Loads .env, starts Netlify Functions on port 8888, proxies Vite dev server
# Access at: http://localhost:8888
```

If you use `npm run dev` instead, Netlify Functions (Steam API, weather, rate limiting) won't be available.

---

## Architecture Overview

**"Architectural Minimalism" (v8)** — state-based multi-page app. Pages swap via `activePage` state in `App.jsx`. No router library.

**Pages:** Home, Projects, Gaming, Contact
**Navigation:** Gravity-shift nav bar (bottom on Home, top on other pages) with spring physics
**Design language:** Terracotta accent, bone/ink palette, Space Grotesk + Cormorant Garamond fonts, grain texture overlay

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3.1 + Vite 5.4.10 |
| Styling | Tailwind CSS 3.4.17 (pure — no Bootstrap, no shadcn/Radix) |
| Animation | Motion 12.29.2 (`motion/react` — the renamed Framer Motion) |
| Icons | Lucide React |
| Contact | EmailJS + Upstash Redis rate limiting |
| Steam API | Netlify Functions proxy (`steam-proxy.cjs`) |
| Weather | Netlify Function proxy (`weather.js`) → Open-Meteo API (free, no key) |
| Dark mode | `useDarkMode` hook (system/light/dark cycle, localStorage) |
| Deployment | Netlify (azaankhalfe.netlify.app) |

### Key Design Decisions

- **No router** — `activePage` state + `AnimatePresence` for page transitions
- **No component library** — pure Tailwind with CSS custom properties (`--color-*`)
- **No Context API** — dark mode via `useDarkMode` hook (simpler than ThemeContext)
- **`motion/react`** — the `motion` package (not legacy `framer-motion`)
- **`MotionConfig reducedMotion="user"`** — respects `prefers-reduced-motion` globally

---

## File Structure

```
my-portfolio/
├── src/
│   ├── App.jsx                         # Main app — activePage state, page switching
│   ├── main.jsx                        # React entry point
│   ├── index.css                       # Tailwind + CSS custom properties (light/dark)
│   │
│   ├── components/
│   │   ├── Navigation.jsx              # Gravity-shift nav (bottom↔top), spring physics
│   │   ├── DarkModeToggle.jsx          # Theme cycle: system → light → dark
│   │   ├── PageTransition.jsx          # Page enter/exit animations
│   │   └── StatusCorner.jsx            # Bottom corners: reading status + weather + time
│   │
│   ├── pages/
│   │   ├── HomePage.jsx                # Hero: letter-by-letter name animation, social links
│   │   ├── ProjectsPage.jsx            # Expandable accordion project cards (3 projects)
│   │   ├── GamingPage.jsx              # Steam API: recently played games, "Now Playing" state
│   │   └── ContactPage.jsx             # EmailJS form with rate limiting
│   │
│   ├── hooks/
│   │   ├── useSteamData.js             # Steam API data fetching + localStorage cache (5min TTL)
│   │   ├── useDarkMode.js              # Theme state: system/light/dark, localStorage persistence
│   │   └── useWeather.js               # Weather from /.netlify/functions/weather, 15min cache
│   │
│   ├── data/
│   │   └── status.json                 # Reading status, location metadata for StatusCorner
│   │
│   └── lib/
│       └── utils.js                    # cn() — clsx + tailwind-merge
│
├── netlify/functions/
│   ├── steam-proxy.cjs                 # Steam Web API proxy (profile, recent, games, level)
│   ├── weather.js                      # Open-Meteo weather proxy (Bellevue, WA), 15min CDN cache
│   ├── rate-check.js                   # Upstash Redis rate limiter for contact form
│   ├── steam-test.cjs                  # Environment variable testing
│   ├── debug.cjs                       # Debug utility
│   ├── hello.cjs                       # Test function
│   └── test-endpoint.cjs               # Endpoint testing
│
├── public/
│   ├── Azaan_Khalfe_Resume.pdf         # Resume (linked from HomePage)
│   ├── azaan_resume_.pdf               # Legacy resume
│   ├── steam-direct-test.html          # Steam API testing page
│   └── debug-steam.html               # Steam debugging tools
│
├── tests/
│   └── steam-api/                      # Steam API integration tests
│
├── Configuration
│   ├── .env                            # Secrets: STEAM_API_KEY, STEAM_ID, VITE_EMAILJS_*, UPSTASH_*
│   ├── netlify.toml                    # Netlify deployment config
│   ├── index.html                      # Google Fonts (Space Grotesk + Cormorant Garamond) + preloads
│   ├── tailwind.config.js              # Custom: ink/bone/terracotta/slate colors, font families
│   ├── vite.config.js                  # @ alias, Netlify functions proxy, build optimizations
│   ├── components.json                 # shadcn config (new-york style, JSX, Lucide icons)
│   ├── postcss.config.js               # PostCSS + Autoprefixer
│   ├── jsconfig.json                   # @ path alias for IDE
│   └── eslint.config.js                # ESLint with React plugins
│
└── Dev Scripts
    ├── dev-with-tests.js
    ├── dev-proxy.js
    └── start-dev.bat
```

---

## Component Architecture

### App.jsx — Root
- `activePage` state drives which page renders (`pages` object maps string → component)
- `AnimatePresence mode="wait"` for page transitions
- `MotionConfig reducedMotion="user"` wraps everything
- Grain texture overlay + subtle accent gradient (top-right corner wash)
- `mainRef` resets scroll position on page exit

### Navigation.jsx — Gravity Nav
- **Home:** nav sits at bottom of viewport
- **Other pages:** nav springs to top (y=24px)
- Uses `useSpring` for physics-based position, `useTransform` for scale/glow during travel
- `ResizeObserver` tracks nav height for accurate positioning
- Active page indicator: terracotta line slides under active button
- `useReducedMotion` — jumps instead of animating when reduced motion preferred

### DarkModeToggle.jsx
- Cycles: system → light → dark
- Animated icon swap (Monitor → Sun → Moon) with rotation
- Fixed top-right position (z-50)

### PageTransition.jsx
- Fade-in + slide-up on enter, fade-out on exit
- Custom easing curves: `[0.16, 1, 0.3, 1]` (enter), `[0.7, 0, 0.84, 0]` (exit)

### StatusCorner.jsx (Home page only)
- **Bottom-left:** Currently reading (title, author, progress bar from `status.json`)
- **Bottom-right:** Status message + weather (city, temp, time)
- Weather icon mapped from condition string (Clear→Sun, Rain→CloudRain, etc.)
- `useLocalTime` hook updates clock every 30s
- Hidden on mobile (`hidden sm:flex`)
- Entrance animation delayed after hero animation completes

### HomePage.jsx
- Letter-by-letter name animation (AZAAN KHALFE) with staggered delays
- Social links: GitHub, LinkedIn, Mail (→ navigates to Contact), Resume PDF
- First-visit animation tracked by module-level `hasPlayedIntro` flag
- StatusCorner rendered here (not in App) so it only shows on Home

### ProjectsPage.jsx
- 3 projects: LLM Multi-Model Chat System, NFL Fantasy Picker, Portfolio Website
- Expandable accordion pattern (click to expand/collapse)
- Expanded state shows: highlights list, tech tags, metrics, GitHub link
- Staggered enter animations per card

### GamingPage.jsx
- Uses `useSteamData(['profile', 'recent'])` with memoized args
- Three states:
  1. **Loading:** pulse skeleton
  2. **Currently playing:** full-screen "Now Playing" with pulsing dot + game name
  3. **Normal:** list of recently played games with playtime
- Error fallback: "Away from Keyboard"

### ContactPage.jsx
- EmailJS integration with rate limiting (Upstash Redis via `rate-check` function)
- Form fields: name, email, message (underline-style inputs)
- Button states: idle → sending (spinner) → success (check) → error (retry)
- 4-second auto-reset after success/error

---

## CSS Custom Properties (Theming)

Defined in `src/index.css` under `:root` and `.dark`:

| Variable | Light | Dark |
|----------|-------|------|
| `--color-bg` | `#f5f0eb` (bone) | `#0f0f0f` |
| `--color-surface` | `#ffffff` | `#1a1a1a` |
| `--color-text` | `#1a1a1a` (ink) | `#f5f0eb` |
| `--color-text-secondary` | `#64748b` | `#94a3b8` |
| `--color-accent` | `#c45d3e` (terracotta) | `#e07a5f` |
| `--color-border` | `#e5e0da` | `#2a2a2a` |
| `--shadow-*` | Light shadows | Darker shadows |

Utility classes: `.hover-accent`, `.hover-text`, `.hover-accent-bg`, `.grain-overlay`

---

## Hooks

### useSteamData(endpoints, options)
- Fetches from `/.netlify/functions/steam-proxy?endpoint=<name>`
- localStorage cache with 5-minute TTL
- Returns: `{ steamData, loading, error, formatPlaytime, getStats, isOnline, ... }`
- **Must memoize** endpoint arrays and options objects to prevent infinite re-renders:
  ```javascript
  const endpoints = useMemo(() => ['profile', 'recent'], [])
  const options = useMemo(() => ({ autoRefresh: false }), [])
  ```

### useDarkMode()
- Returns: `{ theme, resolvedTheme, setTheme }`
- `theme`: stored preference ('system' | 'light' | 'dark')
- `resolvedTheme`: actual applied theme ('light' | 'dark')
- Listens for system `prefers-color-scheme` changes when in 'system' mode
- Adds/removes `.dark` class on `<html>`

### useWeather()
- Fetches from `/.netlify/functions/weather`
- localStorage cache with 15-minute TTL
- Returns: `{ temp, condition, icon, text, loading }`
- Fails silently (keeps null values)

---

## Netlify Functions

| Function | Method | Purpose |
|----------|--------|---------|
| `steam-proxy.cjs` | GET | Proxies Steam Web API (hides API key). Endpoints: profile, recent, games, level |
| `weather.js` | GET | Proxies Open-Meteo API for Bellevue, WA weather. Returns `{ temp, condition, icon, text }`. 15min CDN cache |
| `rate-check.js` | POST | Upstash Redis rate limiter. Returns 429 when limit exceeded |
| `steam-test.cjs` | GET | Returns env var presence check (debug) |

---

## Environment Variables

```env
# Steam API (server-side only — used by steam-proxy.cjs)
STEAM_API_KEY=<Steam Web API Key>
STEAM_ID=<Your Steam ID>

# EmailJS (client-side — VITE_ prefix exposes to browser)
VITE_EMAILJS_SERVICE_ID=<service id>
VITE_EMAILJS_TEMPLATE_ID=<template id>
VITE_EMAILJS_PUBLIC_KEY=<public key>

# Upstash Redis (server-side — used by rate-check.js)
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>
```

---

## Common Issues & Solutions

### Functions 404 / "Functions Not Found"
**Cause:** Running `npm run dev` instead of `netlify dev`
**Fix:** Always use `netlify dev` — it serves functions on port 8888

### Steam Component Infinite Re-renders
**Cause:** Non-memoized arrays/objects passed to `useSteamData`
**Fix:** Wrap in `useMemo`:
```javascript
const endpoints = useMemo(() => ['profile', 'recent'], [])
```

### Environment Variables Not Found
**Fix:** Verify `.env` file exists in project root, then restart `netlify dev`
**Test:** `curl http://localhost:8888/.netlify/functions/steam-test`

### Multi-Version Dev — Netlify Site Linking
**Problem:** `netlify dev` in version folders (v1/, v8/) picks up wrong site config
**Fix:** Each version folder needs `.netlify/state.json` containing `{}`:
```bash
mkdir -p v8/.netlify && echo '{}' > v8/.netlify/state.json
```

---

## Build & Deploy

```bash
# Production build (runs Steam tests first)
npm run build

# Skip tests (faster)
npm run build:skip-tests

# Direct vite build
npx vite build
```

Build output: `dist/` (~312 KB JS gzipped to ~100 KB)

### Build Scripts
- `build` runs `test:steam` before `vite build` (pre-build safety check)
- `test:steam` runs `tests/steam-api/steam-api.test.js` against production URL
- `test:steam:dev` runs same tests against localhost

---

## Data Files

### src/data/status.json
Manually updated. Controls StatusCorner display on HomePage:
```json
{
  "reading": { "title": "...", "author": "...", "progress": 45 },
  "status": "Building LLM tools",
  "location": { "city": "Bellevue, WA", "timezone": "America/Los_Angeles" }
}
```

---

## Key Patterns

1. **Always use `netlify dev`** for local development
2. **Memoize hook arguments** — arrays and objects passed to custom hooks must be wrapped in `useMemo`
3. **`motion/react`** — import from `motion/react`, not `framer-motion`
4. **CSS custom properties** — use `var(--color-*)` for theming, not Tailwind color classes directly
5. **Module-level flags** — `hasPlayedIntro` in HomePage prevents re-animating on page revisit
6. **Reduced motion** — `MotionConfig reducedMotion="user"` handles globally; Navigation also uses `useReducedMotion` for spring jumps
7. **No unused dependencies** — project is lean (no Bootstrap, no Radix, no shadcn components, no Font Awesome)

---

## Migration History

**February 2026:** Replaced entire frontend with v8 "Architectural Minimalism" design.
- Removed: Bootstrap, Font Awesome, shadcn/ui, Radix UI, Animate UI, framer-motion, ThemeContext, layoutConfig, bento grid, scroll-based layout
- Added: Multi-page state architecture, gravity-shift navigation, weather integration, StatusCorner, per-letter hero animation, Motion library
- Preserved: All Netlify Functions, .env, tests, deployment config, dev scripts
