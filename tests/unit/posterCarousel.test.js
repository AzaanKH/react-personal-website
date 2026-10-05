import { describe, expect, it } from 'vitest'
import { thumbGeometry, wrapPosition } from '../../src/lib/carousel'

describe('wrapPosition', () => {
  // One copy is 1000px wide; the middle copy starts at 1000.
  it.each([
    [1000, 1000],
    [1499, 1499],
    [1500, 500], // drifted half a copy right: jump back one copy
    [499, 1499], // drifted half a copy left: jump forward one copy
  ])('keeps %i near the middle copy (%i)', (position, expected) => {
    expect(wrapPosition(position, 1000)).toBe(expected)
  })

  it('leaves the position alone before the row is measured', () => {
    expect(wrapPosition(42, 0)).toBe(42)
  })
})

describe('thumbGeometry', () => {
  it('sizes the thumb to the visible share of one copy and places it by progress', () => {
    expect(thumbGeometry(1250, 1000, 400)).toEqual({ left: 25, width: 40, wrapWidth: 0, fraction: 0.25 })
  })

  it('wraps the overflow of a thumb past the end back to the start', () => {
    const { left, width, wrapWidth } = thumbGeometry(1900, 1000, 400)
    expect(left).toBeCloseTo(90)
    expect(width).toBe(40)
    expect(wrapWidth).toBeCloseTo(30)
  })

  it('treats positions in the outer copies like the middle one', () => {
    expect(thumbGeometry(600, 1000, 400).fraction).toBeCloseTo(0.6)
  })

  it('keeps a minimum thumb width for long rows', () => {
    expect(thumbGeometry(1000, 10000, 300).width).toBe(8)
  })
})

describe('wrapPosition while a poster has focus', () => {
  it('holds the position instead of wrapping, so the focused link stays on screen', () => {
    expect(wrapPosition(1600, 1000, true)).toBe(1600)
    expect(wrapPosition(1600, 1000, false)).toBe(600)
  })
})
