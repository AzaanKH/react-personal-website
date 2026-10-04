import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { applyPageMetadata, getPageFromPath, renderPageHead, routes } from '../../src/lib/routes'

describe('getPageFromPath', () => {
  it.each([
    ['/', 'home'],
    ['/projects', 'projects'],
    ['/projects/', 'projects'],
    ['/gaming//', 'gaming'],
    ['/contact', 'contact'],
  ])('maps %s to %s', (path, page) => {
    expect(getPageFromPath(path)).toBe(page)
  })

  it('falls back to home for unknown paths', () => {
    expect(getPageFromPath('/does-not-exist')).toBe('home')
  })
})

describe('applyPageMetadata', () => {
  it('updates the title, description, canonical URL, and social tags', () => {
    document.head.innerHTML = `
      <meta name="description" content="">
      <link rel="canonical" href="">
      <meta property="og:url" content="">
      <meta property="og:title" content="">
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

  it.each(['projects', 'gaming', 'contact'])('prerenders every %s head tag from the real index.html', (page) => {
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

  it('fails the build if index.html loses a tag', () => {
    const broken = indexHtml.replace(/<link rel="canonical"[^>]*>/, '')
    expect(() => renderPageHead(broken, 'projects')).toThrow(/canonical/)
  })
})
