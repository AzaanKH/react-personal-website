# Azaan Khalfe - Portfolio Website

A minimal, animated portfolio built with React featuring multi-page state architecture, live Steam gaming integration, weather display, and dark mode. Designed around an "Architectural Minimalism" aesthetic — terracotta accent, bone/ink palette, Space Grotesk typography.

**Live:** [azaankhalfe.netlify.app](https://azaankhalfe.netlify.app)

## Features

- **Multi-page state architecture** — pages swap via `activePage` state with `AnimatePresence` transitions
- **Gravity-shift navigation** — nav bar sits at bottom on Home, springs to top on other pages
- **Steam integration** — recently played games with hi-res images and proportional playtime bars
- **Dark/Light/System theme** — three-way cycle with smooth transitions and localStorage persistence
- **Weather display** — live weather via Open-Meteo API on the home page
- **Contact form** — EmailJS with Upstash Redis rate limiting
- **Per-letter hero animation** — staggered letter-by-letter name reveal on first visit
- **Reduced motion support** — respects `prefers-reduced-motion` globally

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 with CSS custom properties |
| Animation | Motion 12 (`motion/react`) |
| Icons | Lucide React |
| Contact | EmailJS + Upstash Redis rate limiting |
| Steam API | Netlify Functions proxy |
| Weather | Netlify Function proxy (Open-Meteo) |
| Deployment | Netlify |

## Pages

- **Home** — hero with letter-by-letter name animation, social links, reading status, weather
- **Projects** — expandable accordion cards (DevEnv MCP Server, NFL Fantasy Picker, Distributed Paxos Consensus)
- **Gaming** — Steam recently played games with banner images and proportional playtime bars
- **Contact** — EmailJS form with rate limiting and animated button states

## Development

```bash
# Install dependencies
npm install

# Start dev server (ALWAYS use netlify dev, not npm run dev)
netlify dev
# Access at http://localhost:8888

# Build for production
npm run build
```

**Important:** `netlify dev` is required to serve Netlify Functions (Steam API, weather, rate limiting). Running `npm run dev` alone will not include serverless functions.

## Environment Variables

Create a `.env` file in the project root:

```env
# Steam (server-side)
STEAM_API_KEY=your_steam_api_key
STEAM_ID=your_steam_id

# EmailJS (client-side)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Upstash Redis (server-side)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

## Project Structure

```
my-portfolio/
├── src/
│   ├── App.jsx                    # Root — activePage state, page switching
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Tailwind + CSS custom properties (light/dark)
│   ├── components/
│   │   ├── Navigation.jsx         # Gravity-shift nav with spring physics
│   │   ├── DarkModeToggle.jsx     # System/light/dark cycle
│   │   ├── PageTransition.jsx     # Page enter/exit animations
│   │   └── StatusCorner.jsx       # Reading status + weather + time (Home only)
│   ├── pages/
│   │   ├── HomePage.jsx           # Hero animation, social links
│   │   ├── ProjectsPage.jsx       # Expandable project cards
│   │   ├── GamingPage.jsx         # Steam recently played with game images
│   │   └── ContactPage.jsx        # EmailJS form with rate limiting
│   ├── hooks/
│   │   ├── useSteamData.js        # Steam API fetching + localStorage cache
│   │   ├── useDarkMode.js         # Theme state persistence
│   │   └── useWeather.js          # Weather data fetching
│   ├── data/
│   │   └── status.json            # Reading status, location metadata
│   └── lib/
│       └── utils.js               # cn() utility
├── netlify/functions/
│   ├── steam-proxy.cjs            # Steam Web API proxy
│   ├── weather.js                 # Open-Meteo weather proxy
│   └── rate-check.js              # Upstash Redis rate limiter
├── public/
│   └── Azaan_Resume.pdf           # Resume
└── Configuration
    ├── netlify.toml, vite.config.js, tailwind.config.js, etc.
```

## Deployment

Deployed on Netlify. To deploy manually:

```bash
npm run build
netlify deploy --prod
```

## Author

**Azaan Khalfe**
- Portfolio: [azaankhalfe.netlify.app](https://azaankhalfe.netlify.app)
- LinkedIn: [Azaan Khalfe](https://www.linkedin.com/in/azaan-khalfe-43b90b221/)
- GitHub: [@AzaanKH](https://github.com/AzaanKH)
