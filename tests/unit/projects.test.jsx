import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import ErrorBoundary from '../../src/components/ErrorBoundary'
import { projects } from '../../src/data/projects'
import { routes } from '../../src/lib/routes'

const root = path.resolve(import.meta.dirname, '../..')
const card = (name) => screen.getByRole('heading', { level: 2, name }).closest('button')

describe('project links', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})))
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('gives every project a unique URL-safe slug that no screenshot path uses', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    // public/projects/<name> and dist/projects/<slug>.html would be served at one path.
    const taken = readdirSync(path.join(root, 'public/projects')).map((name) => name.replace(/\.[^.]+$/, ''))
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      expect(taken).not.toContain(slug)
    }
  })

  it('opens the linked project on a direct visit, with its own title', async () => {
    window.history.replaceState(null, '', '/projects/paxos')
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'Projects' })
    expect(card('Distributed Paxos Consensus')).toHaveAttribute('aria-expanded', 'true')
    expect(card('NotchRouter')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('heading', { level: 3, name: /case study/i })).toBeInTheDocument()
    expect(document.title).toBe('Distributed Paxos Consensus | Projects | Azaan Khalfe')
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  })

  it('puts the open card in the URL without adding history or moving focus', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/projects')
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: 'Projects' })
    const entries = window.history.length

    await user.click(card('DevEnv MCP Server'))
    expect(window.location.pathname).toBe('/projects/devenv-mcp')
    expect(card('DevEnv MCP Server')).toHaveAttribute('aria-expanded', 'true')
    expect(card('DevEnv MCP Server')).toHaveFocus()

    await user.click(card('DevEnv MCP Server'))
    expect(window.location.pathname).toBe('/projects')
    expect(document.title).toBe(routes.projects.title)
    expect(window.history.length).toBe(entries)
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()
  })

  it('shows the list with nothing open for an unknown project', async () => {
    window.history.replaceState(null, '', '/projects/nope')
    render(<App />)

    await screen.findByRole('heading', { level: 1, name: 'Projects' })
    expect(screen.queryByRole('heading', { level: 3, name: /case study/i })).toBeNull()
    expect(document.title).toBe(routes.projects.title)
  })
})

describe('deploy config', () => {
  const toml = readFileSync(path.join(root, 'netlify.toml'), 'utf8')

  it('has a Netlify rewrite for every page and for project and post links', () => {
    for (const { path: pagePath } of Object.values(routes)) {
      if (pagePath !== '/') expect(toml).toContain(`from = "${pagePath}"`)
    }
    expect(toml).toContain('from = "/projects/*"')
    expect(toml).toContain('from = "/blog/*"')
  })

  // The build checks this too (on the built page); this catches it at `npm test`.
  it('allows the inline theme script in the Content-Security-Policy by its hash', () => {
    const html = readFileSync(path.join(root, 'index.html'), 'utf8').replace(/\r\n/g, '\n')
    const [, themeScript] = /<script>([\s\S]*?)<\/script>/.exec(html)
    const hash = createHash('sha256').update(themeScript).digest('base64')
    expect(toml).toContain(`'sha256-${hash}'`)
  })

  it('ships a robots.txt that points at the sitemap', () => {
    expect(existsSync(path.join(root, 'public/robots.txt'))).toBe(true)
    expect(readFileSync(path.join(root, 'public/robots.txt'), 'utf8')).toContain('Sitemap: https://azaankhalfe.netlify.app/sitemap.xml')
  })
})

describe('ErrorBoundary', () => {
  const Broken = () => {
    throw new Error('boom')
  }

  it('replaces a page that throws with a heading and a reload button', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ErrorBoundary><Broken /></ErrorBoundary>)

    expect(screen.getByRole('heading', { level: 1, name: /something broke/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeInTheDocument()
  })

  it('keeps the rest of the page when a section throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <>
        <ErrorBoundary compact><Broken /></ErrorBoundary>
        <p>Still here</p>
      </>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('This section failed to load')
    expect(screen.getByText('Still here')).toBeInTheDocument()
  })
})
