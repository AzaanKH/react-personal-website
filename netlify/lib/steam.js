const STEAM_API = 'https://api.steampowered.com'
const UPSTREAM_TIMEOUT_MS = 8000
const MAX_RECENT_COUNT = 20

// Each endpoint maps to one Steam Web API call. `maxAge` is the CDN/browser cache
// lifetime: profile carries online/"now playing" state, so it stays short.
export const STEAM_ENDPOINTS = {
  profile: {
    path: '/ISteamUser/GetPlayerSummaries/v0002/',
    params: (steamId) => ({ steamids: steamId }),
    maxAge: 60,
  },
  recent: {
    path: '/IPlayerService/GetRecentlyPlayedGames/v0001/',
    params: (steamId, count) => ({ steamid: steamId, count }),
    maxAge: 600,
  },
  games: {
    path: '/IPlayerService/GetOwnedGames/v0001/',
    params: (steamId) => ({
      steamid: steamId,
      format: 'json',
      include_appinfo: 'true',
      include_played_free_games: 'true',
    }),
    maxAge: 3600,
  },
  level: {
    path: '/IPlayerService/GetSteamLevel/v1/',
    params: (steamId) => ({ steamid: steamId }),
    maxAge: 86400,
  },
}

export function clampCount(value) {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 10
  return Math.min(Math.max(parsed, 1), MAX_RECENT_COUNT)
}

// The Steam ID always comes from server config. Accepting it from the query
// string would let anyone spend this API key looking up arbitrary accounts.
export function buildSteamUrl(endpoint, { apiKey, steamId, count }) {
  const definition = STEAM_ENDPOINTS[endpoint]
  if (!definition) return null

  const url = new URL(definition.path, STEAM_API)
  const params = { key: apiKey, ...definition.params(steamId, clampCount(count)) }
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, String(value))
  }
  return url
}

function json(body, status, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

export async function handleSteamRequest(req, { apiKey, steamId, fetchImpl = fetch }) {
  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'GET' })
  }

  if (!apiKey || !steamId) {
    console.error('steam-proxy: STEAM_API_KEY or STEAM_ID is not configured')
    return json({ error: 'Steam integration is not configured' }, 503)
  }

  const query = new URL(req.url).searchParams
  const endpoint = query.get('endpoint')
  const upstreamUrl = buildSteamUrl(endpoint, { apiKey, steamId, count: query.get('count') })

  if (!upstreamUrl) {
    return json({ error: 'Invalid endpoint', availableEndpoints: Object.keys(STEAM_ENDPOINTS) }, 400)
  }

  let upstream
  try {
    upstream = await fetchImpl(upstreamUrl, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError'
    console.error(`steam-proxy: ${endpoint} request ${timedOut ? 'timed out' : 'failed'}`, error?.message)
    return json({ error: timedOut ? 'Steam API timed out' : 'Steam API unreachable' }, timedOut ? 504 : 502)
  }

  if (!upstream.ok) {
    // Never echo upstream bodies: Steam error pages can include the request URL (and key).
    console.error(`steam-proxy: ${endpoint} upstream returned ${upstream.status}`)
    return json({ error: 'Steam API error', upstreamStatus: upstream.status }, 502)
  }

  const data = await upstream.json()
  const { maxAge } = STEAM_ENDPOINTS[endpoint]

  return json(
    { ...data, _metadata: { endpoint, timestamp: new Date().toISOString() } },
    200,
    { 'Cache-Control': `public, max-age=${maxAge}` },
  )
}
