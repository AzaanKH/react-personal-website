// Shared by ContactPage (instant feedback) and netlify/lib/contact.js (enforcement).
export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
  minMessage: 10,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact({ name = '', email = '', message = '' } = {}) {
  const errors = {}
  const trimmedName = String(name).trim()
  const trimmedEmail = String(email).trim()
  const trimmedMessage = String(message).trim()

  if (!trimmedName) {
    errors.name = 'Enter your name.'
  } else if (trimmedName.length > CONTACT_LIMITS.name) {
    errors.name = `Name must be ${CONTACT_LIMITS.name} characters or fewer.`
  }

  if (!trimmedEmail) {
    errors.email = 'Enter your email address.'
  } else if (trimmedEmail.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!trimmedMessage) {
    errors.message = 'Enter a message.'
  } else if (trimmedMessage.length < CONTACT_LIMITS.minMessage) {
    errors.message = `Message must be at least ${CONTACT_LIMITS.minMessage} characters.`
  } else if (trimmedMessage.length > CONTACT_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_LIMITS.message} characters or fewer.`
  }

  return errors
}
