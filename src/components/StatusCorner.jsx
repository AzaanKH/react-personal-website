import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import {
  BookOpen,
  Circle,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
} from 'lucide-react'
import status from '../data/status.json'
import useWeather from '../hooks/useWeather'

function useLocalTime(timezone) {
  const format = () =>
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    })

  const [time, setTime] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30_000)
    return () => clearInterval(id)
  }, [timezone])

  return time
}

const weatherIconMap = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
  Snow: Snowflake,
  Thunderstorm: CloudLightning,
  Mist: CloudFog,
  Fog: CloudFog,
  Haze: CloudFog,
  Smoke: CloudFog,
  Dust: CloudFog,
  Sand: CloudFog,
  Ash: CloudFog,
  Squall: CloudFog,
  Tornado: CloudFog,
}

export default function StatusCorner({ enterDelay = 1.6, animate: shouldAnimate = true }) {
  const time = useLocalTime(status.location.timezone)
  const { temp, condition } = useWeather()

  const WeatherIcon = condition ? (weatherIconMap[condition] || MapPin) : MapPin

  const locationParts = [status.location.city]
  if (temp != null) locationParts.push(`${temp}°F`)
  locationParts.push(time)
  const locationLine = locationParts.join(' · ')

  const transition = shouldAnimate ? {
    delay: enterDelay,
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1],
  } : { duration: 0 }

  const initialState = shouldAnimate ? { opacity: 0, y: 12 } : false

  return (
    <>
      {/* Book info — bottom left */}
      <motion.div
        className="fixed bottom-10 left-8 hidden sm:flex flex-col items-start gap-1.5 max-w-[20rem] pointer-events-none select-none"
        initial={initialState}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <span
          className="uppercase tracking-[0.2em] font-light"
          style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}
        >
          currently reading
        </span>
        <span
          className="flex items-start gap-2 text-left"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}
        >
          <BookOpen size={13} strokeWidth={1.5} className="shrink-0 mt-0.5" />
          <span className="flex flex-col leading-tight">
            <span className="font-medium" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
              {status.reading.title}
            </span>
            <span style={{ opacity: 0.6 }}>&mdash; {status.reading.author}</span>
          </span>
        </span>
        {status.reading.progress != null && (
          <div className="w-full mt-1 flex items-center gap-2">
            <div
              className="flex-1 h-[3px] rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--color-border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${status.reading.progress}%`,
                  backgroundColor: 'var(--color-accent)',
                  opacity: 0.6,
                }}
              />
            </div>
            <span
              style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', opacity: 0.6 }}
            >
              {status.reading.progress}%
            </span>
          </div>
        )}
      </motion.div>

      {/* Status + location/weather — bottom right */}
      <motion.div
        className="fixed bottom-10 right-8 hidden sm:flex flex-col items-end gap-1.5 max-w-[20rem] pointer-events-none select-none"
        initial={initialState}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <span
          className="flex items-center gap-2 text-right"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}
        >
          <Circle size={12} strokeWidth={1.5} className="shrink-0" />
          <span className="truncate">{status.status}</span>
        </span>
        <span
          className="flex items-center gap-2 text-right"
          style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', opacity: 0.7 }}
        >
          <WeatherIcon size={12} strokeWidth={1.5} className="shrink-0" />
          <span className="shrink-0">{locationLine}</span>
        </span>
      </motion.div>
    </>
  )
}
