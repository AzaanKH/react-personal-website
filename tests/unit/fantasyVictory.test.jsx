import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { AnimatePresence } from 'motion/react'

// The card reads Sleeper through this hook; tests swap the summary between renders.
const sleeper = vi.hoisted(() => ({ summary: null }))
vi.mock('../../src/hooks/useSleeper', () => ({
  useSleeper: () => ({ summary: sleeper.summary, loading: false, error: null, lastUpdated: null }),
}))

const FINAL = { KC: 'complete', LV: 'complete' }

// Module state (which weeks were celebrated) persists for a page load, so each test
// gets a fresh copy of the module.
async function loadSection() {
  vi.resetModules()
  return (await import('../../src/components/interests/FantasySection')).default
}

function setSummary({ week = 5, myPoints = 131.4, opponentPoints = 102.2, gameStatus = FINAL } = {}) {
  sleeper.summary = {
    season: '2026',
    teamName: 'My Team',
    record: { wins: 4, losses: 2, ties: 0 },
    pointsFor: 700,
    rank: 2,
    totalTeams: 10,
    medianGames: false,
    matchup: { week, myPoints, opponentPoints, myLineup: [], opponentLineup: [], gameStatus },
  }
}

const burst = (container) => container.querySelector('[data-victory-burst]')

describe('fantasy week result', () => {
  beforeEach(() => {
    // The card is "on screen" as soon as it's observed.
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { this.callback = callback }
      observe(target) { this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }]) }
      unobserve() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stamps a won week once every game is final', async () => {
    const FantasySection = await loadSection()
    setSummary()
    const { container } = render(<FantasySection number="01" />)
    expect(screen.getByText(/Week 5 · Final/)).toBeInTheDocument()
    expect(screen.getByText('Won')).toBeInTheDocument()
    expect(burst(container)).toBeInTheDocument()
  })

  it('labels a lost week without celebrating', async () => {
    const FantasySection = await loadSection()
    setSummary({ myPoints: 90 })
    const { container } = render(<FantasySection number="01" />)
    expect(screen.getByText('Lost')).toBeInTheDocument()
    expect(screen.queryByText('Won')).not.toBeInTheDocument()
    expect(burst(container)).toBeNull()
  })

  it('shows no result while games are still to be played', async () => {
    const FantasySection = await loadSection()
    setSummary({ gameStatus: { KC: 'complete', LV: 'in_game' } })
    const { container } = render(<FantasySection number="01" />)
    expect(screen.getByText(/Week 5 matchup/)).toBeInTheDocument()
    expect(screen.queryByText('Won')).not.toBeInTheDocument()
    expect(burst(container)).toBeNull()
  })

  // App wraps pages in <AnimatePresence initial={false}>, which on a direct visit tells
  // every motion element mounted inside it to start at its `animate` values.
  it('starts the confetti from its initial state on a direct visit', async () => {
    const FantasySection = await loadSection()
    setSummary()
    const { container } = render(
      <AnimatePresence initial={false}>
        <div key="page"><FantasySection number="01" /></div>
      </AnimatePresence>,
    )
    const particle = burst(container).firstElementChild
    expect(particle.style.opacity).toBe('1')
    expect(screen.getByText('Won').closest('span').style.opacity).toBe('0')
  })

  it('does not celebrate the same week again after the schedule drops out and recovers', async () => {
    vi.useFakeTimers()
    const FantasySection = await loadSection()
    setSummary()
    const { container, rerender } = render(<FantasySection number="01" />)
    expect(burst(container)).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))
    expect(burst(container)).toBeNull()

    setSummary({ gameStatus: null })
    rerender(<FantasySection number="01" />)
    setSummary()
    rerender(<FantasySection number="01" />)
    expect(screen.getByText('Won')).toBeInTheDocument()
    expect(burst(container)).toBeNull()
  })

  it('celebrates once per week across visits to the page', async () => {
    vi.useFakeTimers()
    const FantasySection = await loadSection()
    setSummary()
    const first = render(<FantasySection number="01" />)
    expect(burst(first.container)).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(3000))
    first.unmount()

    const second = render(<FantasySection number="01" />)
    expect(burst(second.container)).toBeNull()
    second.unmount()

    setSummary({ week: 6 })
    const nextWeek = render(<FantasySection number="01" />)
    expect(burst(nextWeek.container)).toBeInTheDocument()
  })

  it('plays again if the visitor left before the burst finished', async () => {
    const FantasySection = await loadSection()
    setSummary()
    render(<FantasySection number="01" />).unmount()
    const { container } = render(<FantasySection number="01" />)
    expect(burst(container)).toBeInTheDocument()
  })
})
