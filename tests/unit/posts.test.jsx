import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { posts } from '../../src/lib/posts'
import { mdxComponents } from '../../src/lib/mdxComponents'

// Runs against the real src/posts, so a post that fails to compile or render fails `npm test`.
describe('posts', () => {
  it('are sorted newest first with unique slugs', () => {
    const dates = posts.map((p) => p.date)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length)
  })

  it.each(posts.map((p) => [p.slug, p]))('%s renders without an h1', async (_, post) => {
    const { default: Content } = await post.load()
    const { container } = render(<Content components={mdxComponents} />)
    expect(container.textContent.trim()).not.toBe('')
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })
})
