import { describe, expect, it } from 'vitest'
import { parsePostMeta } from '../../src/lib/postMeta'

const post = (frontmatter, body = 'Hello there.') => `---\n${frontmatter}\n---\n\n${body}\n`
const valid = 'title: A post\ndescription: About things\ndate: 2026-10-09'

describe('parsePostMeta', () => {
  it('reads the slug from the file name and the fields from frontmatter', () => {
    expect(parsePostMeta(post(valid), '/src/posts/a-post.mdx')).toEqual({
      slug: 'a-post',
      title: 'A post',
      description: 'About things',
      date: '2026-10-09',
      draft: false,
      readingMinutes: 1,
      headings: [],
    })
  })

  it('lists the sections, skipping subsections, code fences, and inline markdown', () => {
    const body = '## The `Clock` and [its](https://x.dev) *owner*\n\ntext\n\n### A subsection\n\n```md\n## Not a heading\n```\n\n#91 is a PR, not a heading\n\n# Results\n'
    expect(parsePostMeta(post(valid, body), 'a.mdx').headings).toEqual([
      { id: 'the-clock-and-its-owner', text: 'The Clock and its owner' },
      { id: 'results', text: 'Results' },
    ])
  })

  it('keeps literal underscores and asterisks, in code and in words', () => {
    const body = '## Calling `my_function`\n\n## The snake_case __rule__\n\n## 2 * 3 and `a*b`\n'
    expect(parsePostMeta(post(valid, body), 'a.mdx').headings).toEqual([
      { id: 'calling-my-function', text: 'Calling my_function' },
      { id: 'the-snake-case-rule', text: 'The snake_case rule' },
      { id: '2-3-and-a-b', text: '2 * 3 and a*b' },
    ])
  })

  it('rejects two sections that would share an id', () => {
    expect(() => parsePostMeta(post(valid, '## Results\n\n## Results!\n'), 'a.mdx')).toThrow(/share the id "results"/)
  })

  it('accepts CRLF line endings and draft: true', () => {
    const source = post(`${valid}\ndraft: true`).replace(/\n/g, '\r\n')
    expect(parsePostMeta(source, 'a.mdx').draft).toBe(true)
  })

  it('estimates reading time from prose, not imports or code', () => {
    const words = Array.from({ length: 900 }, () => 'word').join(' ')
    const code = '```js\n' + 'x '.repeat(5000) + '\n```'
    const body = `import X from './x'\n\n${words}\n\n${code}\n\n<X prop="${'y '.repeat(500)}" />`
    expect(parsePostMeta(post(valid, body), 'a.mdx').readingMinutes).toBe(4)
  })

  it.each([
    ['missing frontmatter', 'Just text', /missing frontmatter/],
    ['no title', post('description: d\ndate: 2026-10-09'), /"title" is required/],
    ['blank description', post('title: t\ndescription: "  "\ndate: 2026-10-09'), /"description" is required/],
    ['bad date', post('title: t\ndescription: d\ndate: October 9'), /"date" must be YYYY-MM-DD/],
    ['non-boolean draft', post(`${valid}\ndraft: yes please`), /"draft" must be true or false/],
  ])('rejects %s', (_, source, error) => {
    expect(() => parsePostMeta(source, 'a.mdx')).toThrow(error)
  })

  const withDate = (date) => post(`title: t\ndescription: d\ndate: ${date}`)

  it.each([
    ['2026-99-99', 'nonsense month and day'],
    ['2026-00-10', 'month 00'],
    ['2026-13-01', 'month 13'],
    ['2026-01-00', 'day 00'],
    ['2026-01-32', 'day 32'],
    ['2026-04-31', '31 days in a 30-day month'],
    ['2026-02-31', 'Feb 31 (would roll to March 3)'],
    ['2026-02-29', 'Feb 29 in a common year'],
    ['2100-02-29', 'Feb 29 in a century year not divisible by 400'],
  ])('rejects %s (%s)', (date) => {
    expect(() => parsePostMeta(withDate(date), 'a.mdx')).toThrow(`"date" ${date} is not a real calendar date`)
  })

  it.each([
    ['2028-02-29', 'leap year'],
    ['2000-02-29', 'century leap year (divisible by 400)'],
    ['2026-12-31', 'last day of the year'],
    ['2026-01-01', 'first day of the year'],
  ])('accepts %s (%s)', (date) => {
    expect(parsePostMeta(withDate(date), 'a.mdx').date).toBe(date)
  })

  it('rejects file names that are not URL slugs', () => {
    expect(() => parsePostMeta(post(valid), 'My Post.mdx')).toThrow(/My Post\.mdx: file name/)
  })
})
