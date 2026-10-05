import { useEffect, useState } from 'react'
import { fetchSleeperSummary } from '../lib/sleeper'

// v3: lineups, game status; league name and URL removed. Bump when the summary shape changes.
const CACHE_KEY = 'sleeper_summary_v3'
export const SLEEPER_REFRESH_MS = 3 * 60 * 1000

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) ?? null
  } catch {
    return null
  }
}

function writeCache(summary) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(summary))
  } catch {
    // Storage full or unavailable: the card still renders, it just won't survive a reload.
  }
}

// Polls Sleeper every few minutes while the tab is visible (scores move during games).
// The last good result is kept in localStorage and stays on screen if Sleeper fails.
export function useSleeper() {
  const [summary, setSummary] = useState(readCache)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(() => readCache() === null)

  useEffect(() => {
    let controller = null

    const load = () => {
      controller?.abort()
      controller = new AbortController()
      const { signal } = controller

      fetchSleeperSummary({ signal })
        .then((next) => {
          if (signal.aborted) return
          setSummary(next)
          setError(null)
          if (next) writeCache(next)
        })
        .catch((reason) => {
          if (signal.aborted) return
          setError(reason?.message || 'Sleeper is unavailable right now.')
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false)
        })
    }

    const isStale = () => Date.now() - (readCache()?.fetchedAt ?? 0) >= SLEEPER_REFRESH_MS

    // A fresh cached result is already on screen (and `loading` started false).
    if (isStale()) load()

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load()
    }, SLEEPER_REFRESH_MS)

    // Coming back to a tab that was hidden past a refresh: catch up right away.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isStale()) load()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      controller?.abort()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return { summary, loading, error, lastUpdated: summary?.fetchedAt ?? null }
}
