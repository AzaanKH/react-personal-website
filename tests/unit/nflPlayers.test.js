import { describe, expect, it, vi } from 'vitest'
import { CDN_MAX_AGE, handleNflPlayersRequest, trimPlayers } from '../../netlify/lib/nflPlayers'

const upstreamPlayers = {
  4943: { full_name: 'Joe Burrow', position: 'QB', team: 'CIN', active: true, college: 'LSU', height: '76' },
  KC: { first_name: 'Kansas City', last_name: 'Chiefs', position: 'DEF', team: 'KC', active: false },
  9: { full_name: 'Free Agent', position: 'WR', team: null, active: true },
  10: { full_name: 'Retired Guy', position: 'RB', team: null, active: false },
  11: { full_name: 'Some Linebacker', position: 'LB', team: 'NYJ', active: true },
}

describe('trimPlayers', () => {
  it('keeps name, position, and team for active fantasy players and team defenses', () => {
    expect(trimPlayers(upstreamPlayers)).toEqual({
      4943: ['Joe Burrow', 'QB', 'CIN'],
      KC: ['Kansas City Chiefs', 'DEF', 'KC'],
      9: ['Free Agent', 'WR', null],
    })
  })
})

describe('handleNflPlayersRequest', () => {
  const request = (method = 'GET') => new Request('https://example.com/api/nfl-players?bust=1', { method })

  it('returns trimmed players with a day-long, query-independent CDN cache', async () => {
    const fetchImpl = vi.fn(async () => Response.json(upstreamPlayers))
    const response = await handleNflPlayersRequest(request(), { fetchImpl })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.players['4943']).toEqual(['Joe Burrow', 'QB', 'CIN'])
    expect(response.headers.get('Netlify-CDN-Cache-Control')).toContain(`max-age=${CDN_MAX_AGE}`)
    expect(response.headers.get('Netlify-CDN-Cache-Control')).toContain('durable')
    expect(response.headers.get('Netlify-Vary')).toBe('query=none')
  })

  it('rejects other methods', async () => {
    const response = await handleNflPlayersRequest(request('POST'), { fetchImpl: vi.fn() })
    expect(response.status).toBe(405)
  })

  it('maps upstream failures to uncached 502/504s', async () => {
    const failed = await handleNflPlayersRequest(request(), { fetchImpl: async () => new Response('', { status: 500 }) })
    expect(failed.status).toBe(502)
    expect(failed.headers.get('Cache-Control')).toBe('no-store')

    const timeout = Object.assign(new Error('timeout'), { name: 'TimeoutError' })
    const timedOut = await handleNflPlayersRequest(request(), { fetchImpl: async () => { throw timeout } })
    expect(timedOut.status).toBe(504)
  })
})
