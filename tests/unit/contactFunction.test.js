import { describe, expect, it, vi } from 'vitest'
import { handleContactRequest, sendWithResend } from '../../netlify/lib/contact.js'

const validBody = { name: 'Ada', email: 'ada@example.com', message: 'Hello from the tests!' }
const config = (overrides = {}) => ({
  resendApiKey: 're_test',
  toEmail: 'owner@example.com',
  fromEmail: 'Portfolio <contact@example.com>',
  send: vi.fn(async () => {}),
  ...overrides,
})

function post(body, headers = {}) {
  return new Request('https://azaankhalfe.netlify.app/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('handleContactRequest', () => {
  it('validates and sends a valid message', async () => {
    const options = config()
    const res = await handleContactRequest(post(validBody), options)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(options.send).toHaveBeenCalledWith(expect.objectContaining({
      to: 'owner@example.com',
      name: 'Ada',
      email: 'ada@example.com',
      message: 'Hello from the tests!',
    }))
  })

  it('rejects invalid input without sending', async () => {
    const options = config()
    const res = await handleContactRequest(post({ ...validBody, email: 'nope' }), options)

    expect(res.status).toBe(400)
    expect((await res.json()).errors).toEqual({ email: 'Enter a valid email address.' })
    expect(options.send).not.toHaveBeenCalled()
  })

  it('silently accepts honeypot submissions without sending', async () => {
    const options = config()
    const res = await handleContactRequest(post({ ...validBody, website: 'http://spam.example' }), options)

    expect(res.status).toBe(200)
    expect(options.send).not.toHaveBeenCalled()
  })

  it('returns 503 when email delivery is not configured', async () => {
    const res = await handleContactRequest(post(validBody), config({ resendApiKey: undefined }))
    expect(res.status).toBe(503)
  })

  it('returns 502 when delivery fails', async () => {
    const res = await handleContactRequest(
      post(validBody),
      config({ send: vi.fn(async () => { throw new Error('boom') }) }),
    )
    expect(res.status).toBe(502)
  })

  it.each([
    ['GET', () => new Request('https://azaankhalfe.netlify.app/api/contact'), 405],
    ['cross-origin', () => post(validBody, { Origin: 'https://evil.example' }), 403],
    ['non-JSON', () => post('name=a', { 'Content-Type': 'application/x-www-form-urlencoded' }), 415],
    ['malformed JSON', () => post('{nope'), 400],
    ['oversized', () => post({ ...validBody, message: 'x'.repeat(25_000) }), 413],
  ])('rejects %s requests', async (_label, makeRequest, status) => {
    const res = await handleContactRequest(makeRequest(), config())
    expect(res.status).toBe(status)
  })
})

describe('sendWithResend', () => {
  it('posts a plain-text email with reply-to and a single-line subject', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }))
    await sendWithResend({
      apiKey: 're_test',
      from: 'Portfolio <contact@example.com>',
      to: 'owner@example.com',
      name: 'Ada\r\nBcc: victim@example.com',
      email: 'ada@example.com',
      message: 'Hi',
      fetchImpl,
    })

    const [url, init] = fetchImpl.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(url).toBe('https://api.resend.com/emails')
    expect(init.headers.Authorization).toBe('Bearer re_test')
    expect(body.reply_to).toBe('ada@example.com')
    expect(body.subject).not.toMatch(/[\r\n]/)
  })

  it('throws on a non-2xx response', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 422 }))
    await expect(
      sendWithResend({ apiKey: 'k', from: 'f', to: 't', name: 'n', email: 'e', message: 'm', fetchImpl }),
    ).rejects.toThrow('422')
  })
})
