import { createUpstashLimiter, handleContactRequest } from '../lib/contact.js'

export default async (req, context) =>
  handleContactRequest(req, {
    ip: context.ip,
    resendApiKey: Netlify.env.get('RESEND_API_KEY'),
    toEmail: Netlify.env.get('CONTACT_TO_EMAIL'),
    fromEmail: Netlify.env.get('CONTACT_FROM_EMAIL'),
    // Longer-window limit (3 per 10 minutes) when Upstash is configured.
    limiter: await createUpstashLimiter({
      url: Netlify.env.get('UPSTASH_REDIS_REST_URL'),
      token: Netlify.env.get('UPSTASH_REDIS_REST_TOKEN'),
    }),
  })

export const config = {
  path: '/api/contact',
  // Platform-enforced burst limit, applied before the function runs (max window is 180s).
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ['ip', 'domain'],
  },
}
