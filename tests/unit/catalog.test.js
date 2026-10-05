import { describe, expect, it } from 'vitest'
import { addEntry, parseRating } from '../../scripts/lib/catalog'
import { formatHours, gamePoster, igdbCover, tmdbPoster } from '../../src/lib/posters'

describe('addEntry', () => {
  it('adds new entries to the front', () => {
    const list = [{ tmdbId: 1, title: 'Old' }]
    expect(addEntry(list, { tmdbId: 2, title: 'New' }).map((item) => item.title)).toEqual(['New', 'Old'])
  })

  it('moves a re-added entry to the front and keeps its rating and review', () => {
    const list = [
      { tmdbId: 1, title: 'A' },
      { tmdbId: 2, title: 'B', rating: 4, review: 'Great' },
    ]
    expect(addEntry(list, { tmdbId: 2, title: 'B', rating: null })).toEqual([
      { tmdbId: 2, title: 'B', rating: 4, review: 'Great' },
      { tmdbId: 1, title: 'A' },
    ])
  })

  it('matches games by Steam app id or IGDB id', () => {
    const list = [{ appid: 10, title: 'Steam game' }, { igdbId: 20, title: 'Switch game', hours: 5 }]
    expect(addEntry(list, { igdbId: 20, title: 'Switch game', hours: 9 })).toHaveLength(2)
    expect(addEntry(list, { igdbId: 20, title: 'Switch game', hours: 9 })[0].hours).toBe(9)
  })
})

describe('parseRating', () => {
  it.each([['4.5', 4.5], ['5', 5], ['0.5', 0.5], ['', null], [undefined, null]])('parses %s', (input, expected) => {
    expect(parseRating(input)).toBe(expected)
  })

  it.each(['0', '7', '3.3', 'great'])('rejects %s', (input) => {
    expect(() => parseRating(input)).toThrow(/half steps/)
  })
})

describe('poster URLs', () => {
  it('builds provider image URLs', () => {
    expect(tmdbPoster('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg')
    expect(tmdbPoster(null)).toBeNull()
    expect(igdbCover('co2crj')).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co2crj.jpg')
  })

  it('uses Steam art (with a header fallback) for Steam games and IGDB covers otherwise', () => {
    expect(gamePoster({ appid: 730 })).toEqual({
      src: expect.stringContaining('/730/library_600x900.jpg'),
      fallbackSrc: expect.stringContaining('/730/header.jpg'),
    })
    expect(gamePoster({ cover: 'co5vmg' })).toEqual({ src: igdbCover('co5vmg'), fallbackSrc: null })
  })

  it('formats hours', () => {
    expect(formatHours(0)).toBeNull()
    expect(formatHours(NaN)).toBeNull()
    expect(formatHours(45)).toBe('45m')
    expect(formatHours(90)).toBe('1.5h')
    expect(formatHours(140 * 60)).toBe('140h')
    expect(formatHours(1500 * 60)).toBe('1,500h')
  })
})
