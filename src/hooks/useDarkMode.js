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
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
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
