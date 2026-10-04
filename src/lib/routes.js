export const SITE_URL = 'https://azaankhalfe.netlify.app'

// Keep paths in sync with the [[redirects]] SPA routes in netlify.toml.
export const routes = {
  home: {
    path: '/',
    label: 'Home',
    title: 'Azaan Khalfe | Software Engineer',
    description:
      'Azaan Khalfe is a software engineer building polished web experiences, developer tools, and interactive projects with React.',
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    title: 'Projects | Azaan Khalfe',
    description:
      'Case studies from Azaan Khalfe: an MCP server for local dev environments, an XGBoost fantasy football predictor, and a Paxos consensus simulation.',
  },
  gaming: {
    path: '/gaming',
    label: 'Gaming',
    title: 'Gaming | Azaan Khalfe',
    description: 'What Azaan Khalfe has been playing recently, pulled from the Steam Web API.',
  },
  contact: {
    path: '/contact',
    label: 'Contact',
    title: 'Contact | Azaan Khalfe',
    description: 'Get in touch with Azaan Khalfe about roles, projects, or interesting engineering problems.',
  },
}

export const pageIds = Object.keys(routes)

export function getPageFromPath(pathname) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return pageIds.find((id) => routes[id].path === normalizedPath) ?? 'home'
}

function setMeta(selector, attribute, value) {
  document.head.querySelector(selector)?.setAttribute(attribute, value)
}

// index.html ships the home page's metadata; this keeps it accurate after
// client-side navigation (tab title, history entries, share previews from JS crawlers).
export function applyPageMetadata(page) {
  const { path, title, description } = routes[page]
  const url = `${SITE_URL}${path === '/' ? '/' : path}`

  document.title = title
  setMeta('meta[name="description"]', 'content', description)
  setMeta('link[rel="canonical"]', 'href', url)
  setMeta('meta[property="og:url"]', 'content', url)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', description)
  setMeta('meta[name="twitter:title"]', 'content', title)
  setMeta('meta[name="twitter:description"]', 'content', description)
}
