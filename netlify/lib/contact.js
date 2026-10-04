import { validateContact } from '../../src/lib/contactValidation.js'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const SEND_TIMEOUT_MS = 10000
const MAX_BODY_BYTES = 20_000

function json(body, status, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

function isCrossOrigin(req) {
  const origin = req.headers.get('origin')
  if (!origin) return false
  try {
    return new URL(origin).host !== new URL(req.url).host
  } catch {
    return true
  }
}

const singleLine = (value) => value.replace(/[\r\n]+/g, ' ').trim()

// Returns `(key) => Promise<{ success, reset }>` backed by Upstash, or null when
// Upstash isn't configured (the platform rate limit on the function still applies).
export async function createUpstashLimiter({ url, token }) {
  if (!url || !token) return null

  let Ratelimit, Redis
  try {
    ;[{ Ratelimit }, { Redis }] = await Promise.all([
      import('@upstash/ratelimit'),
      import('@upstash/redis'),
    ])
  } catch (error) {
    // Configured but unusable: surface it as a limiter failure so the handler fails closed.
    return async () => { throw error }
  }

  const ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    prefix: 'contact_rate_limit',
  })
  return (key) => ratelimit.limit(key)
}

export async function sendWithResend({ apiKey, from, to, name, email, message, fetchImpl = fetch }) {
  const response = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Portfolio message from ${singleLine(name)}`,
      text: `From: ${singleLine(name)} <${email}>\n\n${message}`,
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}`)
  }
}

// Validation, rate limiting, and delivery happen in one request, so none of them
// can be skipped by posting somewhere else.
export async function handleContactRequest(req, {
  ip,
  resendApiKey,
  toEmail,
  fromEmail,
  limiter,
  send = sendWithResend,
}) {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }
  if (isCrossOrigin(req)) {
    return json({ error: 'Cross-origin requests are not allowed' }, 403)
  }
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return json({ error: 'Expected application/json' }, 415)
  }

  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: 'Message is too large' }, 413)
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // Honeypot: real visitors never see this field. Pretend success so bots don't adapt.
  if (payload.website) {
    return json({ ok: true }, 200)
  }

  const name = String(payload.name ?? '').trim()
  const email = String(payload.email ?? '').trim()
  const message = String(payload.message ?? '').trim()
  const errors = validateContact({ name, email, message })
  if (Object.keys(errors).length > 0) {
    return json({ error: 'Please fix the highlighted fields.', errors }, 400)
  }

  if (!resendApiKey || !toEmail || !fromEmail) {
    console.error('contact: RESEND_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL is not configured')
    return json({ error: 'The contact form is temporarily unavailable. Please email me directly.' }, 503)
  }

  if (limiter) {
    let result
    try {
      result = await limiter(`ip:${ip ?? 'unknown'}`)
    } catch (error) {
      // Fail closed: an unavailable limiter must not become an unlimited one.
      console.error('contact: rate limiter unavailable', error?.message)
      return json({ error: 'The contact form is temporarily unavailable. Please email me directly.' }, 503)
    }

    if (!result.success) {
      const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
      return json(
        { error: 'Too many messages. Please try again in a few minutes.', retryAfter },
        429,
        { 'Retry-After': String(retryAfter) },
      )
    }
  }

  try {
    await send({ apiKey: resendApiKey, from: fromEmail, to: toEmail, name, email, message })
  } catch (error) {
    console.error('contact: delivery failed', error?.message)
    return json({ error: 'Failed to send message. Please try again or email me directly.' }, 502)
  }

  return json({ ok: true }, 200)
}
