import { renderToString } from 'react-dom/server'
import App from './App'
import { getPost } from './lib/posts'
import { parseLocation } from './lib/routes'

// Build time only (the prerender plugin in vite.config.js builds and imports this):
// returns the app's HTML for one path. Effects don't run here, so nothing is fetched;
// live sections (Steam, Sleeper, weather) come out in their loading state.
export async function render(pathname) {
  const { page, slug } = parseLocation(pathname)
  if (page === 'blog' && slug) await getPost(slug)?.ready()
  return renderToString(<App initialPath={pathname} />)
}
