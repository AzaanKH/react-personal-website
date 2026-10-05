// Poster URLs for the Interests shelves. Entries in src/data/interests.json store only
// IDs and paths (written by `npm run add`); images are served by each provider's CDN,
// so none of them cost Netlify bandwidth and none need an API key in the browser.

// TMDB poster_path values look like "/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg". w342 is crisp
// at the shelf's widest column on a 2x display.
export const tmdbPoster = (posterPath) => (posterPath ? `https://image.tmdb.org/t/p/w342${posterPath}` : null)

// Steam's portrait library capsule (600x900, 2:3 like TMDB). Very old or small games
// don't have one, so callers fall back to the landscape header.
const STEAM_ASSETS = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps'
export const steamPoster = (appid) => `${STEAM_ASSETS}/${appid}/library_600x900.jpg`
export const steamHeader = (appid) => `${STEAM_ASSETS}/${appid}/header.jpg`

// IGDB cover image_id, e.g. "co2crj". t_cover_big_2x is 528x748 (roughly 3:4).
export const igdbCover = (imageId) =>
  imageId ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${imageId}.jpg` : null

export const PLATFORM_LABELS = {
  steam: 'Steam',
  pc: 'PC',
  ps5: 'PS5',
  ps4: 'PS4',
  switch: 'Switch',
  switch2: 'Switch 2',
  xbox: 'Xbox',
  wiiu: 'Wii U',
  wii: 'Wii',
  '3ds': '3DS',
  ds: 'DS',
}

// Steam games can be linked to the store and get live hours; everything else uses
// the IGDB cover and the hours typed into the data file.
export function gamePoster(game) {
  if (game.appid) return { src: steamPoster(game.appid), fallbackSrc: steamHeader(game.appid) }
  return { src: igdbCover(game.cover), fallbackSrc: null }
}

export function formatHours(minutes) {
  if (!minutes) return null
  const hours = minutes / 60
  if (hours < 1) return `${minutes}m`
  return `${hours < 10 ? Math.round(hours * 10) / 10 : Math.round(hours).toLocaleString()}h`
}
