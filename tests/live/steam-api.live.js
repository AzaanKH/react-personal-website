#!/usr/bin/env node
/**
 * Live smoke test for the deployed Steam proxy. Not part of `npm test` or the
 * build: it depends on the network, the Steam API, and a running site.
 *
 *   npm run test:live                                    # production
 *   TEST_BASE_URL=http://localhost:8888 npm run test:live # against `netlify dev`
 *
 * It needs no secrets: it calls the site's /api/steam endpoint, which holds the key.
 */
const BASE_URL = (process.env.TEST_BASE_URL || 'https://azaankhalfe.netlify.app').replace(/\/+$/, '')
const TIMEOUT_MS = 15000

async function getJson(path) {
  const response = await fetch(`${BASE_URL}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`${path}: expected JSON, got ${response.status} ${contentType || 'no content-type'}`)
  }
  return { status: response.status, body: await response.json() }
}

const checks = [
  ['rejects a missing endpoint', async () => {
    const { status } = await getJson('/api/steam')
    if (status !== 400) throw new Error(`expected 400, got ${status}`)
  }],
  ['returns the configured profile', async () => {
    const { status, body } = await getJson('/api/steam?endpoint=profile')
    if (status !== 200) throw new Error(`expected 200, got ${status}: ${body.error}`)
    const player = body.response?.players?.[0]
    if (!player?.steamid || !player?.personaname) throw new Error('profile is missing steamid/personaname (private profile?)')
  }],
  ['ignores a caller-supplied steamid', async () => {
    const own = await getJson('/api/steam?endpoint=profile')
    const other = await getJson('/api/steam?endpoint=profile&steamid=76561197960435530')
    if (other.body.response?.players?.[0]?.steamid !== own.body.response?.players?.[0]?.steamid) {
      throw new Error('proxy returned a different account for a supplied steamid')
    }
  }],
  ['returns recent games', async () => {
    const { status, body } = await getJson('/api/steam?endpoint=recent')
    if (status !== 200) throw new Error(`expected 200, got ${status}: ${body.error}`)
    if (!body.response || (body.response.games && !Array.isArray(body.response.games))) {
      throw new Error('unexpected recent games shape')
    }
  }],
]

console.log(`Steam proxy live checks against ${BASE_URL}\n`)
let failed = 0
for (const [name, run] of checks) {
  const started = Date.now()
  try {
    await run()
    console.log(`  ok    ${name} (${Date.now() - started}ms)`)
  } catch (error) {
    failed += 1
    console.log(`  FAIL  ${name}: ${error.message}`)
  }
}

console.log(`\n${checks.length - failed}/${checks.length} passed`)
process.exitCode = failed > 0 ? 1 : 0
