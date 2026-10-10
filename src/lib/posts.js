import { lazy } from 'react'

// Every post is src/posts/<slug>.mdx. Two imports per file:
// - `?meta` (eager): just the frontmatter as JSON (see blogPostMeta in vite.config.js),
//   so the index lists every post without bundling any post body.
// - the .mdx itself (lazy): the post component, a separate chunk loaded when opened.
const metas = import.meta.glob('../posts/*.mdx', { eager: true, query: '?meta', import: 'default' })
const loaders = import.meta.glob('../posts/*.mdx')

// Newest first. Drafts (`draft: true`) show under `netlify dev` but not in production,
// and the build doesn't prerender them.
export const posts = Object.entries(metas)
  .filter(([, meta]) => import.meta.env.DEV || !meta.draft)
  .map(([file, meta]) => ({ ...meta, load: loaders[file], Content: lazy(loaders[file]) }))
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
