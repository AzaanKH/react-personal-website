import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { useDarkMode } from './hooks/useDarkMode'
import Navigation from './components/Navigation'
import DarkModeToggle from './components/DarkModeToggle'
import ErrorBoundary from './components/ErrorBoundary'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import InterestsPage from './pages/InterestsPage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { getPost } from './lib/posts'
import { getProject } from './data/projects'
import {
  applyMetadata,
  applyPageMetadata,
  getPostMetadata,
  getProjectMetadata,
  locationPath,
  parseLocation,
} from './lib/routes'

const pages = {
  home: HomePage,
  projects: ProjectsPage,
  interests: InterestsPage,
  blog: BlogPage,
  about: AboutPage,
  contact: ContactPage,
}

// `initialPath` is set only by the build-time prerender (entry-server.jsx), where there
// is no window; in the browser the route comes from the address bar.
export default function App({ initialPath }) {
  // { page, slug }: slug is set on /blog/<slug> (a post) and /projects/<slug> (an open card).
  const [route, setRoute] = useState(() => parseLocation(initialPath ?? window.location.pathname))
  const { page: activePage, slug } = route
  const postSlug = activePage === 'blog' ? slug : null
  const { theme, resolvedTheme, setTheme } = useDarkMode()

  const mainRef = useRef(null)
  // Only move focus after in-app navigation, never on the initial page load.
  const [hasNavigated, setHasNavigated] = useState(false)
  // Whether <main> has scrolled away from the top; fades the theme toggle on mobile.
  const [isScrolled, setIsScrolled] = useState(false)
  const isDark = resolvedTheme === 'dark'
  const PageComponent = postSlug ? BlogPostPage : pages[activePage]

  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const handleScroll = () => setIsScrolled(main.scrollTop > 24)
    main.addEventListener('scroll', handleScroll, { passive: true })
    return () => main.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const current = parseLocation(window.location.pathname)
    const canonicalPath = locationPath(current)

    if (window.location.pathname !== canonicalPath) {
      // Keep the hash: /interests#gaming scrolls to that section.
      window.history.replaceState(current, '', canonicalPath + window.location.hash)
    }
  }, [])

  useEffect(() => {
    const post = postSlug && getPost(postSlug)
    const project = activePage === 'projects' && slug && getProject(slug)
    if (post) applyMetadata(getPostMetadata(post))
    else if (project) applyMetadata(getProjectMetadata(project))
    else applyPageMetadata(activePage)
  }, [activePage, slug, postSlug])

  useEffect(() => {
    const handlePopState = () => {
      setHasNavigated(true)
      setRoute(parseLocation(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // `replace` swaps the URL without a history entry or a focus move: opening a project
  // card changes the address to /projects/<slug>, but the visitor hasn't left the page.
  const navigateToPage = useCallback((page, nextSlug = null, { replace = false } = {}) => {
    if (!pages[page] || (page === activePage && nextSlug === slug)) return

    const next = { page, slug: nextSlug }
    if (replace) {
      window.history.replaceState(next, '', locationPath(next))
    } else {
      window.history.pushState(next, '', locationPath(next))
      setHasNavigated(true)
    }
    setRoute(next)
  }, [activePage, slug])

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-dvh overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg)',
          transition: 'background-color 0.2s ease',
        }}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>

        {/* Grain texture overlay */}
        <div
          className="fixed inset-0 -z-10 grain-overlay"
          style={{
            opacity: isDark ? 0.03 : 0.02,
            transition: 'opacity 0.2s ease',
          }}
        />

        {/* Subtle accent gradient — top-right corner wash */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 60% 50% at 80% 10%, rgba(224, 122, 95, 0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 50% at 80% 10%, rgba(196, 93, 62, 0.05) 0%, transparent 70%)',
            transition: 'background 0.2s ease',
          }}
        />

        {/* Navigation is fixed-position, so it sits before <main> in the DOM to come
            first in keyboard order while still floating at the top/bottom visually. */}
        <Navigation activePage={activePage} onNavigate={navigateToPage} />

        {/* Dark Mode Toggle */}
        <DarkModeToggle
          theme={theme}
          setTheme={setTheme}
          isHome={activePage === 'home'}
          isScrolled={isScrolled}
        />

        {/* Page Content. <main> is the scroller (the shell is h-dvh and clipped), so the
            gutter is reserved here: short and long pages get the same width, and
            both-edges keeps content centred under the viewport-centred nav. */}
        <main
          ref={mainRef}
          id="main"
          tabIndex={-1}
          className="relative h-full overflow-y-auto pt-20 [scrollbar-gutter:stable_both-edges] focus:outline-none"
        >
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => {
            if (mainRef.current) mainRef.current.scrollTop = 0
          }}>
            <PageTransition key={postSlug ? `post:${postSlug}` : activePage} focusHeading={hasNavigated}>
              {/* Keyed by the transition's key (its parent), so a page that threw gets a
                  fresh start on the next navigation. */}
              <ErrorBoundary>
                <PageComponent onNavigate={navigateToPage} slug={slug} />
              </ErrorBoundary>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
