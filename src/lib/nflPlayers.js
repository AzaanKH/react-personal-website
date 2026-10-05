// Player names for the fantasy lineups, from the /api/nfl-players function (a trimmed,
// day-cached copy of Sleeper's player list). Names, positions, and teams only change
// with trades and signings, so the list is kept in localStorage for a day: a returning
// visitor opens lineups with no request at all. Points never come from here; they
// arrive with the (small) matchup response, which is the only thing that changes live.
const CACHE_KEY = 'nfl_players_v1'
export const PLAYERS_TTL_MS = 24 * 60 * 60 * 1000

// Only the in-flight request is shared (so opening both lineups at once fetches once).
// It's cleared when it settles: after that, freshness is decided by the localStorage TTL.
let request = null

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.savedAt < PLAYERS_TTL_MS) return cached.players
  } catch {
    // Corrupt or unavailable storage: fall through to the network.
  }
  return null
}

function writeCache(players) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), players }))
  } catch {
    // ~110 KB; if storage is full the list just isn't kept between visits.
  }
}

export function loadNflPlayers() {
  const cached = readCache()
  if (cached) return Promise.resolve(cached)

  request ??= fetch('/api/nfl-players')
    .then((response) => {
      if (!response.ok) throw new Error(`Player names unavailable (${response.status})`)
      return response.json()
    })
    .then((body) => {
      const players = body.players ?? {}
      writeCache(players)
      return players
    })
    .finally(() => {
      request = null
    })
  return request
}

export function resetNflPlayersCache() {
  request = null
}
