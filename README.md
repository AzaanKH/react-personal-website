# Azaan Khalfe - Portfolio Website

A minimal, animated portfolio built with React featuring client-side routing, an Interests page with live Sleeper fantasy football and Steam data plus movie/show/anime/game poster shelves, weather display, and dark mode. Designed around an "Architectural Minimalism" aesthetic — terracotta accent, bone/ink palette, Space Grotesk typography.

**Live:** [azaankhalfe.netlify.app](https://azaankhalfe.netlify.app)

## Features

- **Client-side routing** — real URLs (`/projects`, `/interests`, `/contact`; `/gaming` redirects to `/interests#gaming`) with history support, per-page titles/canonical URLs, and focus moved to the new page heading
- **Gravity-shift navigation** — nav bar sits at bottom on Home, springs to top on other pages
- **Steam integration** — recently played games, "now playing" state, manual refresh, partial-failure reporting
- **Dark/Light/System theme** — three-way cycle, persisted, applied before first paint (no flash)
- **Weather display** — live weather via Open-Meteo on the home page
- **Contact form** — server-validated, rate-limited, delivered by email through Resend; drafts survive page switches
- **Accessibility** — skip link, real links for navigation, `prefers-reduced-motion` respected globally

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 with CSS custom properties |
| Animation | Motion 12 (`motion/react`) |
| Icons | Lucide React (+ inline GitHub/LinkedIn SVGs) |
| Contact | Netlify Function → Resend, Netlify platform rate limit |
| Steam API | Netlify Function proxy (`/api/steam`) |
| Weather | Netlify Function proxy (Open-Meteo) |
| Tests | Vitest + Testing Library (jsdom) |
| Runtime | Node 24 (Netlify and CI) |

## Development

```bash
npm install
netlify dev          # http://localhost:8888 — Vite + Netlify Functions + .env
```

Use `netlify dev` rather than `npm run dev`: plain Vite doesn't serve the functions (Steam, weather, contact).

```bash
npm run lint         # ESLint (includes React Compiler hook rules)
npm test             # deterministic unit/component tests, no network
npm run build        # vite build only
npm run check        # lint + test + build (what CI runs)
npm run test:live    # live smoke test of the deployed /api/steam
TEST_BASE_URL=http://localhost:8888 npm run test:live   # ...against netlify dev
```

## Environment Variables

Copy `.env.example` to `.env` for local development, and set the same values in Netlify (Site configuration → Environment variables). All of them are server-side only.

| Variable | Used by | Notes |
|----------|---------|-------|
| `STEAM_API_KEY` | `steam-proxy` | [Get a key](https://steamcommunity.com/dev/apikey) |
| `STEAM_ID` | `steam-proxy` | Your 64-bit Steam ID. The proxy only ever serves this account. |
| `RESEND_API_KEY` | `contact` | [Resend](https://resend.com) API key |
| `CONTACT_TO_EMAIL` | `contact` | Where messages are delivered |
| `CONTACT_FROM_EMAIL` | `contact` | Sender, e.g. `Portfolio <contact@yourdomain.com>` (a domain verified in Resend; `onboarding@resend.dev` works for testing but only delivers to your Resend account email) |

If the Resend variables are missing, the contact endpoint returns 503 and the form tells visitors to email directly.

## API endpoints (Netlify Functions)

| Path | Function | Notes |
|------|----------|-------|
| `GET /api/steam?endpoint=profile\|recent\|games\|level` | `netlify/functions/steam-proxy.js` | Ignores any caller-supplied Steam ID, clamps `count`, 8s upstream timeout. Platform rate limit: 60/min per IP. |
| `POST /api/contact` | `netlify/functions/contact.js` | JSON `{ name, email, message }`. Validates (shared rules in `src/lib/contactValidation.js`), then sends via Resend. Netlify platform rate limit: 5 per 3 min per IP, enforced before the function runs. |
| `GET /.netlify/functions/weather` | `netlify/functions/weather.js` | Open-Meteo, 15 min cache. |
| `GET /api/nfl-players` | `netlify/functions/nfl-players.js` | Trimmed Sleeper player list for the fantasy lineups, cached for a day at the CDN. |

Request handling lives in `netlify/lib/` so it can be unit-tested without the Netlify runtime.

## Project Structure

```
my-portfolio/
├── src/
│   ├── App.jsx                    # Root: routing state, metadata, skip link, error boundary
│   ├── main.jsx                   # Browser entry
│   ├── entry-server.jsx           # Build-time entry: renders a path to HTML for the prerender
│   ├── components/                # Navigation, RouteLink, ErrorBoundary, StatusCorner, ...
│   │   ├── blog/                  # MDX elements, figures, interactive post components
│   │   ├── interests/             # Fantasy, gaming, and poster shelf sections
│   │   └── projects/              # Architecture flow, notch demo
│   ├── pages/                     # Home, Projects, Interests, Blog, BlogPost, About, Contact
│   ├── posts/                     # Blog posts (<slug>.mdx)
│   ├── hooks/                     # useSteamData, useSleeper, useDarkMode, useWeather
│   ├── lib/
│   │   ├── routes.js              # Route table, path parsing, per-page metadata and JSON-LD
│   │   ├── posts.js, postMeta.js  # Post list and frontmatter validation
│   │   └── contactValidation.js   # Shared by the form and the contact function
│   └── data/
│       ├── projects.js            # Project cards and case studies (slug = /projects/<slug>)
│       ├── interests.json         # Movies, shows, anime, games (npm run add)
│       └── status.json            # Reading status / location (edited by hand)
├── vite/blogPosts.js              # Post list plugin (keeps drafts out of builds)
├── vite.config.js                 # Also prerenders every page, writes sitemap.xml and rss.xml
├── netlify/
│   ├── functions/                 # contact.js, steam-proxy.js, weather.js, nfl-players.js
│   └── lib/                       # contact.js, steam.js, nflPlayers.js (testable handlers)
├── tests/
│   ├── unit/                      # Vitest suites (npm test)
│   └── live/                      # Network smoke test (npm run test:live)
├── public/                        # Icons, OG image, résumé, robots.txt, 404.html, project screenshots
└── netlify.toml                   # Build, Node 24, explicit SPA routes, security headers, asset caching
```

The build writes real HTML for every page, post, and project (`dist/<page>.html`, `dist/blog/<slug>.html`, `dist/projects/<slug>.html`), plus `sitemap.xml`, `rss.xml`, and a share image per post (`dist/og/blog/<slug>.png`), so crawlers and link previews work without JavaScript. `netlify.toml` sets a Content-Security-Policy; the build fails if an inline script isn't covered by it.

SPA routes are listed explicitly in `netlify.toml` instead of a `/*` catch-all. Under `netlify dev` a catch-all also rewrote Vite's in-memory modules to HTML, which blanked the page. Unknown paths get `public/404.html` with a real 404 status. When adding a page, update both `src/lib/routes.js` and `netlify.toml`.

## Deployment

Netlify builds `main` with `npm run build`. GitHub Actions runs `npm run check` on every push and PR (`.github/workflows/ci.yml`), and a weekly/manual live check of the deployed Steam endpoint (`live-steam-check.yml`). Neither workflow needs secrets.

## Author

**Azaan Khalfe**
- Portfolio: [azaankhalfe.netlify.app](https://azaankhalfe.netlify.app)
- LinkedIn: [Azaan Khalfe](https://www.linkedin.com/in/azaan-khalfe-43b90b221/)
- GitHub: [@AzaanKH](https://github.com/AzaanKH)
