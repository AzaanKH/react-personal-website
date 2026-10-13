import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import ProjectsPage from '../../src/pages/ProjectsPage'

// Reports every observed element as on screen, so the demo cycles.
class VisibleObserver {
  constructor(callback) { this.callback = callback }
  observe(target) { this.callback([{ isIntersecting: true, intersectionRatio: 1, target }], this) }
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}

describe('NotchRouter demo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('IntersectionObserver', VisibleObserver)
  })
  afterEach(() => vi.useRealTimers())

  const caption = (text) => screen.queryByText(text)
  const advance = () => act(() => { vi.advanceTimersByTime(3000) })

  it('cycles while on screen and stops when paused, without toggling the card', () => {
    render(<ProjectsPage />)
    expect(caption('Codex hook · Working')).toBeInTheDocument()

    advance()
    expect(caption('Hover · peek with shortcuts')).toBeInTheDocument()

    const pause = screen.getByRole('button', { name: 'Pause animation' })
    expect(pause.closest('button[aria-expanded]')).toBeNull()
    fireEvent.click(pause)
    expect(screen.getByRole('button', { name: /NotchRouter/ })).toHaveAttribute('aria-expanded', 'false')

    advance()
    advance()
    expect(caption('Hover · peek with shortcuts')).toBeInTheDocument()

    // The peek holds longer (3.4 s) than a collapsed state, and resuming restarts its timer.
    fireEvent.click(screen.getByRole('button', { name: 'Play animation' }))
    advance()
    advance()
    expect(caption('Permission request · Needs review')).toBeInTheDocument()
  })
})
