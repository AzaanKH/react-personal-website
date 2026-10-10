import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parsePostMeta } from '../src/lib/postMeta.js'

const VIRTUAL_ID = 'virtual:blog-posts'
// The \0 prefix also keeps @mdx-js/rollup (and other plugins' filters) off this module.
const RESOLVED_ID = `\0${VIRTUAL_ID}`

const samePath = (a, b) => path.normalize(a) === path.normalize(b)

// Every post in `dir`, with its frontmatter validated (throws on a bad field).
export function readPosts(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const file = path.join(dir, name)
      return { file, meta: parsePostMeta(readFileSync(file, 'utf8'), file) }
    })
}

// `import posts from 'virtual:blog-posts'` → [{ meta, load }], used by lib/posts.js.
// `meta` is inlined frontmatter, so the index never bundles a post body; `load` is a
// lazy import, one chunk per post. In a build, drafts are left out of this list, so they
// are never imported and no chunk is emitted for them. While serving (`netlify dev`,
// Vitest) drafts are included so they can be previewed.
//
// generateBundle then fails the build if any chunk still contains a draft (say, a
// component imported one directly), so a draft can't reach dist/ unnoticed.
export function blogPosts({ dir }) {
  let includeDrafts = false
  let root = process.cwd()
  let lastCode = null

  const generate = () => {
    const posts = readPosts(dir).filter((post) => includeDrafts || !post.meta.draft)
    const entries = posts.map(({ file, meta }) => {
      const importPath = `/${path.relative(root, file).split(path.sep).join('/')}`
      return `  { meta: ${JSON.stringify(meta)}, load: () => import(${JSON.stringify(importPath)}) },`
    })
    return { posts, code: `export default [\n${entries.join('\n')}\n]\n` }
  }

  return {
    name: 'blog-posts',
    configResolved(config) {
      includeDrafts = config.command === 'serve'
      root = config.root
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const { posts, code } = generate()
      for (const { file } of posts) this.addWatchFile(file)
      lastCode = code
      return code
    },
    // Adding or removing a post, or editing its frontmatter, changes the list: reload.
    // Body-only edits leave the list alone, so they still hot-update.
    configureServer(server) {
      const onPostChange = (file) => {
        if (!file.endsWith('.mdx') || !samePath(path.dirname(file), dir)) return
        let code
        try {
          code = generate().code
        } catch {
          code = null // Bad frontmatter: reload so load() reports the error.
        }
        if (code !== null && code === lastCode) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      for (const event of ['add', 'unlink', 'change']) server.watcher.on(event, onPostChange)
    },
    generateBundle(_options, bundle) {
      if (includeDrafts) return
      const drafts = readPosts(dir).filter((post) => post.meta.draft)
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const id of output.moduleIds) {
          const draft = drafts.find((post) => samePath(id.split('?')[0], post.file))
          if (draft) {
            this.error(`Draft post ${path.basename(draft.file)} was bundled into ${output.fileName}. Drafts must not ship.`)
          }
        }
      }
    },
  }
}
