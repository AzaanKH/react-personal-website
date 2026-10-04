import { useState } from 'react'
import { motion } from 'motion/react'
import { ExternalLink, Gamepad2, RefreshCw } from 'lucide-react'
import { useSteamData } from '../hooks/useSteamData'

function GameFallbackBanner({ game }) {
  const steamUrl = game.appid ? `https://store.steampowered.com/app/${game.appid}` : null

  return (
    <div
      className="relative h-full w-full overflow-hidden p-4 sm:p-5"
      style={{
        backgroundColor: 'var(--color-surface-elevated)',
        backgroundImage: [
          'radial-gradient(circle at 18% 24%, rgba(196, 93, 62, 0.18), transparent 30%)',
          'radial-gradient(circle at 82% 76%, rgba(100, 116, 139, 0.16), transparent 32%)',
          'repeating-linear-gradient(135deg, transparent 0 12px, var(--color-border-subtle) 12px 13px)',
          'linear-gradient(135deg, var(--color-surface-elevated), var(--color-surface))',
        ].join(', '),
      }}
    >
      <div
        className="absolute -right-8 -top-10 h-28 w-28 rounded-full"
        style={{
          border: '1px solid var(--color-border)',
          opacity: 0.45,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-3 right-4 hidden text-[4.5rem] font-bold leading-none sm:block"
        style={{
          color: 'var(--color-border-subtle)',
        }}
        aria-hidden="true"
      >
        {String(game.appid || '').slice(-2).padStart(2, '0')}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
          <Gamepad2 size={16} strokeWidth={1.6} aria-hidden="true" />
          <span>Steam library</span>
        </div>

        <div className="min-w-0">
          <p
            className="mb-2 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Artwork unavailable
          </p>
          <h3
            className="line-clamp-2 text-xl font-semibold leading-tight sm:text-2xl"
            style={{ color: 'var(--color-text)' }}
          >
            {game.name}
          </h3>
        </div>

        {steamUrl && (
          <a
            href={steamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-transform hover:-translate-y-0.5 hover:opacity-85"
            style={{
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            View on Steam
            <ExternalLink size={13} strokeWidth={1.6} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}

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
        borderRadius: 12,
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
          <GameFallbackBanner game={game} />
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

const ENDPOINTS = ['profile', 'recent']

function SteamStatusBar({ lastUpdated, refreshing, partialFailure, onRefresh }) {
  return (
    <div
      className="mx-auto mt-10 flex w-full max-w-[900px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 pb-10 text-xs"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      <p role="status" aria-live="polite">
        {refreshing
          ? 'Refreshing Steam data…'
          : lastUpdated
            ? `Updated ${new Date(lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : null}
        {partialFailure && !refreshing && ' · Some Steam data could not be loaded.'}
      </p>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 uppercase tracking-[0.12em] hover-text disabled:cursor-default disabled:opacity-60"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <RefreshCw size={12} strokeWidth={1.6} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
        Refresh
      </button>
    </div>
  )
}

export default function GamingPage() {
  const steam = useSteamData(ENDPOINTS)

  return (
    <>
      {/* Stable heading across loading/playing/list states so focus after navigation has a target. */}
      <h1 className="sr-only">Gaming activity</h1>
      <GamingContent {...steam} />
      {!steam.loading && (
        <SteamStatusBar
          lastUpdated={steam.lastUpdated}
          refreshing={steam.refreshing}
          partialFailure={steam.partialFailure}
          onRefresh={steam.refetch}
        />
      )}
    </>
  )
}

function GamingContent({ steamData, loading, error, formatPlaytime }) {
  const player = steamData.profile
  const recentGames = steamData.recentGames || []
  const isCurrentlyPlaying = player?.gameextrainfo || player?.gameid

  if (loading) {
    return (
      <div className="w-full max-w-[800px] mx-auto pt-4 md:pt-8 pb-8 px-6">
        <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading Steam data">
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
    <div className="w-full max-w-[900px] mx-auto pt-4 md:pt-8 pb-12 px-6">
      <p className="eyebrow mb-4 accent-slash" style={{ color: 'var(--color-text-secondary)' }}>Off duty archive</p>
      <h2
        className="display-heading mb-5"
        style={{
          fontSize: 'clamp(3.5rem, 8vw, 7rem)',
          color: 'var(--color-text)',
        }}
      >
        Recently <em style={{ color: 'var(--color-accent)' }}>played.</em>
      </h2>
      <p className="mb-12 max-w-lg text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
        A live window into the games currently stealing a few hours after the code compiles.
      </p>

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
