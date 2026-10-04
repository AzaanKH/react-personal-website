import { describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useSteamData } from '../../src/hooks/useSteamData'

const ENDPOINTS = ['profile', 'recent']
const profile = (name) => Response.json({ response: { players: [{ personaname: name, personastate: 1 }] } })
const recent = () => Response.json({ response: { games: [{ appid: 1, name: 'Hades', playtime_2weeks: 90 }] } })

function routeFetch(handlers) {
  return vi.fn(async (url) => {
    const endpoint = new URL(url, 'https://x.test').searchParams.get('endpoint')
    return handlers[endpoint]()
  })
}

describe('useSteamData', () => {
  it('loads every endpoint through the /api/steam proxy', async () => {
    const fetchMock = routeFetch({ profile: () => profile('azaan'), recent })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSteamData(ENDPOINTS))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.steamData.profile.personaname).toBe('azaan')
    expect(result.current.steamData.recentGames).toHaveLength(1)
    expect(result.current.error).toBeNull()
    expect(result.current.partialFailure).toBe(false)
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/steam?endpoint=profile',
      '/api/steam?endpoint=recent',
    ])
  })

  it('exposes partial failures instead of hiding them', async () => {
    vi.stubGlobal('fetch', routeFetch({
      profile: () => Response.json({ error: 'Steam API timed out' }, { status: 504 }),
      recent,
    }))

    const { result } = renderHook(() => useSteamData(ENDPOINTS))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.partialFailure).toBe(true)
    expect(result.current.errors).toEqual({ profile: 'Steam API timed out' })
    expect(result.current.error).toBeNull()
    expect(result.current.steamData.recentGames).toHaveLength(1)
  })

  it('reports a full failure as an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))

    const { result } = renderHook(() => useSteamData(ENDPOINTS))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toMatch(/unavailable/)
  })

  it('refetch bypasses caches and updates the data', async () => {
    let name = 'before'
    const fetchMock = routeFetch({ profile: () => profile(name), recent })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSteamData(ENDPOINTS))
    await waitFor(() => expect(result.current.steamData.profile?.personaname).toBe('before'))

    name = 'after'
    act(() => result.current.refetch())
    expect(result.current.refreshing).toBe(true)

    await waitFor(() => expect(result.current.steamData.profile.personaname).toBe('after'))
    expect(result.current.refreshing).toBe(false)
    expect(fetchMock.mock.calls.at(-1)[1].cache).toBe('reload')
  })

  it('serves fresh cached data without a network request', async () => {
    const fetchMock = routeFetch({ profile: () => profile('cached'), recent })
    vi.stubGlobal('fetch', fetchMock)
    const first = renderHook(() => useSteamData(ENDPOINTS))
    await waitFor(() => expect(first.result.current.loading).toBe(false))
    first.unmount()
    fetchMock.mockClear()

    const { result } = renderHook(() => useSteamData(ENDPOINTS))
    expect(result.current.loading).toBe(false)
    expect(result.current.usingCache).toBe(true)
    expect(result.current.steamData.profile.personaname).toBe('cached')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('aborts in-flight requests on unmount', async () => {
    let signal
    vi.stubGlobal('fetch', vi.fn((url, init) => {
      signal = init.signal
      return new Promise(() => {})
    }))

    const { unmount } = renderHook(() => useSteamData(['profile']))
    await waitFor(() => expect(signal).toBeDefined())
    unmount()

    expect(signal.aborted).toBe(true)
  })
})
