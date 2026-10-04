import { describe, expect, it } from 'vitest'
import { applyPageMetadata, getPageFromPath, routes } from '../../src/lib/routes'

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
