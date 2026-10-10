import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { build } from 'vite'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import { blogPosts } from '../../vite/blogPosts.js'

// Real production builds of a fixture site, so these check what actually lands in dist/.
// Fixture entries assign to globalThis: an app build tree-shakes unused entry exports.
let root
const post = (title, body, draft = false) =>
  `---\ntitle: ${title}\ndescription: About ${title}\ndate: 2026-10-09\ndraft: ${draft}\n---\n\n${body}\n`

async function buildFixture(entry) {
  writeFileSync(path.join(root, 'entry.js'), entry)
  const output = await build({
    configFile: false,
    root,
    logLevel: 'silent',
    plugins: [blogPosts({ dir: path.join(root, 'posts') }), { enforce: 'pre', ...mdx({ remarkPlugins: [remarkFrontmatter] }) }],
    build: {
      write: false,
      rollupOptions: { input: path.join(root, 'entry.js'), external: [/^react/] },
    },
  })
  const chunks = (Array.isArray(output) ? output : [output]).flatMap((o) => o.output).filter((o) => o.type === 'chunk')
  return chunks.map((c) => c.code).join('\n')
}

beforeAll(() => {
  root = mkdtempSync(path.join(tmpdir(), 'blog-posts-'))
  mkdirSync(path.join(root, 'posts'))
  writeFileSync(path.join(root, 'posts', 'published-post.mdx'), post('Published title', 'PUBLISHED_BODY'))
  writeFileSync(path.join(root, 'posts', 'draft-post.mdx'), post('Draft title', 'DRAFT_BODY', true))
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('blogPosts plugin (production build)', () => {
  it('bundles published posts but leaves drafts out entirely', async () => {
    const code = await buildFixture(`import posts from 'virtual:blog-posts'\nglobalThis.posts = posts`)

    expect(code).toContain('Published title')
    expect(code).toContain('PUBLISHED_BODY')
    expect(code).not.toContain('Draft title')
    expect(code).not.toContain('DRAFT_BODY')
  })

  it('fails the build if a draft is bundled some other way', async () => {
    await expect(
      buildFixture(`import posts from 'virtual:blog-posts'\nglobalThis.posts = [posts, () => import('./posts/draft-post.mdx')]`),
    ).rejects.toThrow(/Draft post draft-post\.mdx was bundled/)
  })
})
