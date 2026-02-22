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
  } catch {}
}

export default function useWeather() {
  const [weather, setWeather] = useState(() => getCached())
  const [loading, setLoading] = useState(!getCached())

  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setWeather(cached)
      setLoading(false)
      return
    }

    let mounted = true

    async function fetchWeather() {
      try {
        const res = await fetch('/.netlify/functions/weather')
        if (!res.ok) throw new Error(res.statusText)
        const data = await res.json()
        if (mounted) {
          setWeather(data)
          setCache(data)
        }
      } catch {
        // keep existing cached data or null
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchWeather()
    return () => { mounted = false }
  }, [])

  return weather ? { ...weather, loading } : { temp: null, condition: null, icon: null, text: null, loading }
}
