import { afterEach, describe, expect, it, vi } from 'vitest'
import { PLAYERS_TTL_MS, loadNflPlayers, resetNflPlayersCache } from '../../src/lib/nflPlayers'

const playersResponse = (players) => Promise.resolve(Response.json({ players }))

describe('loadNflPlayers', () => {
  afterEach(() => {
    resetNflPlayersCache()
    vi.useRealTimers()
  })

  it('shares one request between calls made while it is in flight', async () => {
    const fetchMock = vi.fn(() => playersResponse({ 1: ['A', 'QB', 'KC'] }))
    vi.stubGlobal('fetch', fetchMock)

    const [first, second] = await Promise.all([loadNflPlayers(), loadNflPlayers()])

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('serves the stored list within a day, then fetches fresh data once it expires', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-04T12:00:00Z'))
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => playersResponse({ 1: ['Old Name', 'QB', 'KC'] }))
      .mockImplementationOnce(() => playersResponse({ 1: ['New Name', 'QB', 'KC'] }))
    vi.stubGlobal('fetch', fetchMock)

    expect((await loadNflPlayers())[1][0]).toBe('Old Name')
    expect((await loadNflPlayers())[1][0]).toBe('Old Name') // from localStorage
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.setSystemTime(Date.now() + PLAYERS_TTL_MS + 1000)
    expect((await loadNflPlayers())[1][0]).toBe('New Name')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries after a failed request', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(new Response('', { status: 502 })))
      .mockImplementationOnce(() => playersResponse({ 1: ['A', 'QB', 'KC'] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(loadNflPlayers()).rejects.toThrow('502')
    await expect(loadNflPlayers()).resolves.toEqual({ 1: ['A', 'QB', 'KC'] })
  })
})
