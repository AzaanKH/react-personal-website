import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'

// Build time only (vite.config.js): draws a post's share image, the 1200x630 card that
// link previews show, as SVG and renders it to PNG. Fonts are the two files in vite/og/
// (the site's display and body faces, both under the SIL Open Font License), loaded
// from disk so the result is the same on every machine, including Netlify's.
const FONT_DIR = path.resolve(import.meta.dirname, 'og')
const FONT = {
  fontFiles: [path.join(FONT_DIR, 'CormorantGaramond-SemiBold.ttf'), path.join(FONT_DIR, 'SpaceGrotesk-Medium.ttf')],
  loadSystemFonts: false,
  defaultFontFamily: 'Space Grotesk',
}
const DISPLAY = 'Cormorant Garamond'
const BODY = 'Space Grotesk'

const WIDTH = 1200
const HEIGHT = 630
const MARGIN = 96
const MAX_TEXT_WIDTH = WIDTH - MARGIN * 2
// The title is set as large as fits in this many lines.
const TITLE_SIZES = [92, 80, 70, 62, 54]
const MAX_TITLE_LINES = 4

// Light-theme colours from src/index.css.
const COLOR = { bg: '#f5f0eb', bgEnd: '#e9dfd3', text: '#1a1a1a', secondary: '#5e6b80', accent: '#b04e32' }

const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const textWidth = (text, size, family) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="300"><text x="0" y="200" font-family="${family}" font-weight="600" font-size="${size}">${escapeXml(text)}</text></svg>`
  return new Resvg(svg, { font: FONT }).getBBox()?.width ?? 0
}

// Greedy word wrap against measured widths.
function wrap(text, size, family) {
  const lines = []
  for (const word of text.split(/\s+/)) {
    const candidate = lines.length ? `${lines.at(-1)} ${word}` : word
    if (lines.length && textWidth(candidate, size, family) <= MAX_TEXT_WIDTH) lines[lines.length - 1] = candidate
    else lines.push(word)
  }
  return lines
}

function fitTitle(title) {
  for (const size of TITLE_SIZES) {
    const lines = wrap(title, size, DISPLAY)
    if (lines.length <= MAX_TITLE_LINES) return { size, lines }
  }
  // Still too long at the smallest size: keep what fits and end with an ellipsis.
  const size = TITLE_SIZES.at(-1)
  const lines = wrap(title, size, DISPLAY).slice(0, MAX_TITLE_LINES)
  lines[lines.length - 1] = `${lines.at(-1).replace(/[\s.,;:]+$/, '')}…`
  return { size, lines }
}

// `post` is a parsePostMeta result; `dateLabel` is its date as shown on the site.
export function postImageSvg(post, { dateLabel, site }) {
  const { size, lines } = fitTitle(post.title)
  const lineHeight = Math.round(size * 1.04)
  // The title block sits on a baseline grid starting under the kicker.
  const firstBaseline = 196 + size * 0.72
  const title = lines
    .map((line, index) => `<text x="${MARGIN}" y="${Math.round(firstBaseline + index * lineHeight)}" font-family="${DISPLAY}" font-weight="600" font-size="${size}" letter-spacing="${(-0.02 * size).toFixed(1)}" fill="${COLOR.text}">${escapeXml(line)}</text>`)
    .join('\n  ')
  const footer = `${dateLabel}  ·  ${post.readingMinutes} min read`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${COLOR.bg}"/><stop offset="1" stop-color="${COLOR.bgEnd}"/></linearGradient></defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="${MARGIN}" y="${MARGIN}" width="64" height="5" rx="2.5" fill="${COLOR.accent}"/>
  <text x="${MARGIN}" y="150" font-family="${BODY}" font-weight="500" font-size="22" letter-spacing="5" fill="${COLOR.secondary}">AZAAN KHALFE  ·  BLOG</text>
  ${title}
  <text x="${MARGIN}" y="${HEIGHT - MARGIN + 22}" font-family="${BODY}" font-weight="500" font-size="24" letter-spacing="1" fill="${COLOR.secondary}">${escapeXml(footer)}</text>
  <text x="${WIDTH - MARGIN}" y="${HEIGHT - MARGIN + 22}" text-anchor="end" font-family="${BODY}" font-weight="500" font-size="24" letter-spacing="1" fill="${COLOR.accent}">${escapeXml(site)}</text>
</svg>`
}

export function renderPostImage(post, options) {
  return new Resvg(postImageSvg(post, options), { font: FONT }).render().asPng()
}
