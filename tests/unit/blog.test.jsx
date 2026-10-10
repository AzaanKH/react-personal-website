import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App'
import { routes } from '../../src/lib/routes'

// Fixed posts, so these tests don't depend on what's in src/posts.
vi.mock('../../src/lib/posts', async (importOriginal) => {
  const { formatPostDate } = await importOriginal()
  const Content = ({ components: { Callout } }) => (
    <>
      <h2>Inside the post</h2>
      <Callout title="Note">Rendered via the components map.</Callout>
    </>
  )
  const posts = [
    { slug: 'newer-post', title: 'Newer post', description: 'The newer one', date: '2026-10-09', readingMinutes: 3, draft: false, load: () => {}, Content },
    { slug: 'older-post', title: 'Older post', description: 'The older one', date: '2026-01-02', readingMinutes: 1, draft: false, load: () => {}, Content },
  ]
  return { posts, formatPostDate, getPost: (slug) => posts.find((p) => p.slug === slug) }
})

const nav = () => screen.getByRole('navigation', { name: 'Main navigation' })

describe('blog', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({})))
  })

  it('lists posts newest first with real links', async () => {
    window.history.replaceState(null, '', '/blog')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument()
    const links = within(screen.getByRole('list')).getAllByRole('link')
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/blog/newer-post', '/blog/older-post'])
    expect(links[0]).toHaveTextContent('October 9, 2026')
    expect(links[0]).toHaveTextContent('3 min read')
  })

  it('opens a post client-side, with its own URL, metadata, and focused title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(within(nav()).getByRole('link', { name: 'Blog' }))
    await user.click(await screen.findByRole('link', { name: /older post/i }))

    const heading = await screen.findByRole('heading', { level: 1, name: 'Older post' })
    expect(window.location.pathname).toBe('/blog/older-post')
    expect(document.title).toBe('Older post | Azaan Khalfe')
    expect(screen.getByRole('heading', { level: 2, name: 'Inside the post' })).toBeInTheDocument()
    expect(screen.getByText('Rendered via the components map.')).toBeInTheDocument()
    expect(within(nav()).getByRole('link', { name: 'Blog' })).toHaveAttribute('aria-current', 'page')
    await waitFor(() => expect(heading).toHaveFocus())

    await user.click(screen.getByRole('link', { name: 'All posts' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Blog' })).toBeInTheDocument()
    expect(document.title).toBe(routes.blog.title)
  })

  it('keeps a post URL on direct load (only normalizes the trailing slash)', async () => {
    window.history.replaceState(null, '', '/blog/newer-post/')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Newer post' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/blog/newer-post')
  })

  it('shows "not found" for an unknown post', async () => {
    window.history.replaceState(null, '', '/blog/nope')
    render(<App />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Post not found' })).toBeInTheDocument()
    expect(document.title).toBe(routes.blog.title)
  })
})
