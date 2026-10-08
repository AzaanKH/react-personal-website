import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

// Keep in sync with the inline theme script in index.html, which applies
// the class before first paint to avoid a light flash for dark-mode visitors.
export const STORAGE_KEY = 'v8-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const THEMES = ['system', 'light', 'dark']

function subscribeToSystemTheme(callback) {
  const mql = window.matchMedia(DARK_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSystemTheme() {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function useDarkMode() {
  const [theme, setThemeState] = useState(readStoredTheme)
  const systemTheme = useSyncExternalStore(subscribeToSystemTheme, getSystemTheme)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    // The `.dark` class also sets `color-scheme` (index.css), so native scrollbars and
    // form controls follow. The theme-color metas in index.html only follow the system
    // preference via `media`, so point both at the resolved theme's background.
    const background = getComputedStyle(root).getPropertyValue('--color-bg').trim()
    if (!background) return
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute('content', background)
    }
  }, [resolvedTheme])

  const setTheme = useCallback((value) => {
    if (!THEMES.includes(value)) return
    setThemeState(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Private browsing or full storage: the theme still applies for this visit.
    }
  }, [])

  return { theme, resolvedTheme, setTheme }
}
