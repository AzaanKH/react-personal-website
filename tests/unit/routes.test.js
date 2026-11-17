import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  applyPageMetadata,
  getPageFromPath,
  getPostMetadata,
  getProjectMetadata,
  locationPath,
  parseLocation,
  renderHead,
  renderPageHead,
  routes,
} from '../../src/lib/routes'

describe('getPageFromPath', () => {
  it.each([
    ['/', 'home'],
    ['/projects', 'projects'],
    ['/projects/', 'projects'],
    ['/interests//', 'interests'],
    ['/gaming', 'interests'],
    ['/contact', 'contact'],
    ['/about', 'about'],
    ['/projects/paxos', 'projects'],
    ['/blog', 'blog'],
    ['/blog/my-post', 'blog'],
    ['/blog/my-post/', 'blog'],
  ])('maps %s to %s', (path, page) => {
    expect(getPageFromPath(path)).toBe(page)
  })

  it('falls back to home for unknown paths', () => {
    expect(getPageFromPath('/does-not-exist')).toBe('home')
  })
})

describe('parseLocation', () => {
  it.each([
    ['/blog', { page: 'blog', slug: null }],
    ['/blog/my-post', { page: 'blog', slug: 'my-post' }],
    ['/blog/my-post/', { page: 'blog', slug: 'my-post' }],
    ['/projects', { page: 'projects', slug: null }],
    ['/projects/paxos', { page: 'projects', slug: 'paxos' }],
    ['/projects/paxos/', { page: 'projects', slug: 'paxos' }],
  ])('parses %s', (path, location) => {
    expect(parseLocation(path)).toEqual(location)
  })

  // Malformed slugs still route to the blog (and its "Post not found"), never to home.
  it.each([
    ['/blog/not_found', 'not_found'],
    ['/blog/Not-A-Slug', 'Not-A-Slug'],
    ['/blog/a/b', 'a/b'],
    ['/blog/a/b/', 'a/b'],
  ])('routes malformed %s to the blog with slug %s', (path, slug) => {
    expect(parseLocation(path)).toEqual({ page: 'blog', slug })
  })

  it.each(['/blogx/a', '/blog-post', '/notblog/a'])('does not treat %s as a post', (path) => {
    expect(parseLocation(path)).toEqual({ page: 'home', slug: null })
  })

  it('round-trips to the canonical path', () => {
    expect(locationPath(parseLocation('/blog/my-post/'))).toBe('/blog/my-post')
    expect(locationPath(parseLocation('/gaming'))).toBe('/interests')
    expect(locationPath(parseLocation('/projects/paxos/'))).toBe('/projects/paxos')
  })
})

describe('applyPageMetadata', () => {
  it('updates the title, description, canonical URL, and social tags', () => {
    document.head.innerHTML = `
      <meta name="description" content="">
      <link rel="canonical" href="">
      <meta property="og:url" content="">
      <meta property="og:title" content="">
      <script type="application/ld+json">{}</script>
    `

    applyPageMetadata('projects')

    expect(document.title).toBe(routes.projects.title)
    expect(document.head.querySelector('meta[name="description"]').content).toBe(routes.projects.description)
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://azaankhalfe.netlify.app/projects',
    )
    expect(document.head.querySelector('meta[property="og:url"]').content).toBe(
      'https://azaankhalfe.netlify.app/projects',
    )
    expect(document.head.querySelector('meta[property="og:title"]').content).toBe(routes.projects.title)
    expect(JSON.parse(document.head.querySelector('script[type="application/ld+json"]').textContent)).toMatchObject({
      '@type': 'WebPage',
      url: 'https://azaankhalfe.netlify.app/projects',
    })
  })

  it('uses the bare site URL for home', () => {
    document.head.innerHTML = '<link rel="canonical" href="">'
    applyPageMetadata('home')
    expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(
      'https://azaankhalfe.netlify.app/',
    )
  })
})

describe('renderPageHead', () => {
  const indexHtml = readFileSync(path.resolve(import.meta.dirname, '../../index.html'), 'utf8')
  const headOf = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const attr = (selector, name) => doc.head.querySelector(selector)?.getAttribute(name)
    return {
      title: doc.title,
      description: attr('meta[name="description"]', 'content'),
      canonical: attr('link[rel="canonical"]', 'href'),
      ogUrl: attr('meta[property="og:url"]', 'content'),
      ogTitle: attr('meta[property="og:title"]', 'content'),
      ogDescription: attr('meta[property="og:description"]', 'content'),
      twitterTitle: attr('meta[name="twitter:title"]', 'content'),
      twitterDescription: attr('meta[name="twitter:description"]', 'content'),
    }
  }
  const ogType = (html) => /property="og:type" content="([^"]*)"/.exec(html)[1]
  const jsonLdOf = (html) => JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1])

  it.each(['projects', 'interests', 'blog', 'about', 'contact'])('prerenders every %s head tag from the real index.html', (page) => {
    const { title, description } = routes[page]
    const url = `https://azaankhalfe.netlify.app${routes[page].path}`

    expect(headOf(renderPageHead(indexHtml, page))).toEqual({
      title,
      description,
      canonical: url,
      ogUrl: url,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description,
    })
  })

  it('leaves the rest of the document alone', () => {
    const rendered = renderPageHead(indexHtml, 'projects')
    expect(rendered).toContain('<div id="root"></div>')
    expect(rendered).toContain('<script type="module" src="/src/main.jsx"></script>')
  })

  it('escapes values and treats $ literally', () => {
    const original = routes.projects.title
    routes.projects.title = 'A "quoted" <b> & $& title'
    try {
      expect(headOf(renderPageHead(indexHtml, 'projects')).title).toBe('A "quoted" <b> & $& title')
    } finally {
      routes.projects.title = original
    }
  })

  it('prerenders a post with its own title, description, and URL', () => {
    const post = { slug: 'my-post', title: 'My post', description: 'About it' }
    const head = headOf(renderHead(indexHtml, getPostMetadata(post)))
    expect(head.title).toBe('My post | Azaan Khalfe')
    expect(head.ogDescription).toBe('About it')
    expect(head.canonical).toBe('https://azaankhalfe.netlify.app/blog/my-post')
  })

  it('marks a post as an article by the site owner, and pages as a website', () => {
    const post = { slug: 'my-post', title: 'My </script> post', description: 'About it', date: '2026-10-09' }
    const html = renderHead(indexHtml, getPostMetadata(post))
    expect(ogType(html)).toBe('article')
    // "<" is escaped, so a title can't close the script tag early.
    expect(html).not.toContain('My </script> post')
    expect(jsonLdOf(html)).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'My </script> post',
      datePublished: '2026-10-09',
      author: { name: 'Azaan Khalfe' },
    })

    expect(ogType(renderPageHead(indexHtml, 'projects'))).toBe('website')
    expect(jsonLdOf(renderPageHead(indexHtml, 'home'))).toMatchObject({ '@type': 'ProfilePage', mainEntity: { '@type': 'Person' } })
  })

  it('gives a post its own share image and other pages the site-wide one', () => {
    const image = (html) => /property="og:image" content="([^"]*)"/.exec(html)[1]
    const twitterImage = (html) => /name="twitter:image" content="([^"]*)"/.exec(html)[1]
    const post = { slug: 'my-post', title: 'My post', description: 'About it', date: '2026-10-09' }
    const html = renderHead(indexHtml, getPostMetadata(post))

    expect(image(html)).toBe('https://azaankhalfe.netlify.app/og/blog/my-post.png')
    expect(twitterImage(html)).toBe(image(html))
    expect(html).toContain('property="og:image:alt" content="My post, a post by Azaan Khalfe"')
    expect(image(renderPageHead(indexHtml, 'projects'))).toBe('https://azaankhalfe.netlify.app/og-image.png')
  })

  it('prerenders a project with its own title, description, and URL', () => {
    const project = { slug: 'my-tool', name: 'My Tool', description: 'What it does' }
    const head = headOf(renderHead(indexHtml, getProjectMetadata(project)))
    expect(head.title).toBe('My Tool | Projects | Azaan Khalfe')
    expect(head.description).toBe('What it does')
    expect(head.canonical).toBe('https://azaankhalfe.netlify.app/projects/my-tool')
  })

  it('fails the build if index.html loses a tag', () => {
    const broken = indexHtml.replace(/<link rel="canonical"[^>]*>/, '')
    expect(() => renderPageHead(broken, 'projects')).toThrow(/canonical/)
  })
})
