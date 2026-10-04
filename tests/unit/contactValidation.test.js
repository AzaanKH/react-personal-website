import { describe, expect, it } from 'vitest'
import { CONTACT_LIMITS, validateContact } from '../../src/lib/contactValidation'

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, nice site!' }

describe('validateContact', () => {
  it('accepts a complete message', () => {
    expect(validateContact(valid)).toEqual({})
  })

  it('requires every field', () => {
    expect(Object.keys(validateContact({}))).toEqual(['name', 'email', 'message'])
  })

  it('treats whitespace-only values as empty', () => {
    expect(validateContact({ ...valid, name: '   ' }).name).toBe('Enter your name.')
  })

  it.each(['plainaddress', 'a@b', 'a b@c.com', '@example.com'])('rejects the email %s', (email) => {
    expect(validateContact({ ...valid, email }).email).toBe('Enter a valid email address.')
  })

  it('enforces message length bounds', () => {
    expect(validateContact({ ...valid, message: 'short' }).message).toMatch(/at least/)
    expect(validateContact({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.message + 1) }).message).toMatch(/or fewer/)
  })

  it('caps the name length', () => {
    expect(validateContact({ ...valid, name: 'x'.repeat(CONTACT_LIMITS.name + 1) }).name).toMatch(/or fewer/)
  })
})
