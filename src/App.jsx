import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { useDarkMode } from './hooks/useDarkMode'
import Navigation from './components/Navigation'
import DarkModeToggle from './components/DarkModeToggle'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import InterestsPage from './pages/InterestsPage'
import ContactPage from './pages/ContactPage'
import { applyPageMetadata, getPageFromPath, routes } from './lib/routes'

const pages = {
  home: HomePage,
  projects: ProjectsPage,
  interests: InterestsPage,
  contact: ContactPage,
}

export default function App() {
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname))
  const { theme, resolvedTheme, setTheme } = useDarkMode()

  const mainRef = useRef(null)
  // Only move focus after in-app navigation, never on the initial page load.
  const [hasNavigated, setHasNavigated] = useState(false)
  // Whether <main> has scrolled away from the top; fades the theme toggle on mobile.
  const [isScrolled, setIsScrolled] = useState(false)
  const isDark = resolvedTheme === 'dark'
  const PageComponent = pages[activePage]

  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const handleScroll = () => setIsScrolled(main.scrollTop > 24)
    main.addEventListener('scroll', handleScroll, { passive: true })
    return () => main.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const currentPage = getPageFromPath(window.location.pathname)
    const canonicalPath = routes[currentPage].path

    if (window.location.pathname !== canonicalPath) {
      // Keep the hash: /interests#gaming scrolls to that section.
      window.history.replaceState({ page: currentPage }, '', canonicalPath + window.location.hash)
    }
  }, [])

  useEffect(() => {
    applyPageMetadata(activePage)
  }, [activePage])

  useEffect(() => {
    const handlePopState = () => {
      setHasNavigated(true)
      setActivePage(getPageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToPage = useCallback((page) => {
    if (!pages[page] || page === activePage) return

    window.history.pushState({ page }, '', routes[page].path)
    setHasNavigated(true)
    setActivePage(page)
  }, [activePage])

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-dvh overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg)',
          transition: 'background-color 0.6s ease',
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
            transition: 'opacity 0.6s ease',
          }}
        />

        {/* Subtle accent gradient — top-right corner wash */}
        <div
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse 60% 50% at 80% 10%, rgba(224, 122, 95, 0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 50% at 80% 10%, rgba(196, 93, 62, 0.05) 0%, transparent 70%)',
            transition: 'background 0.6s ease',
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
            <PageTransition key={activePage} focusHeading={hasNavigated}>
              <PageComponent onNavigate={navigateToPage} />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
