import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { useDarkMode } from './hooks/useDarkMode'
import Navigation from './components/Navigation'
import DarkModeToggle from './components/DarkModeToggle'
import PageTransition from './components/PageTransition'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import GamingPage from './pages/GamingPage'
import ContactPage from './pages/ContactPage'

const pages = {
  home: HomePage,
  projects: ProjectsPage,
  gaming: GamingPage,
  contact: ContactPage,
}

const pagePaths = {
  home: '/',
  projects: '/projects',
  gaming: '/gaming',
  contact: '/contact',
}

function getPageFromPath(pathname) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const match = Object.entries(pagePaths).find(([, path]) => path === normalizedPath)

  return match ? match[0] : 'home'
}

export default function App() {
  const [activePage, setActivePage] = useState(() => getPageFromPath(window.location.pathname))
  const { theme, resolvedTheme, setTheme } = useDarkMode()

  const mainRef = useRef(null)
  const isDark = resolvedTheme === 'dark'
  const PageComponent = pages[activePage]

  useEffect(() => {
    const currentPage = getPageFromPath(window.location.pathname)
    const canonicalPath = pagePaths[currentPage]

    if (window.location.pathname !== canonicalPath) {
      window.history.replaceState({ page: currentPage }, '', canonicalPath)
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToPage = useCallback((page) => {
    if (!pages[page] || page === activePage) return

    const path = pagePaths[page]
    window.history.pushState({ page }, '', path)
    setActivePage(page)
  }, [activePage])

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative h-screen overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg)',
          transition: 'background-color 0.6s ease',
        }}
      >
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

        {/* Dark Mode Toggle */}
        <DarkModeToggle theme={theme} setTheme={setTheme} isHome={activePage === 'home'} />

        {/* Page Content */}
        <main ref={mainRef} className="relative h-full overflow-y-auto pt-20">
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => {
            if (mainRef.current) mainRef.current.scrollTop = 0
          }}>
            <PageTransition key={activePage}>
              <PageComponent onNavigate={navigateToPage} />
            </PageTransition>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <Navigation activePage={activePage} onNavigate={navigateToPage} />
      </div>
    </MotionConfig>
  )
}
