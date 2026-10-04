import { handleSteamRequest } from '../lib/steam.js'

export default async (req) =>
  handleSteamRequest(req, {
    apiKey: Netlify.env.get('STEAM_API_KEY'),
    steamId: Netlify.env.get('STEAM_ID'),
  })

export const config = {
  path: '/api/steam',
  // Platform-enforced: protects the Steam API key's quota from request floods.
  rateLimit: {
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
