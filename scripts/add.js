// Adds a movie, show, anime, or game to src/data/interests.json with its poster.
//
//   npm run add -- movie "Dune: Part Two" 2024
//   npm run add -- show "Severance"
//   npm run add -- anime "Frieren"
//   npm run add -- game "Elden Ring" --platform steam
//   npm run add -- game "Ghost of Tsushima" --platform ps5 --hours 85
//
// Options: --rating 4.5  --review "Short take"  --pick 1 (skip the menu)
// You'll be asked for a rating and review if you don't pass them. Commit and push the
// JSON change to publish; each push is a Netlify deploy, so batch a few additions.
import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import { MEDIA_KINDS, PLATFORMS, addEntry, parseRating, searchIgdb, searchMedia, searchSteam } from './lib/catalog.js'

const DATA_FILE = new URL('../src/data/interests.json', import.meta.url)

const USAGE = `Usage:
  npm run add -- <movie|show|anime> "<title>" [year] [--rating 4.5] [--review "..."]
  npm run add -- game "<title>" --platform <${PLATFORMS.join('|')}> [--hours 85] [--rating 5] [--review "..."]`

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      platform: { type: 'string' },
      hours: { type: 'string' },
      rating: { type: 'string' },
      review: { type: 'string' },
      pick: { type: 'string' },
    },
  })
  const [kind, query, year] = positionals
  if (!query || !(kind in MEDIA_KINDS || kind === 'game')) throw new Error(USAGE)
  if (kind === 'game' && !PLATFORMS.includes(values.platform)) {
    throw new Error(`Games need --platform (${PLATFORMS.join(', ')})\n\n${USAGE}`)
  }

  const candidates =
    kind === 'game'
      ? values.platform === 'steam'
        ? await searchSteam(query)
        : await searchIgdb(query, values.platform)
      : await searchMedia(kind, query, year)
  if (candidates.length === 0) throw new Error(`No results for "${query}". Try a different spelling or drop the year.`)

  const prompt = process.stdin.isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null
  try {
    let choice = values.pick
    if (choice === undefined) {
      candidates.forEach(({ label }, index) => console.log(`  ${index + 1}. ${label}`))
      if (!prompt) throw new Error('Not an interactive terminal: pass --pick <number>.')
      choice = (await prompt.question(`Which one? [1-${candidates.length}, Enter = 1] `)) || '1'
    }
    const picked = candidates[Number(choice) - 1]
    if (!picked) throw new Error(`"${choice}" isn't one of the options.`)

    let { rating, review } = values
    if (prompt && rating === undefined) rating = await prompt.question('Rating 0.5–5 (Enter to skip): ')
    if (prompt && review === undefined) review = await prompt.question('Short review (Enter to skip): ')

    const entry = { ...picked.entry, rating: parseRating(rating) }
    if (review?.trim()) entry.review = review.trim()
    if (kind === 'game' && values.platform !== 'steam' && values.hours !== undefined) {
      const hours = Number(values.hours)
      if (!Number.isFinite(hours) || hours < 0) throw new Error(`--hours must be a number (got "${values.hours}")`)
      entry.hours = hours
    }

    const listName = kind === 'game' ? 'games' : MEDIA_KINDS[kind]
    const data = JSON.parse(await readFile(DATA_FILE, 'utf8'))
    data[listName] = addEntry(data[listName] ?? [], entry)
    await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`)

    console.log(`\nAdded "${entry.title}" to ${listName}. Review src/data/interests.json, then commit and push to publish.`)
  } finally {
    prompt?.close()
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`)
  process.exitCode = 1
})
