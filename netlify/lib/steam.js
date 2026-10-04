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

  // `refresh` is a cache-busting nonce from the Refresh button. Query params are
  // part of Netlify's cache key, so a new value always misses the CDN; the answer
  // is then marked no-store so one visitor's refresh never fills the shared cache.
  const forceRefresh = query.has('refresh')

  let data
  try {
    const upstream = await fetchImpl(upstreamUrl, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) })
    if (!upstream.ok) {
      // Never echo upstream bodies: Steam error pages can include the request URL (and key).
      console.error(`steam-proxy: ${endpoint} upstream returned ${upstream.status}`)
      return json({ error: 'Steam API error', upstreamStatus: upstream.status }, 502)
    }
    // Parsing is inside the try: the timeout also covers reading the body, and
    // Steam occasionally answers 200 with an HTML error page.
    data = await upstream.json()
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError'
    const invalid = error instanceof SyntaxError
    console.error(
      `steam-proxy: ${endpoint} ${timedOut ? 'timed out' : invalid ? 'returned invalid JSON' : 'request failed'}`,
      error?.message,
    )
    if (timedOut) return json({ error: 'Steam API timed out' }, 504)
    return json({ error: invalid ? 'Steam API returned an invalid response' : 'Steam API unreachable' }, 502)
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.error(`steam-proxy: ${endpoint} returned an unexpected JSON shape`)
    return json({ error: 'Steam API returned an invalid response' }, 502)
  }

  const { maxAge } = STEAM_ENDPOINTS[endpoint]
  const cacheHeaders = forceRefresh
    ? { 'Cache-Control': 'no-store' }
    : {
        'Cache-Control': `public, max-age=${maxAge}`,
        // Only these params select a cached object; `refresh` is listed so a
        // refresh request can never be answered from cache.
        'Netlify-Vary': 'query=endpoint|count|refresh',
      }

  // `timestamp` is when Steam was actually queried. A CDN hit replays it
  // unchanged, so clients use it (not their own clock) to show data age.
  return json({ ...data, _metadata: { endpoint, timestamp: new Date().toISOString() } }, 200, cacheHeaders)
}
