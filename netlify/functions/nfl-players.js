import { handleNflPlayersRequest } from '../lib/nflPlayers.js'

export default async (req) => handleNflPlayersRequest(req)

// No platform rate limit: the free plan's two rules are used by contact and steam-proxy.
// The response is CDN-cached for a day and the cache key ignores the query string, so
// repeat requests are served by the CDN without invoking this function.
export const config = {
  path: '/api/nfl-players',
}
