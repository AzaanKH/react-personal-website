import { describe, expect, it, vi } from 'vitest'
import { buildSteamUrl, clampCount, handleSteamRequest } from '../../netlify/lib/steam.js'

const STEAM_ID = '76561198000000000'
const options = (overrides = {}) => ({
  apiKey: 'secret-key',
  steamId: STEAM_ID,
  fetchImpl: vi.fn(async () => Response.json({ response: { players: [{ steamid: STEAM_ID }] } })),
  ...overrides,
})
const get = (query) => new Request(`https://azaankhalfe.netlify.app/api/steam?${query}`)

describe('steam proxy', () => {
  it('always uses the configured Steam ID, ignoring any steamid parameter', async () => {
    const opts = options()
    const res = await handleSteamRequest(get('endpoint=profile&steamid=76561190000000001'), opts)

    expect(res.status).toBe(200)
    const upstream = opts.fetchImpl.mock.calls[0][0]
    expect(upstream.searchParams.get('steamids')).toBe(STEAM_ID)
    expect(upstream.toString()).not.toContain('76561190000000001')
  })

  it('cannot be used to inject extra upstream parameters', () => {
    const url = buildSteamUrl('recent', { apiKey: 'k', steamId: STEAM_ID, count: '5&key=attacker' })
    expect(url.searchParams.getAll('key')).toEqual(['k'])
    expect(url.searchParams.get('count')).toBe('5')
  })

  it.each([
    ['0', 1], ['-4', 1], ['7', 7], ['1000', 20], ['abc', 10], [null, 10],
  ])('clamps count %s to %s', (input, expected) => {
    expect(clampCount(input)).toBe(expected)
  })

  it('rejects unknown endpoints', async () => {
    const res = await handleSteamRequest(get('endpoint=GetFriendList'), options())
    expect(res.status).toBe(400)
  })

  it('rejects non-GET methods', async () => {
    const res = await handleSteamRequest(new Request('https://x.test/api/steam', { method: 'POST' }), options())
    expect(res.status).toBe(405)
  })

  it('returns 503 without leaking details when unconfigured', async () => {
    const res = await handleSteamRequest(get('endpoint=profile'), options({ apiKey: undefined }))
    expect(res.status).toBe(503)
  })

  it('maps upstream timeouts to 504', async () => {
    const timeout = Object.assign(new Error('timed out'), { name: 'TimeoutError' })
    const res = await handleSteamRequest(
      get('endpoint=profile'),
      options({ fetchImpl: vi.fn(async () => { throw timeout }) }),
    )
    expect(res.status).toBe(504)
  })

  it('does not echo upstream error bodies (which may contain the key)', async () => {
    const fetchImpl = vi.fn(async () => new Response('Forbidden: key=secret-key', { status: 403 }))
    const res = await handleSteamRequest(get('endpoint=profile'), options({ fetchImpl }))

    expect(res.status).toBe(502)
    expect(await res.text()).not.toContain('secret-key')
  })

  it('caches profile responses briefly and adds metadata', async () => {
    const res = await handleSteamRequest(get('endpoint=profile'), options())
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect((await res.json())._metadata.endpoint).toBe('profile')
  })
})
