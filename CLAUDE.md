# Claude AI Memory - React Portfolio Project

## 📋 Complete Project Documentation & Code Review

This document contains comprehensive knowledge about the React portfolio website, including architecture, Steam API integration, code review findings, and maintenance guidelines.

---

## 📁 File Structure

```
src/
├── hooks/
│   └── useSteamData.js          # Main Steam data hook
├── components/
│   └── SteamBentoCard.jsx       # Steam profile display component
└── config/
    └── layoutConfig.js          # Layout configuration

netlify/functions/
├── steam-proxy.cjs              # Steam API proxy function
└── steam-test.cjs               # Environment testing function

public/
└── steam-direct-test.html       # Direct API testing page
```

---

## 🔧 Steam API Integration Components

### 1. **Steam Proxy Function** (`netlify/functions/steam-proxy.cjs`)
- **Purpose**: Securely proxy Steam Web API requests
- **Endpoints**: `profile`, `recent`, `games`, `level`
- **Environment Variables**: `STEAM_API_KEY`, `STEAM_ID`
- **CORS**: Configured for development (`*`) and production (specific domain)

### 2. **Steam Data Hook** (`src/hooks/useSteamData.js`)
- **Purpose**: Fetch and manage Steam data state
- **Key Features**: Automatic error handling, data caching, loading states
- **Critical**: Uses stable useEffect to prevent infinite re-renders

### 3. **Steam Bento Card** (`src/components/SteamBentoCard.jsx`)
- **Purpose**: Display Steam profile and recent games
- **Features**: Game cycling, loading states, error fallbacks
- **Layout**: Part of the Enhanced Bento Grid system

---

## 🚨 Common Issues & Solutions

### **Issue 1: "Functions Not Found" / 404 Errors**

**Symptoms:**
- Network errors when fetching `/.netlify/functions/steam-proxy`
- Steam component shows error state

**Root Cause:**
- Netlify functions only available on port 8888 (Netlify dev)
- React app trying to access functions from port 3000 (Vite dev)

**Solution:**
```javascript
// vite.config.js - Proxy configuration
server: {
  proxy: {
    '/.netlify/functions': {
      target: 'http://localhost:8888',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Prevention:**
- Always use `netlify dev` instead of `npm run dev` directly
- Verify proxy configuration in vite.config.js
- Test functions directly at `http://localhost:8888/steam-direct-test.html`

---

### **Issue 2: Component Flickering / Infinite Re-renders**

**Symptoms:**
- Steam component constantly switching between loading/error/success states
- Console logs showing repeated API calls
- Poor user experience with flashing content

**Root Causes:**
1. **useCallback Dependencies**: Function recreation causing infinite loops
2. **Non-memoized Props**: New objects/arrays passed to hooks on every render
3. **Unstable useEffect Dependencies**: Dependencies changing on every render

**Solutions:**

1. **Avoid useCallback for fetch functions in hooks:**
```javascript
// ❌ BAD - Creates infinite loops
const fetchSteamData = useCallback(async () => {
  // fetch logic
}, [endpoints]); // endpoints array changes every render

// ✅ GOOD - Inline in useEffect
useEffect(() => {
  const doFetch = async () => {
    // fetch logic here
  };
  doFetch();
}, [endpoints.join(',')]); // Stable string dependency
```

2. **Memoize props in components:**
```javascript
// ❌ BAD - New objects every render
const steamData = useSteamData(['profile', 'recent'], { autoRefresh: false });

// ✅ GOOD - Memoized props
const steamEndpoints = useMemo(() => ['profile', 'recent'], []);
const steamOptions = useMemo(() => ({ autoRefresh: false }), []);
const steamData = useSteamData(steamEndpoints, steamOptions);
```

3. **Use mounted flags for cleanup:**
```javascript
useEffect(() => {
  let mounted = true;
  
  const fetchData = async () => {
    // ... fetch logic ...
    if (!mounted) return; // Prevent state updates after unmount
    setSomeState(data);
  };
  
  return () => { mounted = false; };
}, []);
```

---

### **Issue 3: Environment Variables Not Found**

**Symptoms:**
- "Steam API key not configured" errors
- Environment test function shows `hasApiKey: false`

**Root Cause:**
- Missing `.env` file
- Incorrect environment variable names
- Netlify dev not loading environment variables

**Solution:**
1. **Create `.env` file in project root:**
```env
STEAM_API_KEY=your_actual_steam_api_key_here
STEAM_ID=your_actual_steam_id_here
```

2. **Verify with test function:**
- Visit `http://localhost:8888/steam-direct-test.html`
- Click "Test Environment" to verify variables are loaded

**Prevention:**
- Always test environment variables before debugging other issues
- Use steam-test.cjs function to verify API key presence
- Never commit actual API keys to repository

---

### **Issue 4: CORS Errors**

**Symptoms:**
- "Access-Control-Allow-Origin" errors in console
- Steam API requests blocked by browser

**Root Cause:**
- Overly restrictive CORS configuration
- Wrong origin settings for development

**Solution:**
```javascript
// netlify/functions/steam-proxy.cjs
const headers = {
  'Access-Control-Allow-Origin': process.env.NETLIFY && process.env.CONTEXT === 'production'
    ? 'https://azaankhalfe.netlify.app' 
    : '*', // Allow all origins in development
};
```

---

## 🧪 Testing & Debugging

### **1. Direct API Testing**
- **URL**: `http://localhost:8888/steam-direct-test.html`
- **Purpose**: Test Steam functions without React
- **Use When**: First step in troubleshooting any Steam issues

### **2. Environment Testing**
```javascript
// Browser console test
fetch('/.netlify/functions/steam-test')
  .then(r => r.json())
  .then(console.log);
```

### **3. React Component Debug**
- Enable debug logging in `SteamBentoCard.jsx`
- Check console for state changes and re-render patterns
- Monitor network tab for API call frequency

---

## ⚡ Performance Optimizations

### **1. Stable Dependencies**
- Use `useMemo` for static arrays/objects
- Use `endpoints.join(',')` instead of array dependencies
- Avoid functions in useEffect dependencies

### **2. Error Handling**
- Preserve previous data on errors
- Clear errors when new data loads successfully
- Graceful degradation for missing data

### **3. Loading States**
- Show specific loading messages
- Prevent multiple simultaneous requests
- Use mounted flags to prevent memory leaks

---

## 🔒 Security Best Practices

### **1. Environment Variables**
- Never expose `STEAM_API_KEY` to client-side code
- Use Netlify Functions as proxy to hide sensitive data
- Restrict CORS origins in production

### **2. API Rate Limiting**
- Avoid excessive API calls through stable hooks
- Implement reasonable refresh intervals
- Cache responses when possible

### **3. Error Information**
- Don't expose sensitive error details to users
- Log detailed errors server-side only
- Provide helpful user-facing error messages

---

## 🚀 Deployment Checklist

### **Pre-Deployment**
1. ✅ Test Steam integration on `http://localhost:8888`
2. ✅ Verify environment variables are set
3. ✅ Run direct API tests
4. ✅ Check for console errors or warnings
5. ✅ Verify no infinite re-renders

### **Post-Deployment**
1. ✅ Test Steam component on production site
2. ✅ Verify CORS configuration works
3. ✅ Check Netlify function logs for errors
4. ✅ Monitor for any performance issues

---

## 📝 Key Implementation Details

### **Current Configuration**
- **Layout**: HYBRID mode with Enhanced Bento Grid
- **Steam Component**: `BentoAboutEnhanced` includes `SteamBentoCard`
- **Data Endpoints**: Profile + Recent Games
- **Update Frequency**: On-demand (no auto-refresh)
- **Game Cycling**: 4-second intervals for recent games

### **Dependencies**
```json
{
  "@emailjs/browser": "^4.4.1",
  "framer-motion": "^11.18.2"
}
```

### **Environment Variables Required**
```env
STEAM_API_KEY=<Steam Web API Key>
STEAM_ID=<Your Steam ID>
```

---

## 🔮 Future Improvements

### **Potential Enhancements**
1. **Caching**: Implement localStorage caching for Steam data
2. **Offline Mode**: Show cached data when API is unavailable
3. **More Endpoints**: Add achievements, game stats, friends
4. **Real-time**: WebSocket connection for live status updates
5. **Performance**: Implement request deduplication

### **Monitoring**
1. **Error Tracking**: Add error reporting for production issues
2. **Performance Metrics**: Monitor API response times
3. **Usage Analytics**: Track Steam component engagement

---

## 💡 Remember for Future Development

1. **Always test locally first** using `netlify dev`
2. **Use the direct test page** for quick API validation
3. **Memoize props** when passing to custom hooks
4. **Avoid useCallback** for functions with changing dependencies
5. **Test environment variables** before debugging React issues
6. **Check CORS settings** if API calls fail mysteriously
7. **Monitor console** for infinite re-render patterns

---

---

## 🏗️ PROJECT ARCHITECTURE OVERVIEW

### **Tech Stack**

**Frontend Framework:**
- React 18.3.1 with modern hooks and concurrent features
- Vite 5.4.10 for fast development and optimized builds
- React Router not used (single-page portfolio)

**UI Libraries & Styling:**
- Tailwind CSS 3.4.17 (utility-first CSS framework)
- shadcn/ui components (Radix UI primitives)
- Bootstrap 5.3.3 (legacy, primarily for grid system)
- Material UI 6.1.7 (@mui/material) - minimal usage
- Framer Motion 11.18.2 (animations and transitions)
- Lucide React (icon system for shadcn components)
- Font Awesome 6.6.0 (legacy icons)

**State Management & Data:**
- React Context API (ThemeContext for dark mode)
- Custom hooks pattern (useSteamData)
- EmailJS 4.4.1 (contact form)
- Upstash Redis + Rate Limiting (contact form protection)

**Build & Development:**
- ESLint 9.13.0 with React plugins
- PostCSS + Autoprefixer
- Dotenv for environment variables
- Netlify Functions for serverless backend

**Deployment:**
- Netlify (hosting + serverless functions)
- Custom domain: azaankhalfe.netlify.app

---

## 📁 PROJECT STRUCTURE

```
my-portfolio/
├── public/
│   ├── steam-direct-test.html          # Steam API testing page
│   ├── steam-test.html                 # Additional Steam tests
│   ├── debug-steam.html                # Steam debugging tools
│   ├── test-react-steam.html           # React Steam integration test
│   └── khalfe_azaan_resume_24.pdf      # Resume PDF
│
├── src/
│   ├── components/                     # React components
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── alert.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   └── textarea.jsx
│   │   │
│   │   ├── About.jsx                   # Traditional about section
│   │   ├── AdaptiveLayout.jsx          # Layout switcher component
│   │   ├── BentoAbout.jsx              # Basic bento grid
│   │   ├── BentoAboutEnhanced.jsx      # Enhanced bento grid (ACTIVE)
│   │   ├── BentoAboutShadcn.jsx        # shadcn-styled bento
│   │   ├── ContactForm.jsx             # Legacy contact form
│   │   ├── ContactFormShadcn.jsx       # Active shadcn contact form
│   │   ├── CursorFollower.jsx          # Custom cursor effect
│   │   ├── Header.jsx                  # Main header component
│   │   ├── HeaderShadcn.jsx            # shadcn header variant
│   │   ├── Navbar.jsx                  # Navigation bar
│   │   ├── NavbarShadcn.jsx            # shadcn navbar variant
│   │   ├── ProjectCard.jsx             # Individual project card
│   │   ├── Projects.jsx                # Projects section (legacy)
│   │   ├── ProjectsShadcn.jsx          # Active projects display
│   │   ├── Resume.jsx                  # Resume component
│   │   ├── ScrollProgressBar.jsx       # Scroll indicator
│   │   ├── SteamBentoCard.jsx          # Steam profile card
│   │   ├── SteamSection.jsx            # Standalone Steam section
│   │   └── SteamStatsDashboard.jsx     # Detailed Steam stats
│   │
│   ├── config/
│   │   └── layoutConfig.js             # Layout configuration system
│   │
│   ├── context/
│   │   └── ThemeContext.jsx            # Dark mode context provider
│   │
│   ├── hooks/
│   │   └── useSteamData.js             # Steam API data hook
│   │
│   ├── lib/
│   │   └── utils.js                    # Utility functions (Tailwind merge)
│   │
│   ├── App.css                         # Legacy app styles
│   ├── App.jsx                         # Main application component
│   ├── framer-animations.css           # Framer Motion styles
│   ├── index.css                       # Global styles (Tailwind + custom)
│   └── main.jsx                        # React entry point
│
├── netlify/functions/                  # Serverless functions
│   ├── steam-proxy.cjs                 # Steam API proxy (ACTIVE)
│   ├── steam-test.cjs                  # Environment testing
│   ├── rate-check.js                   # Rate limiting function
│   ├── debug.cjs                       # Debug utilities
│   ├── hello.cjs                       # Test function
│   └── test-endpoint.cjs               # Endpoint testing
│
├── Configuration Files
│   ├── .env                            # Environment variables (not in repo)
│   ├── eslint.config.js                # ESLint configuration
│   ├── index.html                      # HTML entry point
│   ├── package.json                    # Dependencies and scripts
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # Tailwind configuration
│   └── vite.config.js                  # Vite build configuration
│
├── Documentation
│   ├── CLAUDE.md                       # This file
│   ├── README.md                       # Project readme
│   └── STEAM_SETUP.md                  # Steam setup guide
│
└── Test/Debug Scripts
    ├── debug-steam.js
    ├── dev-proxy.js
    ├── dev-with-tests.js
    ├── quick-steam-test.js
    ├── test-server.js
    └── test-steam-function.js
```

---

## 🎨 DESIGN SYSTEM & STYLING APPROACH

### **Theme Architecture**

The application uses a sophisticated multi-layered theming system:

**1. CSS Custom Properties (CSS Variables)**
- Base layer: Tailwind/shadcn design tokens (HSL format)
- Bootstrap layer: Legacy Bootstrap theme variables
- Custom layer: Portfolio-specific color schemes

**2. Dark Mode Implementation**
- Context-based: `ThemeContext.jsx` provides global dark mode state
- Toggle mechanism: Navbar theme switcher with smooth transitions
- Persistence: `localStorage` saves user preference
- Fallback: Respects system `prefers-color-scheme` preference

**3. Color System**
```css
/* Light Mode */
--background: 0 0% 100%              /* Pure white */
--foreground: 222.2 84% 4.9%         /* Near black */
--primary: 221.2 83.2% 53.3%         /* Blue (#3b82f6) */
--card: 0 0% 100%                    /* White cards */

/* Dark Mode */
--background: 222.2 84% 4.9%         /* Dark navy */
--foreground: 210 40% 98%            /* Off-white */
--primary: 217.2 91.2% 59.8%         /* Lighter blue */
--card: 222.2 84% 4.9%               /* Dark cards */
```

**4. Animation System**
- Framer Motion for component animations
- CSS transitions for theme switching (0.3s ease)
- Custom keyframe animations for special effects
- Spring physics for natural motion

### **Responsive Design Strategy**

**Breakpoints:**
- Mobile: < 768px (single column layout)
- Tablet: 768px - 992px (2 column bento grid)
- Desktop: > 992px (3 column bento grid)

**Grid System:**
- CSS Grid for bento layout (responsive template areas)
- Bootstrap grid for legacy sections
- Tailwind utilities for modern components

---

## ⚙️ LAYOUT CONFIGURATION SYSTEM

### **Adaptive Layout Modes**

The portfolio uses a flexible layout system (src/config/layoutConfig.js):

**Available Layouts:**
1. **TRADITIONAL**: Classic portfolio with paragraph sections
2. **BENTO**: Full bento grid design for all sections
3. **HYBRID**: Bento for About, traditional cards for Projects (ACTIVE)

**Switching Layouts:**
```javascript
// In layoutConfig.js
layoutConfig.currentLayout = LAYOUT_TYPES.HYBRID;

// Programmatically
import { switchLayout } from '../config/layoutConfig';
switchLayout('bento'); // Changes to bento layout
```

**Current Configuration (HYBRID):**
- About Section: Enhanced Bento Grid (`BentoAboutEnhanced.jsx`)
- Projects Section: Traditional Cards (`ProjectsShadcn.jsx`)
- Animations: Enabled (stagger delay: 0.1s, duration: 0.6s)

---

## 🧩 COMPONENT ARCHITECTURE

### **Core Components**

**App.jsx** - Main application container
- Manages layout state and re-rendering
- Implements header animation sequence
- Lazy loading and suspense boundaries
- Framer Motion LayoutGroup for smooth transitions

**AdaptiveLayout.jsx** - Layout orchestrator
- Renders components based on `layoutConfig`
- Handles layout switching with animations
- Provides `LayoutSwitcher` utility for testing

**BentoAboutEnhanced.jsx** - Primary about section
- 6 bento cards: Bio, Skills, Gaming, Reading, Goals, Connect
- Advanced Framer Motion animations per card
- Integrated contact form trigger
- Responsive grid with custom breakpoints
- Progress tracking (reading progress: 15%)

**Key Features:**
- Hover animations with 3D transforms
- Floating icon animations
- Card-specific animation variants
- Gradient overlays and shimmer effects

**ProjectsShadcn.jsx** - Projects showcase
- 3 featured projects with rich metadata
- Dynamic icons from Lucide React
- Animated tags and hover effects
- GitHub links where available
- Academic project badges

**SteamBentoCard.jsx** - Steam gaming profile
- Real-time Steam data integration
- Game cycling carousel (4-second intervals)
- Avatar with online status indicator
- Fallback for missing data
- Error state with static fallback content

**ContactFormShadcn.jsx** - Contact modal
- shadcn Dialog component
- EmailJS integration
- Rate limiting via Netlify function
- Form validation and error handling
- Success/error animations

**Navbar.jsx** - Navigation bar
- Sticky positioning with blur backdrop
- Smooth scroll to sections
- Theme toggle with icon rotation
- Staggered item animations
- Mobile-responsive collapse menu

**ThemeContext.jsx** - Theme provider
- Dark mode state management
- localStorage persistence
- System preference detection
- Transition coordination
- Dynamic style injection

### **UI Components (shadcn/ui)**

All in `src/components/ui/`:
- **alert.jsx**: Alert messages with variants
- **badge.jsx**: Tag/label components
- **button.jsx**: Button with variants (default, outline, ghost, etc.)
- **card.jsx**: Card container with header/content/footer
- **dialog.jsx**: Modal dialog (Radix UI Dialog)
- **input.jsx**: Form input with focus states
- **label.jsx**: Form labels
- **textarea.jsx**: Multi-line text input

Built on **Radix UI primitives** for accessibility.

---

## 🔌 CUSTOM HOOKS

### **useSteamData Hook** (src/hooks/useSteamData.js)

**Purpose**: Fetch and manage Steam Web API data

**API:**
```javascript
const {
  steamData,        // { profile, recentGames, gameLibrary, level }
  loading,          // Boolean loading state
  error,            // Error message or null
  hasProfile,       // Boolean: profile data exists
  hasRecentGames,   // Boolean: recent games exist
  hasGameLibrary,   // Boolean: game library exists
  getStats,         // Function: calculate gaming statistics
  formatPlaytime,   // Function: format minutes to readable string
  isOnline,         // Function: check if user is online
  getCurrentGame,   // Function: get most recent game
  refetch          // Function: manually trigger re-fetch
} = useSteamData(['profile', 'recent'], options);
```

**Endpoints:**
- `'profile'`: Player profile summary
- `'recent'`: Recently played games
- `'games'`: Full game library
- `'level'`: Steam level

**Options:**
```javascript
{
  enableDebug: false,    // Log debug info to console
  autoRefresh: false     // Auto-refresh disabled (prevents issues)
}
```

**Key Features:**
- Stable dependencies (avoids infinite loops)
- Mounted flag prevents memory leaks
- Error state preservation
- Endpoint string join for stability
- Memoized helper functions

**Best Practices:**
```javascript
// ✅ Correct: Memoize props
const endpoints = useMemo(() => ['profile', 'recent'], []);
const options = useMemo(() => ({ autoRefresh: false }), []);
const steamData = useSteamData(endpoints, options);

// ❌ Wrong: New objects every render
const steamData = useSteamData(['profile', 'recent'], { autoRefresh: false });
```

---

## 🎮 Steam Integration Architecture & Troubleshooting Guide

This section contains critical knowledge for maintaining and troubleshooting the Steam API integration.