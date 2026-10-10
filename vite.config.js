import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { getPostMetadata, pageIds, postPath, renderHead, renderPageHead, routes } from './src/lib/routes.js'
import { parsePostMeta } from './src/lib/postMeta.js'

const POSTS_DIR = path.resolve(import.meta.dirname, 'src/posts')
const POST_META_PREFIX = '\0post-meta:'

function readPosts() {
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const file = path.join(POSTS_DIR, name)
      return parsePostMeta(readFileSync(file, 'utf8'), file)
    })
}

// `import meta from './post.mdx?meta'` gives just the post's frontmatter as JSON, so the
// blog index can list every post without bundling their bodies (lib/posts.js loads those
// lazily). The \0 prefix keeps @mdx-js/rollup off this module: it strips `?meta` from
// IDs before checking the extension, but its filter rejects IDs containing \0.
function blogPostMeta() {
  return {
    name: 'blog-post-meta',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith('.mdx?meta')) return
      const resolved = await this.resolve(source.slice(0, -'?meta'.length), importer, { skipSelf: true })
      return resolved && POST_META_PREFIX + resolved.id
    },
    load(id) {
      if (!id.startsWith(POST_META_PREFIX)) return
      const file = id.slice(POST_META_PREFIX.length)
      this.addWatchFile(file)
      return `export default ${JSON.stringify(parsePostMeta(readFileSync(file, 'utf8'), file))}`
    },
  }
}

// Emits projects.html, interests.html, blog.html, contact.html, and blog/<slug>.html per
// published post: copies of the built index.html with that page's title, description,
// canonical, and social tags. Netlify serves
// /projects from projects.html (a static file shadows the SPA rewrite in netlify.toml),
// so crawlers that don't run JavaScript get the right metadata. The app is unchanged.
function prerenderRouteHeads() {
  return {
    name: 'prerender-route-heads',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (!index) this.error('index.html was not found in the bundle')
      for (const page of pageIds) {
        if (routes[page].path === '/') continue
        this.emitFile({
          type: 'asset',
          fileName: `${routes[page].path.slice(1)}.html`,
          source: renderPageHead(String(index.source), page),
        })
      }
      for (const post of readPosts().filter((post) => !post.draft)) {
        this.emitFile({
          type: 'asset',
          fileName: `${postPath(post.slug).slice(1)}.html`,
          source: renderHead(String(index.source), getPostMetadata(post)),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    blogPostMeta(),
    // Before react() so .mdx compiles to JSX first. Posts render with the components
    // map in lib/mdxComponents.js (passed as a prop, so no provider).
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter, remarkGfm] }) },
    react({ include: /\.(jsx|js|mdx|tsx|ts)$/ }),
    prerenderRouteHeads(),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 'hidden' would still write .map files into dist/, which Netlify publishes.
    sourcemap: false,
    cssCodeSplit: true,
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
