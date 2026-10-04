import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { routes } from '../../src/lib/routes'

function stubNetwork() {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ temp: 60, condition: 'Clear', icon: 'sun', text: 'Sunny' })))
}

const nav = () => screen.getByRole('navigation', { name: 'Main navigation' })
const navLink = (name) => within(nav()).getByRole('link', { name })


describe('navigation', () => {
  beforeEach(stubNetwork)

  it('renders real links for every page', () => {
    render(<App />)
    for (const route of Object.values(routes)) {
      expect(navLink(route.label)).toHaveAttribute('href', route.path)
    }
    expect(navLink('Home')).toHaveAttribute('aria-current', 'page')
  })

  it('offers a skip link to the main content', () => {
    render(<App />)
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(document.getElementById('main')).toBeInTheDocument()
  })

  it('navigates client-side, updates the URL and metadata, and focuses the new heading', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(navLink('Projects'))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Projects' })
    expect(window.location.pathname).toBe('/projects')
    expect(document.title).toBe(routes.projects.title)
    expect(navLink('Projects')).toHaveAttribute('aria-current', 'page')
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('does not move focus on the initial page load', async () => {
    window.history.replaceState(null, '', '/contact')
    render(<App />)

    const heading = await screen.findByRole('heading', { level: 1 })
    expect(heading).not.toHaveFocus()
    expect(document.title).toBe(routes.contact.title)
  })

  it('follows browser back/forward via popstate', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(navLink('Contact'))
    await screen.findByRole('heading', { level: 1, name: /say/i })

    window.history.pushState(null, '', '/projects')
    fireEvent.popState(window)

    expect(await screen.findByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
  })

  it('leaves modifier-clicks to the browser (open in new tab)', () => {
    render(<App />)
    const link = navLink('Projects')
    const notPrevented = fireEvent.click(link, { ctrlKey: true })

    expect(notPrevented).toBe(true)
    expect(window.location.pathname).toBe('/')
  })

  it('links to projects from the home page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: /view projects/i }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument()
  })
})
