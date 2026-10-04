import { handleContactRequest } from '../lib/contact.js'

export default async (req) =>
  handleContactRequest(req, {
    resendApiKey: Netlify.env.get('RESEND_API_KEY'),
    toEmail: Netlify.env.get('CONTACT_TO_EMAIL'),
    fromEmail: Netlify.env.get('CONTACT_FROM_EMAIL'),
  })

export const config = {
  path: '/api/contact',
  // Netlify enforces this per IP before the function runs; requests over the
  // limit get a 429 without invoking the function (max window is 180s).
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ['ip', 'domain'],
  },
}
