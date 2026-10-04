import { useState, useEffect } from 'react'

const CACHE_KEY = 'weather_cache'
const CACHE_TTL = 15 * 60 * 1000

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage may be unavailable or full; weather can still render without cache.
  }
}

export default function useWeather() {
  const [initialWeather] = useState(() => getCached())
  const [weather, setWeather] = useState(initialWeather)
  const [loading, setLoading] = useState(!initialWeather)

  useEffect(() => {
    if (initialWeather) return

    const controller = new AbortController()

    async function fetchWeather() {
      try {
        const res = await fetch('/.netlify/functions/weather', { signal: controller.signal })
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        setWeather(data)
        setCache(data)
      } catch {
        // Aborted on unmount, or unavailable: keep null and render without weather.
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchWeather()
    return () => controller.abort()
  }, [initialWeather])

  return weather ? { ...weather, loading } : { temp: null, condition: null, icon: null, text: null, loading }
}
