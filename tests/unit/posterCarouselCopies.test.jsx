import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import PosterCard, { PosterShelf } from '../../src/components/interests/PosterCard'

// The duplicate copies scroll into view, so their posters must stay clickable (never
// `inert`) while staying out of the Tab order and away from screen readers.
describe('PosterCarousel copies', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      disconnect() {}
    })
  })

  const posters = Array.from({ length: 8 }, (_, i) => (
    <PosterCard key={i} title={`Movie ${i}`} src={null} href={`https://example.com/${i}`} />
  ))

  it('renders three copies; only the middle one is tabbable and exposed', () => {
    const { container } = render(<PosterShelf label="Movies" rotate>{posters}</PosterShelf>)
    const [before, middle, after] = container.querySelectorAll('[data-copy]')

    for (const copy of [before, after]) {
      expect(copy).toHaveAttribute('aria-hidden', 'true')
      expect(copy).not.toHaveAttribute('inert')
      for (const link of copy.querySelectorAll('a')) expect(link).toHaveAttribute('tabindex', '-1')
    }

    expect(middle).not.toHaveAttribute('aria-hidden')
    for (const link of middle.querySelectorAll('a')) expect(link).not.toHaveAttribute('tabindex')
    expect(container.querySelectorAll('[inert]')).toHaveLength(0)
  })

  // Leaving the page removes the row, which fires the ResizeObserver after React has
  // nulled the refs but before the effect cleanup disconnects it.
  it('ignores a resize that arrives after the row unmounts', () => {
    const callbacks = []
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) { callbacks.push(callback) }
      observe() {}
      disconnect() {}
    })

    const { unmount } = render(<PosterShelf label="Movies" rotate>{posters}</PosterShelf>)
    unmount()

    expect(callbacks).not.toHaveLength(0)
    for (const callback of callbacks) expect(() => callback([])).not.toThrow()
  })
})
