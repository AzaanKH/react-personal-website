import { describe, expect, it } from 'vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { STORAGE_KEY, useDarkMode } from '../../src/hooks/useDarkMode'
import DarkModeToggle from '../../src/components/DarkModeToggle'
import { installMatchMedia } from '../setup'

function ThemeHarness() {
  const { theme, setTheme } = useDarkMode()
  return <DarkModeToggle theme={theme} setTheme={setTheme} isHome />
}

describe('useDarkMode', () => {
  it('defaults to the system theme', () => {
    installMatchMedia(true)
    const { result } = renderHook(() => useDarkMode())

    expect(result.current.theme).toBe('system')
    expect(result.current.resolvedTheme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
  })

  it('persists an explicit choice and restores it on the next visit', () => {
    const first = renderHook(() => useDarkMode())
    act(() => first.result.current.setTheme('dark'))

    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    first.unmount()

    const second = renderHook(() => useDarkMode())
    expect(second.result.current.theme).toBe('dark')
    expect(second.result.current.resolvedTheme).toBe('dark')
  })

  it('an explicit light choice overrides a dark system preference', () => {
    installMatchMedia(true)
    localStorage.setItem(STORAGE_KEY, 'light')
    const { result } = renderHook(() => useDarkMode())

    expect(result.current.resolvedTheme).toBe('light')
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('ignores corrupt stored values', () => {
    localStorage.setItem(STORAGE_KEY, 'purple')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.theme).toBe('system')
  })
})

describe('DarkModeToggle', () => {
  it('cycles system -> light -> dark -> system and saves each step', async () => {
    const user = userEvent.setup()
    render(<ThemeHarness />)

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light')

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')

    await user.click(screen.getByRole('button', { name: 'Switch to system theme' }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system')
  })
})
