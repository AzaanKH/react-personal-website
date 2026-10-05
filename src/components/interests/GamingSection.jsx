import { RefreshCw } from 'lucide-react'
import { useSteamData } from '../../hooks/useSteamData'
import { PLATFORM_LABELS, formatHours, gamePoster, steamHeader, steamPoster } from '../../lib/posters'
import interests from '../../data/interests.json'
import PosterCard, { PosterShelf } from './PosterCard'
import Section, { UpdatedAt } from './Section'

const ENDPOINTS = ['profile', 'recent', 'games']
const SHELF_SIZE = 6

const steamStoreUrl = (appid) => `https://store.steampowered.com/app/${appid}`

function SteamPoster({ game, meta }) {
  return (
    <PosterCard
      title={game.name}
      src={steamPoster(game.appid)}
      fallbackSrc={steamHeader(game.appid)}
      href={steamStoreUrl(game.appid)}
      meta={meta}
    />
  )
}

function NowPlaying({ player }) {
  return (
    <div className="hairline-card mb-10 flex items-center gap-5 p-4 sm:p-5">
      {player.gameid && (
        <img
          src={steamHeader(player.gameid)}
          alt=""
          className="hidden h-16 w-auto rounded-md object-cover sm:block"
          onError={(event) => { event.currentTarget.hidden = true }}
        />
      )}
      <div className="min-w-0">
        <p className="mb-1.5 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em]" style={{ color: 'var(--color-accent)' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: 'var(--color-accent)' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          </span>
          Now playing
        </p>
        <p className="display-heading truncate text-3xl" style={{ color: 'var(--color-text)' }}>
          {player.gameextrainfo}
        </p>
      </div>
    </div>
  )
}

export default function GamingSection({ number }) {
  const { steamData, loading, error, refreshing, partialFailure, lastUpdated, refetch } = useSteamData(ENDPOINTS)
  const player = steamData.profile
  const recentGames = (steamData.recentGames ?? []).slice(0, SHELF_SIZE)
  const library = steamData.gameLibrary ?? []
  // Steam counts non-game apps (e.g. Wallpaper Engine) as played; interests.json lists
  // the ones to leave out. Titles there are only for whoever edits the file.
  const hidden = new Set((interests.hideFromMostPlayed ?? []).map((app) => app.appid))
  const mostPlayed = [...library]
    .filter((game) => game.playtime_forever > 0 && !hidden.has(game.appid))
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, SHELF_SIZE)
  const libraryMinutes = new Map(library.map((game) => [game.appid, game.playtime_forever]))

  return (
    <Section
      id="gaming"
      number={number}
      kicker="Gaming"
      title={<>Off duty <em style={{ color: 'var(--color-accent)' }}>archive.</em></>}
      aside={
        !loading && (
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <p role="status" aria-live="polite">
              {refreshing ? 'Refreshing Steam data…' : <UpdatedAt timestamp={lastUpdated} />}
              {partialFailure && !refreshing && ' · Some Steam data could not be loaded.'}
            </p>
            <button
              type="button"
              onClick={refetch}
              disabled={refreshing}
              className="hover-text inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 uppercase tracking-[0.12em] disabled:cursor-default disabled:opacity-60"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <RefreshCw size={12} strokeWidth={1.6} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
              Refresh
            </button>
          </div>
        )
      }
    >
      {player?.gameextrainfo && <NowPlaying player={player} />}

      {loading ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6" aria-busy="true" aria-label="Loading Steam data">
          {Array.from({ length: SHELF_SIZE }, (_, i) => (
            <div key={i} className="animate-pulse rounded-[10px]" style={{ aspectRatio: '2 / 3', backgroundColor: 'var(--color-border-subtle)' }} />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Steam data is unavailable right now.
        </p>
      ) : (
        <>
          {recentGames.length > 0 && (
            <PosterShelf title="Recently played" description="Last two weeks">
              {recentGames.map((game) => (
                <SteamPoster key={game.appid} game={game} meta={formatHours(game.playtime_2weeks)} />
              ))}
            </PosterShelf>
          )}
          {mostPlayed.length > 0 && (
            <PosterShelf title="Most played" description="All time on Steam">
              {mostPlayed.map((game) => (
                <SteamPoster key={game.appid} game={game} meta={formatHours(game.playtime_forever)} />
              ))}
            </PosterShelf>
          )}
        </>
      )}

      {interests.games.length > 0 && (
        <PosterShelf
          title="Favorites"
          description="Across every platform"
          rotate
          reverse
          footer={
            interests.games.some((game) => !game.appid) && (
              <p className="mt-6 text-[0.7rem]" style={{ color: 'var(--color-text-secondary)' }}>
                Non-Steam covers from <a className="hover-accent underline" href="https://www.igdb.com" target="_blank" rel="noopener noreferrer">IGDB</a>.
              </p>
            )
          }
        >
          {interests.games.map((game) => {
            // Steam hours stay live; other platforms use the number typed into the data file.
            const minutes = game.appid ? libraryMinutes.get(game.appid) : game.hours * 60
            return (
              <PosterCard
                key={game.appid ?? game.igdbId}
                title={game.title}
                {...gamePoster(game)}
                href={game.appid ? steamStoreUrl(game.appid) : game.url}
                badge={PLATFORM_LABELS[game.platform] ?? game.platform}
                meta={formatHours(minutes)}
                rating={game.rating}
                note={game.review}
              />
            )
          })}
        </PosterShelf>
      )}
    </Section>
  )
}
