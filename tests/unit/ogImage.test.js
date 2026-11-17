import { describe, expect, it } from 'vitest'
import { postImageSvg, renderPostImage } from '../../vite/ogImage.js'

const options = { dateLabel: 'October 9, 2026', site: 'example.com' }
const titleLines = (svg) => [...svg.matchAll(/font-family="Cormorant Garamond"[^>]*>([^<]*)<\/text>/g)].map((m) => m[1])

describe('post share image', () => {
  it('renders a 1200x630 PNG', () => {
    const png = renderPostImage({ title: 'A post', readingMinutes: 3 }, options)
    expect([...png.subarray(1, 4)].map((b) => String.fromCharCode(b)).join('')).toBe('PNG')
    // IHDR: width and height are big-endian at bytes 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
  })

  it('wraps a long title onto several lines and keeps every word', () => {
    const title = 'Making a codebase agent-friendly with a team of agents'
    const lines = titleLines(postImageSvg({ title, readingMinutes: 25 }, options))
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join(' ')).toBe(title)
  })

  it('cuts a title that cannot fit to four lines ending in an ellipsis', () => {
    const title = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ')
    const lines = titleLines(postImageSvg({ title, readingMinutes: 1 }, options))
    expect(lines).toHaveLength(4)
    expect(lines.at(-1)).toMatch(/…$/)
  })

  it('escapes the title and shows the date, reading time, and site', () => {
    const svg = postImageSvg({ title: 'Tags <b> & more', readingMinutes: 7 }, options)
    expect(svg).toContain('Tags &lt;b&gt; &amp; more')
    expect(svg).toContain('October 9, 2026  ·  7 min read')
    expect(svg).toContain('example.com')
  })
})
