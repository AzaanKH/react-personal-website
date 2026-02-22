import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useSteamData } from '../hooks/useSteamData'

function GameCard({ game, index, playtimeRatio, formatPlaytime }) {
  // 0 = library_hero (1920x620), 1 = header (460x215), 2 = all failed
  const [imgStage, setImgStage] = useState(0)

  const imgSrc = imgStage === 0
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_hero.jpg`
    : `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Full-width banner image */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '96 / 31',
          backgroundColor: 'var(--color-surface-elevated)',
        }}
      >
        {imgStage < 2 ? (
          <img
            src={imgSrc}
            alt={game.name}
            loading="lazy"
            onError={() => setImgStage(prev => prev + 1)}
            className="w-full h-full object-cover"
            style={{
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="0" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Game info + proportional playtime bar */}
      <div className="px-4 pt-4 pb-4 sm:px-5 sm:pt-4 sm:pb-5">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h3
            className="font-semibold min-w-0 truncate"
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              color: 'var(--color-text)',
            }}
          >
            {game.name}
          </h3>
          <span
            className="text-[0.7rem] tracking-[0.1em] uppercase font-light flex-shrink-0"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatPlaytime(game.playtime_2weeks)}
          </span>
        </div>

        {/* Proportional playtime bar */}
        <div
          className="w-full h-[3px]"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <motion.div
            className="h-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(playtimeRatio * 100, 2)}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function GamingPage() {
  const endpoints = useMemo(() => ['profile', 'recent'], [])
  const options = useMemo(() => ({ autoRefresh: false }), [])
  const { steamData, loading, error, formatPlaytime } = useSteamData(
    endpoints,
    options
  )

  const player = steamData.profile
  const recentGames = steamData.recentGames || []
  const isCurrentlyPlaying = player?.gameextrainfo || player?.gameid

  if (loading) {
    return (
      <div className="w-full max-w-[800px] mx-auto pt-4 md:pt-8 pb-8 px-6">
        <div className="animate-pulse space-y-6">
          <div
            className="h-10 w-48 rounded-lg"
            style={{ backgroundColor: 'var(--color-border-subtle)' }}
          />
          <div className="space-y-4 mt-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="py-6 flex items-baseline justify-between gap-4">
                <div
                  className="h-6 rounded-lg"
                  style={{
                    width: `${40 + n * 15}%`,
                    backgroundColor: 'var(--color-border-subtle)',
                  }}
                />
                <div
                  className="h-4 w-24 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-border-subtle)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !player && recentGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 text-center">
        <h2
          className="font-bold mb-4"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: 'var(--color-text)',
          }}
        >
          Away from Keyboard
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Gaming data is currently unavailable.
        </p>
      </div>
    )
  }

  if (isCurrentlyPlaying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-6 text-center">
        <div className="flex items-center gap-3 mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          </span>
          <span
            className="uppercase tracking-[0.2em] text-[0.7rem] font-light"
            style={{ color: 'var(--color-accent)' }}
          >
            Now Playing
          </span>
        </div>

        <h2
          className="font-bold"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 7rem)',
            lineHeight: 0.9,
            color: 'var(--color-text)',
          }}
        >
          {player.gameextrainfo}
        </h2>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[800px] mx-auto pt-4 md:pt-8 pb-8 px-6">
      <h2
        className="font-bold mb-12 tracking-[-0.02em]"
        style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: 'var(--color-text)',
        }}
      >
        Recently Played
      </h2>

      {(() => {
        const maxPlaytime = Math.max(...recentGames.map(g => g.playtime_2weeks || 0), 1)
        return recentGames.length > 0 ? (
          <div className="space-y-6">
            {recentGames.map((game, i) => (
              <GameCard
                key={game.appid}
                game={game}
                index={i}
                playtimeRatio={(game.playtime_2weeks || 0) / maxPlaytime}
                formatPlaytime={formatPlaytime}
              />
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
              color: 'var(--color-text-secondary)',
            }}
          >
            No recent gaming activity.
          </p>
        )
      })()}
    </div>
  )
}
