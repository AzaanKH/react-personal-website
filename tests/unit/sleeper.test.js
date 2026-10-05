import { describe, expect, it, vi } from 'vitest'
import { fetchSleeperSummary, playerGameState, summarizeLeague, weekGameStatus } from '../../src/lib/sleeper'

const ME = 'me'
const roster = (rosterId, ownerId, wins, losses, fpts, fptsDecimal = 0) => ({
  roster_id: rosterId,
  owner_id: ownerId,
  settings: { wins, losses, ties: 0, fpts, fpts_decimal: fptsDecimal },
})

const fixture = {
  state: { season_type: 'regular', display_week: 4, week: 4, league_season: '2026' },
  league: {
    league_id: 'L1',
    name: 'Test League',
    season: '2026',
    settings: { league_average_match: 1 },
    roster_positions: ['QB', 'RB', 'FLEX', 'BN', 'BN'],
  },
  rosters: [
    roster(1, 'a', 5, 1, 503, 70),
    roster(2, ME, 5, 1, 478, 90),
    roster(3, 'b', 6, 0, 400),
    roster(4, 'c', 0, 6, 294, 50),
  ],
  users: [
    { user_id: ME, display_name: 'Me', metadata: { team_name: 'My Team' } },
    { user_id: 'a', display_name: 'Other', metadata: { team_name: 'Rude Name' } },
  ],
  matchups: [
    { roster_id: 2, matchup_id: 1, points: 125.92, starters: ['4943', '0', 'KC'], starters_points: [20.5, 0, 9] },
    { roster_id: 1, matchup_id: 1, points: 122, starters: ['111', '222', '333'], starters_points: [10, 12, 14] },
    { roster_id: 3, matchup_id: 2, points: 90 },
    { roster_id: 4, matchup_id: 2, points: 80 },
  ],
}

describe('summarizeLeague', () => {
  it('summarizes my record, rank, and this week’s matchup', () => {
    expect(summarizeLeague({ ...fixture, userId: ME })).toEqual({
      season: '2026',
      teamName: 'My Team',
      record: { wins: 5, losses: 1, ties: 0 },
      pointsFor: 478.9,
      // Behind 6-0, and behind the other 5-1 team on points for.
      rank: 3,
      totalTeams: 4,
      medianGames: true,
      matchup: {
        week: 4,
        myPoints: 125.92,
        opponentPoints: 122,
        // Bench slots are dropped; an empty slot ("0") has no player.
        myLineup: [
          { slot: 'QB', playerId: '4943', points: 20.5 },
          { slot: 'RB', playerId: null, points: 0 },
          { slot: 'FLEX', playerId: 'KC', points: 9 },
        ],
        opponentLineup: [
          { slot: 'QB', playerId: '111', points: 10 },
          { slot: 'RB', playerId: '222', points: 12 },
          { slot: 'FLEX', playerId: '333', points: 14 },
        ],
        gameStatus: null,
      },
    })
  })

  it('never includes another team’s name or anything that identifies the league', () => {
    const serialized = JSON.stringify(summarizeLeague({ ...fixture, userId: ME }))
    expect(serialized).not.toContain('Rude Name')
    expect(serialized).not.toContain('Test League')
    expect(serialized).not.toContain('L1')
  })

  it('has no matchup outside the season or on a bye', () => {
    const offseason = { ...fixture, state: { ...fixture.state, season_type: 'off' } }
    expect(summarizeLeague({ ...offseason, userId: ME }).matchup).toBeNull()

    const bye = { ...fixture, matchups: [{ roster_id: 2, matchup_id: null, points: 0 }] }
    expect(summarizeLeague({ ...bye, userId: ME }).matchup).toBeNull()
  })

  it('returns null when the user has no roster in the league', () => {
    expect(summarizeLeague({ ...fixture, userId: 'nobody' })).toBeNull()
  })
})

describe('fetchSleeperSummary', () => {
  it('finds this season’s league by name and fetches the current week', async () => {
    const responses = {
      '/state/nfl': fixture.state,
      [`/user/${ME}/leagues/nfl/2026`]: [{ league_id: 'X', name: 'Another' }, fixture.league],
      '/league/L1/rosters': fixture.rosters,
      '/league/L1/users': fixture.users,
      '/league/L1/matchups/4': fixture.matchups,
      'https://api.sleeper.app/schedule/nfl/regular/2026': [
        { week: 4, home: 'CAR', away: 'DET', status: 'pre_game' },
        { week: 3, home: 'KC', away: 'LV', status: 'complete' },
      ],
    }
    const fetchMock = vi.fn(async (url) => Response.json(responses[url.replace('https://api.sleeper.app/v1', '')]))
    vi.stubGlobal('fetch', fetchMock)

    const summary = await fetchSleeperSummary({ userId: ME, leagueName: 'Test League' })

    expect(summary.season).toBe('2026')
    expect(summary.matchup.myPoints).toBe(125.92)
    expect(summary.matchup.gameStatus).toEqual({ CAR: 'pre_game', DET: 'pre_game' })
    expect(fetchMock).toHaveBeenCalledTimes(6)
  })

  it('still summarizes when the (undocumented) schedule endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url.includes('/schedule/')) return new Response('', { status: 500 })
      const path = url.replace('https://api.sleeper.app/v1', '')
      const responses = {
        '/state/nfl': fixture.state,
        [`/user/${ME}/leagues/nfl/2026`]: [fixture.league],
        '/league/L1/rosters': fixture.rosters,
        '/league/L1/users': fixture.users,
        '/league/L1/matchups/4': fixture.matchups,
      }
      return Response.json(responses[path])
    }))
    const summary = await fetchSleeperSummary({ userId: ME, leagueName: 'Test League' })
    expect(summary.matchup.myPoints).toBe(125.92)
    expect(summary.matchup.gameStatus).toBeNull()
  })

  it('rejects when Sleeper fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })))
    await expect(fetchSleeperSummary({ userId: ME })).rejects.toThrow('503')
  })
})

describe('game state', () => {
  const status = weekGameStatus(
    [
      { week: 4, home: 'CAR', away: 'DET', status: 'pre_game' },
      { week: 4, home: 'LV', away: 'KC', status: 'complete' },
      { week: 4, home: 'NO', away: 'ATL', status: 'in_game' },
      { week: 5, home: 'PHI', away: 'DAL', status: 'pre_game' },
    ],
    4,
  )

  it.each([
    ['DET', 'upcoming'],
    ['KC', 'final'],
    ['ATL', 'live'],
    ['PHI', 'bye'],
  ])('%s is %s', (team, expected) => {
    expect(playerGameState(status, team)).toBe(expected)
  })

  it('is unknown without a schedule or a team', () => {
    expect(playerGameState(null, 'DET')).toBeNull()
    expect(playerGameState(status, null)).toBeNull()
  })
})
