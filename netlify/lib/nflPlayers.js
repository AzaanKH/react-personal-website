// Sleeper's /players/nfl is ~15 MB and Sleeper asks callers to fetch it at most once a
// day, so browsers never request it directly. This function trims it to the fields the
// Interests page shows and lets Netlify's CDN hold the result for a day: the function
// (and the 15 MB download) runs about once a day however many people open a lineup.
const PLAYERS_URL = 'https://api.sleeper.app/v1/players/nfl'
const UPSTREAM_TIMEOUT_MS = 20000
export const CDN_MAX_AGE = 24 * 60 * 60

// Positions a fantasy lineup can hold (DEF covers leagues that start a team defense).
const FANTASY_POSITIONS = new Set(['QB', 'RB', 'WR', 'TE', 'K', 'DEF'])

// { [playerId]: [name, position, nflTeam] }. Arrays instead of objects keep the payload
// small (~2,500 players). Team defenses use their team name ("Kansas City Chiefs").
export function trimPlayers(players) {
  const trimmed = {}
  for (const [id, player] of Object.entries(players ?? {})) {
    if (!player || !FANTASY_POSITIONS.has(player.position)) continue
    if (!player.active && player.position !== 'DEF') continue
    const name = player.full_name || [player.first_name, player.last_name].filter(Boolean).join(' ')
    if (!name) continue
    trimmed[id] = [name, player.position, player.team ?? null]
  }
  return trimmed
}

function json(body, status, extraHeaders = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } })
}

export async function handleNflPlayersRequest(req, { fetchImpl = fetch } = {}) {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
  }

  let players
  try {
    const upstream = await fetchImpl(PLAYERS_URL, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
    if (!upstream.ok) {
      console.error(`nfl-players: upstream returned ${upstream.status}`)
      return json({ error: 'Sleeper API error', upstreamStatus: upstream.status }, 502)
    }
    players = await upstream.json()
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError'
    console.error(`nfl-players: ${timedOut ? 'timed out' : 'request failed'}`, error?.message)
    return json({ error: timedOut ? 'Sleeper API timed out' : 'Sleeper API unreachable' }, timedOut ? 504 : 502)
  }

  if (!players || typeof players !== 'object' || Array.isArray(players)) {
    return json({ error: 'Sleeper API returned an invalid response' }, 502)
  }

  return json({ players: trimPlayers(players), timestamp: new Date().toISOString() }, 200, {
    'Cache-Control': 'public, max-age=3600',
    // Shared across all edge nodes (durable) and refreshed in the background once a day.
    'Netlify-CDN-Cache-Control': `public, durable, max-age=${CDN_MAX_AGE}, stale-while-revalidate=${CDN_MAX_AGE}`,
    // No query param selects a different object, so `?anything` can't bypass the cache
    // and re-trigger the 15 MB download.
    'Netlify-Vary': 'query=none',
  })
}
