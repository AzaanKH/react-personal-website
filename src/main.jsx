import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { getPost } from './lib/posts'
import { parseLocation } from './lib/routes'
import './index.css'

const container = document.getElementById('root')

// The build prerenders each page's HTML into #root (vite.config.js) for crawlers and a
// faster first paint. React replaces it on its first commit rather than hydrating it:
// what the app shows depends on the visitor (theme, cached Steam and Sleeper data, the
// clock), so the two would never match exactly.
const start = () =>
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )

// On a prerendered post, load the body first, so the text already on screen isn't
// swapped for the "Loading…" fallback and back.
const { page, slug } = parseLocation(window.location.pathname)
const post = page === 'blog' && slug && container.hasChildNodes() ? getPost(slug) : null
if (post) post.ready().then(start, start)
else start()
