import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { projects } from './src/data/projects.js'
import {
  SITE_URL,
  getPageMetadata,
  getPostMetadata,
  getProjectMetadata,
  pageIds,
  postImagePath,
  postPath,
  renderHead,
  renderPageHead,
  routes,
  slugPath,
} from './src/lib/routes.js'
import { blogPosts, readPosts } from './vite/blogPosts.js'
import { renderPostImage } from './vite/ogImage.js'

const POSTS_DIR = path.resolve(import.meta.dirname, 'src/posts')

const SSR_OUT_DIR = path.resolve(import.meta.dirname, 'node_modules/.prerender')
const EMPTY_ROOT = '<div id="root"></div>'

const NETLIFY_TOML = path.resolve(import.meta.dirname, 'netlify.toml')

// The Content-Security-Policy in netlify.toml allows inline scripts by hash only. Fails
// the build if a built page has an inline script the policy doesn't list (say the theme
// script in index.html was edited), since the browser would silently refuse to run it.
function checkInlineScriptHashes(html, fail) {
  const policy = readFileSync(NETLIFY_TOML, 'utf8')
  for (const [, attributes, code] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    // Scripts with a src are covered by 'self'; JSON-LD is a data block and never runs.
    if (/\bsrc=/.test(attributes) || /type="application\/ld\+json"/.test(attributes)) continue
    const hash = `sha256-${createHash('sha256').update(code).digest('base64')}`
    if (!policy.includes(`'${hash}'`)) {
      fail(`An inline script in index.html is not allowed by the Content-Security-Policy in netlify.toml. Add '${hash}' to script-src (replacing the old hash if the script was edited).`)
    }
  }
}

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// index.html carries an empty JSON-LD script; this fills in the home page's, in dev too.
function homeHead() {
  return {
    name: 'home-head',
    transformIndexHtml: (html) => renderPageHead(html, 'home'),
  }
}

// After the client build, writes one HTML file per URL: every page, every published
// post (blog/<slug>.html), and every project (projects/<slug>.html, its case study open).
// Each is the built index.html with that URL's head tags (title, description, canonical,
// social tags, JSON-LD) and the app's rendered HTML inside #root, so crawlers and link
// unfurlers that don't run JavaScript get real content. Netlify serves /projects from
// projects.html (a static file shadows the SPA rewrite in netlify.toml).
//
// The HTML comes from a second, SSR build of src/entry-server.jsx (same plugins, so
// drafts stay out), imported and called once per path. The browser doesn't hydrate it;
// see src/main.jsx. Also writes sitemap.xml and rss.xml from the same list, and a share
// image per post (og/blog/<slug>.png).
function prerenderPages() {
  let isSsrBuild = false
  return {
    name: 'prerender-pages',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr)
    },
    async writeBundle(options) {
      if (isSsrBuild) return

      const posts = readPosts(POSTS_DIR)
        .map(({ meta }) => meta)
        .filter((post) => !post.draft)
        .sort((a, b) => b.date.localeCompare(a.date))
      const targets = [
        ...pageIds.map((page) => ({ path: routes[page].path, metadata: getPageMetadata(page) })),
        ...posts.map((post) => ({ path: postPath(post.slug), metadata: getPostMetadata(post), lastmod: post.date })),
        ...projects.map((project) => ({ path: slugPath('projects', project.slug), metadata: getProjectMetadata(project) })),
      ]

      await build({
        logLevel: 'warn',
        build: { ssr: 'src/entry-server.jsx', outDir: SSR_OUT_DIR, emptyOutDir: true, copyPublicDir: false },
      })
      const { render } = await import(`${pathToFileURL(path.join(SSR_OUT_DIR, 'entry-server.js')).href}?t=${Date.now()}`)

      const template = readFileSync(path.join(options.dir, 'index.html'), 'utf8')
      if (!template.includes(EMPTY_ROOT)) this.error(`index.html has no ${EMPTY_ROOT}`)
      checkInlineScriptHashes(template, (message) => this.error(message))
      for (const target of targets) {
        const body = await render(target.path)
        const html = renderHead(template, target.metadata).replace(EMPTY_ROOT, () => `<div id="root">${body}</div>`)
        const file = path.join(options.dir, target.path === '/' ? 'index.html' : `${target.path.slice(1)}.html`)
        mkdirSync(path.dirname(file), { recursive: true })
        writeFileSync(file, html)
      }

      // One share image per post, at the URL its head tags point to (getPostMetadata).
      for (const post of posts) {
        const file = path.join(options.dir, postImagePath(post.slug).slice(1))
        mkdirSync(path.dirname(file), { recursive: true })
        const dateLabel = new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
        writeFileSync(file, renderPostImage(post, { dateLabel, site: new URL(SITE_URL).host }))
      }

      writeFileSync(
        path.join(options.dir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${targets
          .map(({ metadata, lastmod }) => `  <url><loc>${escapeXml(metadata.url)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
          .join('\n')}\n</urlset>\n`,
      )
      const blogUrl = `${SITE_URL}${routes.blog.path}`
      writeFileSync(
        path.join(options.dir, 'rss.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n` +
          `  <title>${escapeXml(routes.blog.title)}</title>\n  <link>${blogUrl}</link>\n` +
          `  <description>${escapeXml(routes.blog.description)}</description>\n  <language>en</language>\n` +
          `  <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n` +
          posts
            .map((post) => {
              const url = `${SITE_URL}${postPath(post.slug)}`
              return (
                `  <item>\n    <title>${escapeXml(post.title)}</title>\n    <link>${url}</link>\n    <guid>${url}</guid>\n` +
                `    <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>\n` +
                `    <description>${escapeXml(post.description)}</description>\n  </item>\n`
              )
            })
            .join('') +
          `</channel>\n</rss>\n`,
      )
    },
  }
}

export default defineConfig({
  plugins: [
    blogPosts({ dir: POSTS_DIR }),
    // Before react() so .mdx compiles to JSX first. Posts render with the components
    // map in lib/mdxComponents.js (passed as a prop, so no provider).
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm], rehypePlugins: [rehypeHighlight] }) },
    react({ include: /\.(jsx|js|mdx|tsx|ts)$/ }),
    homeHead(),
    prerenderPages(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 'hidden' would still write .map files into dist/, which Netlify publishes.
    sourcemap: false,
    cssCodeSplit: true,
    // React and Motion change far less often than the site does, so they get their own
    // file: a content edit then leaves it cached in returning visitors' browsers.
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'vendor', test: /node_modules/ }] } },
    },
    assetsInlineLimit: 4096,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
})
