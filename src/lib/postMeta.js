// Build time only (vite.config.js): reads a post's YAML frontmatter. The browser gets
// the result as JSON via the `?meta` import in lib/posts.js, never this module or `yaml`.
import path from 'node:path'
import { parse } from 'yaml'
import { headingId } from './headingId.js'

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const WORDS_PER_MINUTE = 225

// Throws (failing the build or dev reload) on a missing or malformed field, so a typo in
// frontmatter can't ship as "undefined" in the blog index.
export function parsePostMeta(source, file) {
  const slug = path.basename(file, '.mdx')
  const fail = (message) => {
    throw new Error(`${path.basename(file)}: ${message}`)
  }
  if (!SLUG.test(slug)) fail('file name must be a lowercase-kebab-case slug, e.g. my-first-post.mdx')

  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source)
  if (!match) fail('missing frontmatter (--- title, description, date ---)')
  const data = parse(match[1]) ?? {}

  for (const field of ['title', 'description']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) fail(`"${field}" is required`)
  }
  // YAML 1.2 (the `yaml` default) keeps 2026-10-09 a string, so no timezone shifts.
  if (typeof data.date !== 'string' || !DATE.test(data.date)) fail('"date" must be YYYY-MM-DD')
  if (!isCalendarDate(data.date)) fail(`"date" ${data.date} is not a real calendar date`)
  if (data.draft !== undefined && typeof data.draft !== 'boolean') fail('"draft" must be true or false')

  const body = source.slice(match[0].length)
  const headings = sectionHeadings(body)
  const ids = headings.map((heading) => heading.id)
  const repeated = ids.find((id, index) => ids.indexOf(id) !== index)
  if (repeated) fail(`two sections would share the id "${repeated}"; reword one heading`)

  return {
    slug,
    title: data.title.trim(),
    description: data.description.trim(),
    date: data.date,
    draft: data.draft ?? false,
    readingMinutes: readingMinutes(body),
    headings,
  }
}

// The post's sections, for the "In this post" list: `#` and `##` headings (both render
// as h2), skipping code fences. Inline markdown is reduced to its text, which is also
// what the rendered heading's id is made from.
function sectionHeadings(body) {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\r?\n/)
    .map((line) => /^#{1,2}\s+(.+?)\s*#*$/.exec(line)?.[1])
    .filter(Boolean)
    .map((raw) => {
      const text = raw.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '')
      return { id: headingId(text), text }
    })
}

// Date.UTC rolls overflow forward (2026-02-31 → March 3), so a real date is one that
// survives the round trip unchanged. This also covers leap years.
function isCalendarDate(date) {
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

// Rough: counts prose words, skipping import/export lines, code fences, and JSX tags.
function readingMinutes(body) {
  const prose = body
    .replace(/^(?:import|export)\s.*$/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
  const words = prose.match(/[\p{L}\p{N}'’-]+/gu)?.length ?? 0
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
