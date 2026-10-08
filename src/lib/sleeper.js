// Sleeper's read-only API needs no key and allows browser requests
// (Access-Control-Allow-Origin: *), so the Interests page calls it directly instead of
// going through a Netlify Function. https://docs.sleeper.com/
const SLEEPER_API = 'https://api.sleeper.app/v1'

// Sleeper user "AzaanKhalfe". The league is looked up by name each season because a
// keeper league gets a new league_id every year; if the name changes, the first NFL
// league for the season is used instead.
export const SLEEPER_USER_ID = '734368165714345984'
export const SLEEPER_LEAGUE_NAME = 'Ummati Official'

const getJson = async (path, signal, base = SLEEPER_API) => {
  const response = await fetch(`${base}${path}`, { signal })
  if (!response.ok) throw new Error(`Sleeper request failed (${response.status})`)
  return response.json()
}

// Undocumented (it's what Sleeper's own app uses), so it's optional: if it fails, the
// lineup shows plain points instead of "Yet to play". Sleeper caches it for 10 minutes.
const SLEEPER_SCHEDULE = 'https://api.sleeper.app/schedule/nfl'
// The schedule only adds "Yet to play" labels, so it gets a short timeout of its own: a
// stalled schedule must never hold back scores that have already arrived.
export const SCHEDULE_TIMEOUT_MS = 4000

// { DET: 'pre_game', KC: 'complete', ... } for one week. Teams without a game are on bye.
export function weekGameStatus(schedule, week) {
  const status = {}
  for (const game of schedule ?? []) {
    if (game.week !== week) continue
    status[game.home] = game.status
    status[game.away] = game.status
  }
  return status
}

// How a lineup row should read: 0 points before kickoff means "hasn't played", not "scored 0".
export function playerGameState(gameStatus, team) {
  if (!gameStatus || !team) return null
  const status = gameStatus[team]
  if (!status) return 'bye'
  if (status === 'complete') return 'final'
  if (status === 'in_game') return 'live'
  return 'upcoming'
}

// 'won' | 'lost' | 'tied' once every NFL game of the week is over, else null. Without the
// (optional) schedule a finished week can't be told apart from a Thursday lead, so that's
// null too. Head-to-head only: the weekly median game isn't counted.
export function matchupResult(matchup) {
  if (!matchup || matchup.opponentPoints == null) return null
  const statuses = Object.values(matchup.gameStatus ?? {})
  if (statuses.length === 0 || statuses.some((status) => status !== 'complete')) return null
  if (matchup.myPoints > matchup.opponentPoints) return 'won'
  if (matchup.myPoints < matchup.opponentPoints) return 'lost'
  return 'tied'
}

const pointsFor = (settings) => (settings?.fpts ?? 0) + (settings?.fpts_decimal ?? 0) / 100

// Sleeper's default standings order: wins, then points for.
const byStanding = (a, b) =>
  (b.settings?.wins ?? 0) - (a.settings?.wins ?? 0) || pointsFor(b.settings) - pointsFor(a.settings)

// Pairs each starting slot (QB, RB, FLEX, ...) with the player Sleeper started there.
// `starters` follows the order of the league's non-bench roster_positions; an empty
// slot is "0". Names are resolved later from /api/nfl-players, only when the lineup
// is opened.
export function buildLineup(league, entry) {
  const slots = (league.roster_positions ?? []).filter((slot) => slot !== 'BN' && slot !== 'IR' && slot !== 'TAXI')
  return slots.map((slot, index) => {
    const playerId = entry?.starters?.[index]
    return {
      slot,
      playerId: playerId && playerId !== '0' ? playerId : null,
      points: entry?.starters_points?.[index] ?? 0,
    }
  })
}

// Only this account's team is named. Opponents appear as a score, never a team name,
// and the league's name and ID are left out so it can't be looked up from the page.
export function summarizeLeague({ state, league, rosters, users, matchups, schedule, userId = SLEEPER_USER_ID }) {
  const mine = rosters.find((roster) => roster.owner_id === userId)
  if (!mine) return null

  const owner = users.find((user) => user.user_id === userId)
  const standings = [...rosters].sort(byStanding)
  const week = state.season_type === 'regular' || state.season_type === 'post' ? state.display_week : null

  let matchup = null
  const myMatchup = week ? matchups?.find((entry) => entry.roster_id === mine.roster_id) : null
  if (myMatchup?.matchup_id != null) {
    const opponent = matchups.find(
      (entry) => entry.matchup_id === myMatchup.matchup_id && entry.roster_id !== mine.roster_id,
    )
    matchup = {
      week,
      myPoints: myMatchup.points ?? 0,
      opponentPoints: opponent?.points ?? null,
      myLineup: buildLineup(league, myMatchup),
      opponentLineup: opponent ? buildLineup(league, opponent) : [],
      gameStatus: schedule ? weekGameStatus(schedule, week) : null,
    }
  }

  return {
    season: league.season,
    teamName: owner?.metadata?.team_name || owner?.display_name || 'My team',
    record: {
      wins: mine.settings?.wins ?? 0,
      losses: mine.settings?.losses ?? 0,
      ties: mine.settings?.ties ?? 0,
    },
    pointsFor: Math.round(pointsFor(mine.settings) * 100) / 100,
    rank: standings.indexOf(mine) + 1,
    totalTeams: rosters.length,
    // League setting that adds a win/loss each week for beating the league median, so
    // the record has two results per week.
    medianGames: Boolean(league.settings?.league_average_match),
    matchup,
  }
}

// Resolves to null on any failure or after `timeoutMs`, never rejects.
function fetchSchedule(seasonType, season, signal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  return getJson(`/${seasonType}/${season}`, combined, SLEEPER_SCHEDULE).catch(() => null)
}

export async function fetchSleeperSummary({
  signal,
  userId = SLEEPER_USER_ID,
  leagueName = SLEEPER_LEAGUE_NAME,
  scheduleTimeoutMs = SCHEDULE_TIMEOUT_MS,
} = {}) {
  const state = await getJson('/state/nfl', signal)
  const season = state.league_season ?? state.season
  const leagues = await getJson(`/user/${userId}/leagues/nfl/${season}`, signal)
  const league = leagues.find((entry) => entry.name === leagueName) ?? leagues[0]
  if (!league) return null

  const week = state.display_week || state.week
  const seasonType = state.season_type === 'post' ? 'post' : 'regular'
  const [rosters, users, matchups, schedule] = await Promise.all([
    getJson(`/league/${league.league_id}/rosters`, signal),
    getJson(`/league/${league.league_id}/users`, signal),
    week ? getJson(`/league/${league.league_id}/matchups/${week}`, signal) : Promise.resolve([]),
    week ? fetchSchedule(seasonType, season, signal, scheduleTimeoutMs) : Promise.resolve(null),
  ])

  const summary = summarizeLeague({ state, league, rosters, users, matchups, schedule, userId })
  return summary && { ...summary, fetchedAt: Date.now() }
}
