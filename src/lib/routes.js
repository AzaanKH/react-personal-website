export const SITE_URL = 'https://azaankhalfe.netlify.app'

// Keep paths in sync with the [[redirects]] SPA routes in netlify.toml.
export const routes = {
  home: {
    path: '/',
    label: 'Home',
    title: 'Azaan Khalfe | Software Engineer',
    description:
      'Azaan Khalfe is a software engineer building developer tools, intelligent systems, and polished web experiences.',
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    title: 'Projects | Azaan Khalfe',
    description:
      'Case studies from Azaan Khalfe: a macOS notch panel for AI agents, an MCP server for local dev environments, a fantasy football draft assistant, a start/sit predictor, and a Paxos-replicated key-value store.',
  },
  interests: {
    path: '/interests',
    // Old URLs that still resolve here. netlify.toml 301s them too; keep both in sync.
    aliases: ['/gaming'],
    label: 'Interests',
    title: 'Interests | Azaan Khalfe',
    description:
      'Off the clock with Azaan Khalfe: fantasy football on Sleeper, games from Steam and beyond, and favorite movies, shows, and anime.',
  },
  blog: {
    path: '/blog',
    label: 'Blog',
    title: 'Blog | Azaan Khalfe',
    description: 'Writing by Azaan Khalfe: interactive posts on web engineering, tools, and the things I build.',
  },
  about: {
    path: '/about',
    // In the nav from md up only: six labels don't fit the phone pill (they touch at
    // 360px and overflow at 320px). On phones Home links here instead.
    navDesktopOnly: true,
    label: 'About',
    title: 'About | Azaan Khalfe',
    description:
      'About Azaan Khalfe: software engineer, Microsoft intern alum, University of Washington CS graduate, and Master of Computer Science student at Arizona State University.',
  },
  contact: {
    path: '/contact',
    label: 'Contact',
    title: 'Contact | Azaan Khalfe',
    description: 'Get in touch with Azaan Khalfe about roles, projects, or interesting engineering problems.',
  },
}

export const pageIds = Object.keys(routes)

const normalizePath = (pathname) => (pathname === '/' ? '/' : pathname.replace(/\/+$/, ''))
// Pages with children: /blog/<slug> is a post, /projects/<slug> is that page with one
// project's case study open.
const SLUG_PATH = /^\/(blog|projects)\/(.+)$/

export const slugPath = (page, slug) => `${routes[page].path}/${slug}`
export const postPath = (slug) => slugPath('blog', slug)

// Anything under /blog/ or /projects/ keeps its page, even a malformed slug like
// /blog/not_found or /blog/a/b, so it reaches BlogPostPage's "Post not found" (or the
// projects list with nothing open), matching netlify.toml's /blog/* and /projects/*
// rewrites, instead of falling back to home. Whether the slug is real is checked by the
// page (lib/posts.js, data/projects.js), since this file also runs in vite.config.js.
// The URL state App keeps: a page, plus a slug on those child paths.
export function parseLocation(pathname) {
  const normalizedPath = normalizePath(pathname)
  const child = SLUG_PATH.exec(normalizedPath)
  if (child) return { page: child[1], slug: child[2] }
  const page =
    pageIds.find((id) => routes[id].path === normalizedPath || routes[id].aliases?.includes(normalizedPath)) ?? 'home'
  return { page, slug: null }
}

export const getPageFromPath = (pathname) => parseLocation(pathname).page

export const locationPath = ({ page, slug }) => (slug ? slugPath(page, slug) : routes[page].path)

// Head tags that change per page. index.html must contain each one with the key
// attribute first (e.g. `<meta name="description" content="...">`): the build
// rewrites them as strings, and the browser updates them via these selectors.
const HEAD_TAGS = [
  { tag: 'meta', key: ['name', 'description'], attribute: 'content', field: 'description' },
  { tag: 'link', key: ['rel', 'canonical'], attribute: 'href', field: 'url' },
  { tag: 'meta', key: ['property', 'og:url'], attribute: 'content', field: 'url' },
  { tag: 'meta', key: ['property', 'og:type'], attribute: 'content', field: 'type' },
  { tag: 'meta', key: ['property', 'og:title'], attribute: 'content', field: 'title' },
  { tag: 'meta', key: ['property', 'og:description'], attribute: 'content', field: 'description' },
  { tag: 'meta', key: ['name', 'twitter:title'], attribute: 'content', field: 'title' },
  { tag: 'meta', key: ['name', 'twitter:description'], attribute: 'content', field: 'description' },
  { tag: 'meta', key: ['property', 'og:image'], attribute: 'content', field: 'image' },
  { tag: 'meta', key: ['property', 'og:image:secure_url'], attribute: 'content', field: 'image' },
  { tag: 'meta', key: ['property', 'og:image:alt'], attribute: 'content', field: 'imageAlt' },
  { tag: 'meta', key: ['name', 'twitter:image'], attribute: 'content', field: 'image' },
  { tag: 'meta', key: ['name', 'twitter:image:alt'], attribute: 'content', field: 'imageAlt' },
]

// The share image (1200x630 PNG). Pages and projects use the site-wide card; each post
// gets its own, drawn by the build (vite/ogImage.js) at postImagePath(slug).
const SITE_IMAGE = { image: `${SITE_URL}/og-image.png`, imageAlt: 'Azaan Khalfe, Software Engineer' }
export const postImagePath = (slug) => `/og/blog/${slug}.png`

const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Azaan Khalfe',
  url: `${SITE_URL}/`,
}

// Structured data per page, written into the one <script type="application/ld+json">.
// Home describes the person; a post is a BlogPosting by that person; the rest are pages.
const profileJsonLd = ({ title, description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profile`,
  url,
  name: title,
  description,
  image: SITE_IMAGE.image,
  mainEntity: {
    ...PERSON,
    givenName: 'Azaan',
    familyName: 'Khalfe',
    jobTitle: 'Software Engineer',
    sameAs: ['https://github.com/AzaanKH', 'https://www.linkedin.com/in/azaan-khalfe-43b90b221/'],
    knowsAbout: ['Software engineering', 'Developer tools', 'Machine learning systems', 'Distributed systems', 'Web applications'],
  },
})

const webPageJsonLd = ({ title, description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  url,
  name: title,
  description,
  author: PERSON,
})

export function getPageMetadata(page) {
  const { path, title, description } = routes[page]
  const metadata = { title, description, url: `${SITE_URL}${path}`, type: 'website', ...SITE_IMAGE }
  return { ...metadata, jsonLd: page === 'home' ? profileJsonLd(metadata) : webPageJsonLd(metadata) }
}

// `post` is a lib/posts.js entry (or the build's parsePostMeta result).
export function getPostMetadata(post) {
  const url = `${SITE_URL}${postPath(post.slug)}`
  const image = `${SITE_URL}${postImagePath(post.slug)}`
  return {
    title: `${post.title} | Azaan Khalfe`,
    description: post.description,
    url,
    type: 'article',
    image,
    imageAlt: `${post.title}, a post by Azaan Khalfe`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url,
      mainEntityOfPage: url,
      image,
      author: PERSON,
    },
  }
}

// `project` is a data/projects.js entry: /projects/<slug> shares as that project.
export function getProjectMetadata(project) {
  const metadata = {
    title: `${project.name} | Projects | Azaan Khalfe`,
    description: project.description,
    url: `${SITE_URL}${slugPath('projects', project.slug)}`,
    type: 'website',
    ...SITE_IMAGE,
  }
  return { ...metadata, jsonLd: webPageJsonLd(metadata) }
}

export function applyPageMetadata(page) {
  applyMetadata(getPageMetadata(page))
}

// index.html ships the home page's metadata (its JSON-LD is filled in by vite.config.js);
// this keeps it accurate after
// client-side navigation (tab title, history entries, share previews from JS crawlers).
export function applyMetadata(metadata) {
  document.title = metadata.title
  for (const { tag, key: [keyName, keyValue], attribute, field } of HEAD_TAGS) {
    document.head.querySelector(`${tag}[${keyName}="${keyValue}"]`)?.setAttribute(attribute, metadata[field])
  }
  const jsonLd = document.head.querySelector(JSON_LD_SELECTOR)
  if (jsonLd) jsonLd.textContent = serializeJsonLd(metadata.jsonLd)
}

const JSON_LD_SELECTOR = 'script[type="application/ld+json"]'
// Escaping "<" keeps a "</script>" inside a title or description from ending the tag.
const serializeJsonLd = (data) => JSON.stringify(data).replace(/</g, '\\u003c')

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function renderPageHead(html, page) {
  return renderHead(html, getPageMetadata(page))
}

// Build time (see vite.config.js): returns index.html with these head tags, so
// crawlers and link unfurlers that don't run JavaScript see the right metadata.
// Throws if a tag is missing, so an edit to index.html can't silently break this.
export function renderHead(html, metadata) {
  const replaceOnce = (pattern, replacement, label) => {
    if (!pattern.test(html)) throw new Error(`renderPageHead: index.html has no ${label}`)
    html = html.replace(pattern, replacement)
  }

  replaceOnce(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(metadata.title)}</title>`, '<title>')
  for (const { tag, key: [keyName, keyValue], attribute, field } of HEAD_TAGS) {
    const pattern = new RegExp(`(<${tag}\\s+${keyName}="${keyValue}"\\s+${attribute}=")[^"]*(")`)
    replaceOnce(pattern, (_, start, end) => `${start}${escapeHtml(metadata[field])}${end}`, `${tag}[${keyName}="${keyValue}"]`)
  }
  replaceOnce(
    /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
    (_, start, end) => `${start}${serializeJsonLd(metadata.jsonLd)}${end}`,
    JSON_LD_SELECTOR,
  )
  return html
}
