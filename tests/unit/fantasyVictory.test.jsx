import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FantasySection from '../../src/components/interests/FantasySection'

// A fresh cached summary renders without touching the network (see useSleeper).
function cacheSummary({ myPoints, opponentPoints, gameStatus, week = 5 }) {
  localStorage.setItem('sleeper_summary_v3', JSON.stringify({
    season: '2026',
    teamName: 'My Team',
    record: { wins: 4, losses: 2, ties: 0 },
    pointsFor: 700,
    rank: 2,
    totalTeams: 10,
    medianGames: false,
    matchup: { week, myPoints, opponentPoints, myLineup: [], opponentLineup: [], gameStatus },
    fetchedAt: Date.now(),
  }))
}

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

  it('stamps a won week once every game is final', () => {
    cacheSummary({ myPoints: 131.4, opponentPoints: 102.2, gameStatus: { KC: 'complete', LV: 'complete' } })
    render(<FantasySection number="01" />)
    expect(screen.getByText(/Week 5 · Final/)).toBeInTheDocument()
    expect(screen.getByText('Won')).toBeInTheDocument()
  })

  it('labels a lost week without celebrating', () => {
    cacheSummary({ myPoints: 90, opponentPoints: 102.2, gameStatus: { KC: 'complete', LV: 'complete' }, week: 6 })
    render(<FantasySection number="01" />)
    expect(screen.getByText('Lost')).toBeInTheDocument()
    expect(screen.queryByText('Won')).not.toBeInTheDocument()
  })

  it('shows no result while games are still to be played', () => {
    cacheSummary({ myPoints: 131.4, opponentPoints: 102.2, gameStatus: { KC: 'complete', LV: 'in_game' }, week: 7 })
    render(<FantasySection number="01" />)
    expect(screen.getByText(/Week 7 matchup/)).toBeInTheDocument()
    expect(screen.queryByText('Won')).not.toBeInTheDocument()
  })
})
