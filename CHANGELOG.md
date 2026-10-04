# Changelog - React Portfolio Project

All notable changes and improvements to this project are documented in this file.

---

## [3.0.0] - 2026-10-04 - Security, tooling, and accessibility overhaul

### Security
- Steam proxy (`/api/steam`) now always uses the configured `STEAM_ID`, ignores `steamid`, clamps `count`, encodes parameters, times out upstream calls, and has a Netlify platform rate limit.
- Contact form now posts to a `/api/contact` function that validates and sends via Resend, behind Netlify's platform per-IP rate limit. Netlify Forms, `rate-check`, and Upstash were removed (the Upstash database no longer existed, and the old check let everything through when it failed), so the limit can't be bypassed.
- CI no longer writes Steam secrets to `.env.test` or lists that file for artifact upload (upload-artifact v4 skips dotfiles, so no leak was established), and it now needs no secrets at all.
- Production source maps are no longer published.

### Tooling
- Node 24 (Netlify, CI, `.nvmrc`); React 19.3; Vite 8 + `@vitejs/plugin-react` 6; ESLint React Compiler rules (`react-hooks` 7); lucide-react 1.x; motion 12.43.
- Removed unused `clsx`, `tailwind-merge`, `tailwindcss-animate`, `node-fetch`, `dotenv`, `http-proxy-middleware`, shadcn `components.json`.
- `npm audit`: 21 findings down to 5 (all dev-only, via Tailwind 3; 0 in production deps).
- `npm run build` is just `vite build`. Added `npm test` (Vitest, 88 tests), `npm run check`, and a separate `npm run test:live`.

### Fixes
- `netlify dev` no longer serves a blank page: SPA routes are now explicit instead of a `/*` rewrite that captured Vite's modules. Unknown URLs return a real 404.
- Steam "Refresh" really refetches: it sends a unique `refresh` param (part of Netlify's CDN cache key, answered `no-store`) instead of relying on `cache: 'reload'`, which only skips the browser cache. "Updated" comes from the server's `_metadata.timestamp`, so a CDN hit shows its true age. Partial failures are surfaced; requests abort on unmount; the profile cache was shortened from 30 min to 60 s.
- The Steam proxy's body parsing is inside its error handling: a non-JSON body or a timeout mid-body returns a JSON 502/504 instead of throwing.
- No light flash for dark-mode visitors on load.

### Accessibility & SEO
- Navigation uses real links; skip link; focus moves to the new page's `h1`; every page has an `h1`.
- Per-page `<title>`, description, canonical, and Open Graph/Twitter tags, prerendered at build time into `projects.html`, `gaming.html`, `contact.html` so crawlers that don't run JavaScript see them too.
- Contact drafts persist across page switches. Draft and send state live in a store outside the page, so a send that finishes after you navigate away clears the draft and shows "sent" on return, rather than offering the same message again.

### Content
- Prominent "View projects" link on Home.
- Project screenshot served as an optimized local WebP (176 KB → 11 KB) and lazy-loaded.
- Manifest gains 192px and maskable icons.

---

## [2.0.0] - 2025-01-11 - Major Refactoring & Optimization

### 🎯 Overview
Comprehensive code review, refactoring, and optimization phase. Reduced bundle size by ~500KB, improved performance, added error handling, and implemented caching.

---

### ✅ Added

#### **SEO & Meta Tags**
- Added comprehensive SEO meta tags to `index.html`
- Open Graph tags for better social media sharing
- Twitter Card tags for rich previews
- Canonical URL and theme color meta tags
- Keywords and description for better search engine visibility

#### **Global Error Boundary**
- Created `ErrorBoundary.jsx` component for graceful error handling
- Animated error UI with Framer Motion
- Development mode shows detailed error stack traces
- Production mode shows user-friendly error messages
- "Try Again" and "Go Home" recovery actions

#### **localStorage Caching System**
- Implemented `stale-while-revalidate` caching strategy for Steam data
- 5-minute TTL (Time To Live) for cache entries
- Instant load from cache while fetching fresh data in background
- Automatic cache expiration and cleanup
- Fallback to cached data if API fails
- New `usingCache` and `clearCache` exports from useSteamData hook

#### **Request Timeout**
- Added 10-second timeout for all Steam API requests
- AbortController implementation to prevent hanging requests
- Better error handling for timeout scenarios

#### **Environment Template**
- Created `.env.example` file with comprehensive setup instructions
- Detailed comments for each environment variable
- Security notes and best practices
- Setup steps for new developers

---

### 🗑️ Removed

#### **Unused Dependencies** (-484 packages, ~500KB bundle size reduction)
- `@emotion/react` (Material UI dependency)
- `@emotion/styled` (Material UI dependency)
- `@mui/icons-material` (replaced by lucide-react)
- `@mui/material` (not actively used)
- `react-bootstrap` (using shadcn/ui instead)
- `react-spring` (using framer-motion instead)

#### **Unused Component Files** (moved to `archive/unused-components/`)
- `About.jsx` (replaced by BentoAboutEnhanced.jsx)
- `ContactForm.jsx` (replaced by ContactFormShadcn.jsx)
- `ContactForm.css`
- `BentoAbout.jsx` (replaced by BentoAboutEnhanced.jsx)
- `BentoAboutShadcn.jsx` (not used)
- `Projects.jsx` (replaced by ProjectsShadcn.jsx)
- `HeaderShadcn.jsx` (not used)
- `NavbarShadcn.jsx` (not used)
- `SteamSection.jsx` (integrated into Bento card)
- `SteamStatsDashboard.jsx` (not currently used)

#### **Test Scripts** (moved to `archive/test-scripts/`)
- `debug-steam.js`
- `dev-proxy.js`
- `dev-with-tests.js`
- `quick-steam-test.js`
- `test-server.js`
- `test-steam-function.js`

#### **Self-Dependency**
- Removed `"my-portfolio": "file:"` from package.json

---

### 🔧 Fixed

#### **Debug Logging**
- Commented out production console.log in `SteamBentoCard.jsx`
- Can be uncommented for debugging when needed

#### **Package Structure**
- Fixed self-referencing dependency issue
- Cleaned up package.json structure

---

### 📚 Documentation

#### **New Files**
- `CODE_REVIEW.md` - Comprehensive code review findings and recommendations
- `.env.example` - Environment variables template
- `CHANGELOG.md` - This file

#### **Updated Files**
- `CLAUDE.md` - Expanded with complete project architecture
- `README.md` - Rewritten with comprehensive setup instructions
- Enhanced inline code comments across multiple files

---

### 📊 Performance Improvements

#### **Bundle Size**
- **Before:** ~950KB (with unused dependencies)
- **After:** ~450KB
- **Reduction:** 500KB (52.6% reduction)

#### **Load Time Improvements**
- Steam data now loads instantly from cache
- Background revalidation ensures fresh data
- Timeout prevents hanging requests
- Better error handling with fallbacks

#### **Code Quality**
- Removed 10 unused component files
- Removed 484 unused npm packages
- Better separation of concerns
- Improved error boundaries

---

### 🏗️ Architecture Changes

#### **Component Structure**
```
Before: 
- Multiple component variants (About, BentoAbout, BentoAboutShadcn, etc.)
- Scattered test scripts in root

After:
- Single active component per feature
- Unused files archived for reference
- Clean root directory
- Organized structure
```

#### **Caching Layer**
```
Before:
Steam API → React Component
(No caching, slow loads, no offline support)

After:
Steam API → localStorage Cache → React Component
(Instant loads, stale-while-revalidate, offline support)
```

#### **Error Handling**
```
Before:
- No global error boundary
- Errors could crash entire app

After:
- ErrorBoundary component catches all errors
- Graceful degradation
- User-friendly error messages
```

---

### 🔄 Migration Guide

#### **For Developers Working on This Project**

**1. Environment Setup:**
```bash
# Copy the new environment template
cp .env.example .env

# Fill in your actual API keys
# Then proceed with normal setup
npm install
```

**2. Removed Dependencies:**
If you were using any of these, they've been removed:
- Material UI → Use shadcn/ui components instead
- react-bootstrap → Use Tailwind CSS utilities
- react-spring → Use framer-motion for animations

**3. Component Changes:**
- Use `BentoAboutEnhanced.jsx` instead of `About.jsx`
- Use `ContactFormShadcn.jsx` instead of `ContactForm.jsx`
- Use `ProjectsShadcn.jsx` instead of `Projects.jsx`

**4. Steam Hook Updates:**
```javascript
// New cache-related exports available:
const { 
  steamData, 
  loading, 
  error,
  usingCache,    // NEW: boolean indicating if showing cached data
  clearCache     // NEW: function to clear all Steam cache
} = useSteamData(['profile', 'recent']);
```

---

### 🎯 Next Steps (Roadmap)

#### **High Priority**
- [ ] Add unit tests for hooks
- [ ] Implement service worker for PWA
- [ ] Add analytics tracking

#### **Medium Priority**
- [ ] Migrate to TypeScript gradually
- [ ] Add Lighthouse CI to deployment pipeline
- [ ] Implement image optimization (WebP)

#### **Low Priority**
- [ ] Add blog section
- [ ] Implement dark mode animations
- [ ] Add more Steam statistics

---

### 📝 Notes

**Breaking Changes:**
- None. All changes are backward compatible for end users.
- Developers should update their local environments with new .env.example template.

**Deprecations:**
- Unused component files are archived, not deleted
- Can be restored from `archive/` if needed

**Security:**
- No security vulnerabilities introduced
- Improved error handling reduces information leakage
- Environment variables properly documented

---

## [1.0.0] - 2024-08-XX - Initial Release

### ✅ Initial Features
- React 18 with Vite setup
- Steam API integration
- Dark/Light theme toggle
- Bento grid layout
- Contact form with EmailJS
- Netlify Functions for backend
- Responsive design
- Framer Motion animations

---

**Legend:**
- ✅ Added
- 🔧 Fixed
- 🗑️ Removed
- 📚 Documentation
- 🔄 Changed
- ⚠️ Deprecated
- 🔒 Security

