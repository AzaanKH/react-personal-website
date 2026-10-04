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

// Validation and delivery happen in one request, so neither can be skipped by
// posting somewhere else. Rate limiting is enforced by Netlify before this runs
// (see `config.rateLimit` in netlify/functions/contact.js).
export async function handleContactRequest(req, {
  resendApiKey,
  toEmail,
  fromEmail,
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

  try {
    await send({ apiKey: resendApiKey, from: fromEmail, to: toEmail, name, email, message })
  } catch (error) {
    console.error('contact: delivery failed', error?.message)
    return json({ error: 'Failed to send message. Please try again or email me directly.' }, 502)
  }

  return json({ ok: true }, 200)
}
