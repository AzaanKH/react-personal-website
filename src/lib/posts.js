import { lazy } from 'react'
import entries from 'virtual:blog-posts'

// Every post is src/posts/<slug>.mdx. `virtual:blog-posts` (vite/blogPosts.js) lists each
// one's frontmatter plus a lazy import of its body, a separate chunk loaded when opened.
// Drafts (`draft: true`) are listed under `netlify dev` but left out of production
// builds entirely: not listed, not prerendered, no chunk.
//
// `ready()` loads the body and swaps `Content` for the loaded component, so it renders
// without a Suspense fallback. The prerender needs that to emit the post's text, and
// main.jsx uses it on a direct visit so prerendered text isn't replaced by "Loading…".
export const posts = entries
  .map(({ meta, load }) => {
    const post = { ...meta, load, Content: lazy(load) }
    post.ready = () => load().then((module) => { post.Content = module.default })
    return post
  })
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
