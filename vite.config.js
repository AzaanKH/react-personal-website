import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { getPostMetadata, pageIds, postPath, renderHead, renderPageHead, routes } from './src/lib/routes.js'
import { blogPosts, readPosts } from './vite/blogPosts.js'

const POSTS_DIR = path.resolve(import.meta.dirname, 'src/posts')

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
      for (const { meta: post } of readPosts(POSTS_DIR).filter(({ meta }) => !meta.draft)) {
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
    blogPosts({ dir: POSTS_DIR }),
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
