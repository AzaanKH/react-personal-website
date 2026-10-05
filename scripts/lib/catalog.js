// Lookups for `npm run add`. Runs only on your machine: the TMDB and Twitch keys are
// read from .env and never reach the browser or Netlify. Each search returns
// `{ label, entry }` candidates; `entry` is what gets stored in src/data/interests.json.

const TMDB_API = 'https://api.themoviedb.org/3'
const STEAM_SEARCH = 'https://store.steampowered.com/api/storesearch/'
const IGDB_API = 'https://api.igdb.com/v4'
const RESULT_LIMIT = 6

export const MEDIA_KINDS = { movie: 'movies', show: 'shows', anime: 'anime' }
export const PLATFORMS = ['steam', 'pc', 'ps5', 'ps4', 'switch', 'switch2', 'xbox', 'wiiu', 'wii', '3ds', 'ds']

const yearOf = (date) => (date ? Number(String(date).slice(0, 4)) || null : null)

async function getJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`${new URL(url).host} returned ${response.status}: ${body.slice(0, 200)}`)
  }
  return response.json()
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set in .env (see .env.example)`)
  return value
}

// Movies use TMDB's movie search; shows and anime are both TV on TMDB. For anime,
// Japanese animation is listed first so the right series is usually option 1.
export async function searchMedia(kind, query, year) {
  const type = kind === 'movie' ? 'movie' : 'tv'
  const params = new URLSearchParams({ query, api_key: requireEnv('TMDB_API_KEY'), include_adult: 'false' })
  if (year) params.set(type === 'movie' ? 'year' : 'first_air_date_year', String(year))

  const { results = [] } = await getJson(`${TMDB_API}/search/${type}?${params}`)
  const isAnime = (result) => result.genre_ids?.includes(16) && result.origin_country?.includes('JP')
  const ordered = kind === 'anime' ? [...results].sort((a, b) => isAnime(b) - isAnime(a)) : results

  return ordered.slice(0, RESULT_LIMIT).map((result) => {
    const title = result.title ?? result.name
    const released = yearOf(result.release_date ?? result.first_air_date)
    return {
      label: `${title}${released ? ` (${released})` : ''}${result.poster_path ? '' : ' [no poster]'}`,
      entry: { tmdbId: result.id, title, year: released, poster: result.poster_path ?? null },
    }
  })
}

export async function searchSteam(query) {
  const params = new URLSearchParams({ term: query, l: 'english', cc: 'US' })
  const { items = [] } = await getJson(`${STEAM_SEARCH}?${params}`)
  return items.slice(0, RESULT_LIMIT).map((item) => ({
    label: `${item.name} (Steam app ${item.id})`,
    entry: { appid: item.id, title: item.name, platform: 'steam' },
  }))
}

// IGDB uses Twitch app credentials (client credentials grant: no login, no redirect).
async function igdbToken() {
  const params = new URLSearchParams({
    client_id: requireEnv('TWITCH_CLIENT_ID'),
    client_secret: requireEnv('TWITCH_CLIENT_SECRET'),
    grant_type: 'client_credentials',
  })
  const { access_token: token } = await getJson(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' })
  return token
}

export async function searchIgdb(query, platform) {
  const token = await igdbToken()
  const safeQuery = query.replace(/["\\]/g, '')
  const games = await getJson(`${IGDB_API}/games`, {
    method: 'POST',
    headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${token}` },
    body: `search "${safeQuery}"; fields name,url,first_release_date,cover.image_id,platforms.abbreviation; limit ${RESULT_LIMIT};`,
  })

  return games.map((game) => {
    const released = game.first_release_date ? new Date(game.first_release_date * 1000).getUTCFullYear() : null
    const platforms = game.platforms?.map((p) => p.abbreviation).filter(Boolean).join(', ')
    return {
      label: `${game.name}${released ? ` (${released})` : ''}${platforms ? ` · ${platforms}` : ''}${game.cover ? '' : ' [no cover]'}`,
      entry: { igdbId: game.id, title: game.name, platform, cover: game.cover?.image_id ?? null, url: game.url },
    }
  })
}

const sameItem = (a, b) =>
  (a.tmdbId != null && a.tmdbId === b.tmdbId) ||
  (a.appid != null && a.appid === b.appid) ||
  (a.igdbId != null && a.igdbId === b.igdbId)

// Newest first. Re-adding something moves it to the front and keeps your rating and
// review unless new ones were given.
export function addEntry(list, entry) {
  const existing = list.find((item) => sameItem(item, entry))
  const merged = existing ? { ...existing, ...dropEmpty(entry) } : entry
  return [merged, ...list.filter((item) => !sameItem(item, entry))]
}

const dropEmpty = (object) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ''))

export function parseRating(value) {
  if (value === undefined || value === null || value === '') return null
  const rating = Number(value)
  if (!Number.isFinite(rating) || rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0) {
    throw new Error(`Rating must be 0.5–5 in half steps (got "${value}")`)
  }
  return rating
}
