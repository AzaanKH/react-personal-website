import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'v8-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useDarkMode() {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    return 'system'
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return getSystemTheme()
  })

  // Apply resolved theme to DOM
  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Resolve theme + listen for system changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)

    if (theme !== 'system') {
      setResolvedTheme(theme)
      return
    }

    // System mode: resolve now and listen for changes
    setResolvedTheme(getSystemTheme())

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setResolvedTheme(e.matches ? 'dark' : 'light')
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((value) => {
    setThemeState(value)
  }, [])

  return { theme, resolvedTheme, setTheme }
}
