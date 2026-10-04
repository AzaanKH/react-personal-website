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

// Head tags that change per page. index.html must contain each one with the key
// attribute first (e.g. `<meta name="description" content="...">`): the build
// rewrites them as strings, and the browser updates them via these selectors.
const HEAD_TAGS = [
  { tag: 'meta', key: ['name', 'description'], attribute: 'content', field: 'description' },
  { tag: 'link', key: ['rel', 'canonical'], attribute: 'href', field: 'url' },
  { tag: 'meta', key: ['property', 'og:url'], attribute: 'content', field: 'url' },
  { tag: 'meta', key: ['property', 'og:title'], attribute: 'content', field: 'title' },
  { tag: 'meta', key: ['property', 'og:description'], attribute: 'content', field: 'description' },
  { tag: 'meta', key: ['name', 'twitter:title'], attribute: 'content', field: 'title' },
  { tag: 'meta', key: ['name', 'twitter:description'], attribute: 'content', field: 'description' },
]

export function getPageMetadata(page) {
  const { path, title, description } = routes[page]
  return { title, description, url: `${SITE_URL}${path}` }
}

// index.html ships the home page's metadata; this keeps it accurate after
// client-side navigation (tab title, history entries, share previews from JS crawlers).
export function applyPageMetadata(page) {
  const metadata = getPageMetadata(page)
  document.title = metadata.title
  for (const { tag, key: [keyName, keyValue], attribute, field } of HEAD_TAGS) {
    document.head.querySelector(`${tag}[${keyName}="${keyValue}"]`)?.setAttribute(attribute, metadata[field])
  }
}

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Build time (see vite.config.js): returns index.html with `page`'s head tags, so
// crawlers and link unfurlers that don't run JavaScript see the right metadata.
// Throws if a tag is missing, so an edit to index.html can't silently break this.
export function renderPageHead(html, page) {
  const metadata = getPageMetadata(page)
  const replaceOnce = (pattern, replacement, label) => {
    if (!pattern.test(html)) throw new Error(`renderPageHead: index.html has no ${label}`)
    html = html.replace(pattern, replacement)
  }

  replaceOnce(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(metadata.title)}</title>`, '<title>')
  for (const { tag, key: [keyName, keyValue], attribute, field } of HEAD_TAGS) {
    const pattern = new RegExp(`(<${tag}\\s+${keyName}="${keyValue}"\\s+${attribute}=")[^"]*(")`)
    replaceOnce(pattern, (_, start, end) => `${start}${escapeHtml(metadata[field])}${end}`, `${tag}[${keyName}="${keyValue}"]`)
  }
  return html
}
