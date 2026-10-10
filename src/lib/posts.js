import { lazy } from 'react'
import entries from 'virtual:blog-posts'

// Every post is src/posts/<slug>.mdx. `virtual:blog-posts` (vite/blogPosts.js) lists each
// one's frontmatter plus a lazy import of its body, a separate chunk loaded when opened.
// Drafts (`draft: true`) are listed under `netlify dev` but left out of production
// builds entirely: not listed, not prerendered, no chunk.
export const posts = entries
  .map(({ meta, load }) => ({ ...meta, load, Content: lazy(load) }))
  .sort((a, b) => b.date.localeCompare(a.date))

export const getPost = (slug) => posts.find((post) => post.slug === slug)

// Dates are plain YYYY-MM-DD; format in UTC so the day never shifts with the reader's zone.
export const formatPostDate = (date) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
