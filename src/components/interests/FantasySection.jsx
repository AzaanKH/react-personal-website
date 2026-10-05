import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useSleeper } from '../../hooks/useSleeper'
import { loadNflPlayers } from '../../lib/nflPlayers'
import { playerGameState } from '../../lib/sleeper'
import Section, { UpdatedAt } from './Section'

const ordinal = (n) => {
  const suffix = ['th', 'st', 'nd', 'rd'][(n % 100 >= 11 && n % 100 <= 13) || n % 10 > 3 ? 0 : n % 10]
  return `${n}${suffix}`
}

const formatPoints = (points) => (points == null ? '—' : points.toFixed(2))

function ScoreRow({ label, points, highlighted, leading }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 rounded-lg px-4 py-3"
      style={{
        backgroundColor: highlighted ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
        border: `1px solid ${highlighted ? 'color-mix(in srgb, var(--color-accent) 35%, transparent)' : 'var(--color-border)'}`,
      }}
    >
      <span
        className="min-w-0 truncate text-sm font-medium"
        style={{ color: highlighted ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="flex-shrink-0 font-semibold tabular-nums"
        style={{ fontSize: '1.5rem', color: leading ? 'var(--color-text)' : 'var(--color-text-secondary)' }}
      >
        {formatPoints(points)}
      </span>
    </div>
  )
}

function PointsCell({ points, state }) {
  if (state === 'upcoming' || state === 'bye') {
    return (
      <span className="text-[0.7rem] uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-secondary)' }}>
        {state === 'bye' ? 'Bye' : 'Yet to play'}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium tabular-nums" style={{ color: 'var(--color-text)' }}>
      {state === 'live' && (
        <span className="relative flex h-1.5 w-1.5" title="Game in progress">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
          <span className="sr-only">Playing now:</span>
        </span>
      )}
      {formatPoints(points)}
    </span>
  )
}

// Sleeper's image CDN (undocumented, ~22 KB headshots, cached 31 days). Team defenses use
// the team logo; their player ID is the team abbreviation. Falls back to initials.
const playerImage = (playerId, position) =>
  position === 'DEF'
    ? `https://sleepercdn.com/images/team_logos/nfl/${playerId.toLowerCase()}.png`
    : `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg`

function PlayerAvatar({ playerId, name, position }) {
  const [failed, setFailed] = useState(false)
  const initials = name?.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? ''

  return (
    <span
      className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-[0.6rem] font-medium"
      style={{ backgroundColor: 'var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
      aria-hidden="true"
    >
      {playerId && !failed ? (
        <img
          src={playerImage(playerId, position)}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full ${position === 'DEF' ? 'object-contain p-1' : 'object-cover object-top'}`}
        />
      ) : (
        initials
      )}
    </span>
  )
}

function LineupColumn({ title, lineup, players, gameStatus, highlighted }) {
  return (
    <div className="min-w-0">
      <h4
        className="eyebrow mb-3"
        style={{ color: highlighted ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
      >
        {title}
      </h4>
      <ol className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
        {lineup.map(({ slot, playerId, points }, index) => {
          const [name, position, team] = (playerId && players?.[playerId]) || []
          return (
            <li
              key={`${slot}-${index}`}
              className="grid grid-cols-[3rem_auto_1fr_auto] items-center gap-3 py-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span
                className="rounded px-1.5 py-0.5 text-center text-[0.6rem] font-medium uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-border-subtle)' }}
              >
                {slot === 'SUPER_FLEX' ? 'SFLX' : slot}
              </span>
              {/* Waits for the name list, so an unknown ID never flashes a broken image. */}
              <PlayerAvatar playerId={players ? playerId : null} name={name} position={position} />
              <span className="min-w-0">
                <span className="block truncate text-sm" style={{ color: 'var(--color-text)' }}>
                  {!playerId ? 'Empty' : name ?? (players ? 'Unknown player' : '…')}
                </span>
                {position && (
                  <span className="block text-[0.7rem]" style={{ color: 'var(--color-text-secondary)' }}>
                    {position}{team ? ` · ${team}` : ''}
                  </span>
                )}
              </span>
              <PointsCell points={points} state={playerId ? playerGameState(gameStatus, team) : null} />
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Lineups({ matchup, teamName }) {
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [players, setPlayers] = useState(null)
  const [playersError, setPlayersError] = useState(null)

  const toggle = () => {
    const next = !open
    setOpen(next)
    // Player names are only fetched the first time a lineup is opened.
    if (next && !players) {
      setPlayersError(null)
      loadNflPlayers()
        .then(setPlayers)
        .catch(() => setPlayersError('Player names are unavailable right now.'))
    }
  }

  return (
    <div className="md:col-span-2">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="hover-text inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.12em]"
        style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
      >
        {open ? 'Hide lineups' : 'Show lineups'}
        <ChevronDown
          size={13}
          strokeWidth={1.6}
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="lineups"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              {playersError && (
                <p className="mb-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {playersError}
                </p>
              )}
              <div className="grid gap-8 sm:grid-cols-2">
                <LineupColumn title={teamName} lineup={matchup.myLineup} players={players} gameStatus={matchup.gameStatus} highlighted />
                <LineupColumn title="Opponent" lineup={matchup.opponentLineup} players={players} gameStatus={matchup.gameStatus} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FantasyCard({ summary }) {
  const { record, matchup } = summary
  const recordText = `${record.wins}–${record.losses}${record.ties ? `–${record.ties}` : ''}`
  const iAmLeading = matchup && matchup.myPoints >= (matchup.opponentPoints ?? 0)

  return (
    <div className="hairline-card grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
          {summary.teamName}
        </p>
        <p
          className="display-heading mt-3"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 5.5rem)', color: 'var(--color-text)' }}
        >
          <span className="sr-only">Record: </span>
          {recordText}
        </p>
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {ordinal(summary.rank)} of {summary.totalTeams} · {summary.pointsFor.toLocaleString()} points for
        </p>
        {summary.medianGames && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Record includes a game against the league median each week.
          </p>
        )}
      </div>

      <div className="flex flex-col justify-center">
        {matchup ? (
          <>
            <p className="eyebrow mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Week {matchup.week} matchup
            </p>
            <div className="space-y-2">
              <ScoreRow label={summary.teamName} points={matchup.myPoints} highlighted leading={iAmLeading} />
              <ScoreRow label="Opponent" points={matchup.opponentPoints} leading={!iAmLeading} />
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No matchup this week.
          </p>
        )}
      </div>

      {matchup?.myLineup?.length > 0 && <Lineups matchup={matchup} teamName={summary.teamName} />}
    </div>
  )
}

export default function FantasySection({ number }) {
  const { summary, loading, error, lastUpdated } = useSleeper()

  return (
    <Section
      id="football"
      number={number}
      kicker="Fantasy football"
      title={<>On the <em style={{ color: 'var(--color-accent)' }}>gridiron.</em></>}
      aside={
        <p role="status" aria-live="polite" className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          <UpdatedAt timestamp={lastUpdated} />
          {error && summary && ' · Showing the last saved scores.'}
        </p>
      }
    >
      {loading ? (
        <div
          className="hairline-card h-56 animate-pulse"
          aria-busy="true"
          aria-label="Loading fantasy football"
        />
      ) : summary ? (
        <FantasyCard summary={summary} />
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {error ? 'Sleeper is unavailable right now.' : 'No Sleeper league this season yet.'}
        </p>
      )}
    </Section>
  )
}
