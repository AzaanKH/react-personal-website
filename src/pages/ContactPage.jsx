import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Check, Loader2, ArrowUpRight } from 'lucide-react'
import Kicker from '../components/Kicker'
import { CONTACT_LIMITS, validateContact } from '../lib/contactValidation'
import {
  resetStatus,
  showValidationError,
  submitContact,
  updateField,
  useContactForm,
} from '../lib/contactForm'

// text-base (16px) at every width: iOS Safari zooms the page when a smaller field is focused.
const inputClassName =
  'w-full bg-transparent border-0 border-b px-0 py-2.5 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]'

const fields = [
  {
    name: 'name',
    type: 'text',
    label: 'Name',
    placeholder: 'Your name',
    autoComplete: 'name',
    maxLength: CONTACT_LIMITS.name,
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'your@email.com',
    autoComplete: 'email',
    maxLength: CONTACT_LIMITS.email,
  },
]

export default function ContactPage() {
  // Draft and submission state are in a store that outlives this page (lib/contactForm.js),
  // so a send that finishes after navigating away still clears the draft and reports success.
  const { draft: formData, status, errorMessage, serverErrors } = useContactForm()
  const [honeypot, setHoneypot] = useState('')
  const [touched, setTouched] = useState({})
  const validationErrors = { ...serverErrors, ...validateContact(formData) }
  const messageError = touched.message && validationErrors.message
  const feedbackMessage =
    status === 'sending'
      ? 'Sending your message.'
      : status === 'success'
        ? "Thanks, your message was sent. I'll get back to you soon."
        : errorMessage

  // Return the button to its idle state a few seconds after success or failure.
  useEffect(() => {
    if (status !== 'success' && status !== 'error') return
    const timer = setTimeout(resetStatus, 4000)
    return () => clearTimeout(timer)
  }, [status])

  const handleChange = (e) => {
    updateField(e.target.name, e.target.value)
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const focusFirstError = (errors) => {
    requestAnimationFrame(() => {
      document.getElementById(Object.keys(errors)[0])?.focus()
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const errors = validateContact(formData)

    if (Object.keys(errors).length > 0) {
      setTouched({ name: true, email: true, message: true })
      showValidationError('Please fix the highlighted fields.')
      focusFirstError(errors)
      return
    }

    const result = await submitContact(formData, honeypot)
    if (result.ok) {
      setTouched({})
    } else if (result.errors) {
      setTouched({ name: true, email: true, message: true })
      focusFirstError(result.errors)
    }
  }

  return (
    <div className="page-shell pb-12 pt-4 md:pt-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Kicker className="mb-5">Let&apos;s work together</Kicker>
          <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
            Say<br /><em style={{ color: 'var(--color-accent)' }}>hello.</em>
          </h1>
          <p className="mt-8 max-w-sm text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            Have an interesting problem, a role worth talking about, or a project that needs thoughtful engineering? My inbox is open.
          </p>
          <a href="mailto:azaankhalfe@gmail.com" className="mt-7 inline-flex items-center gap-2 border-b pb-1 text-sm hover-accent" style={{ color: 'var(--color-text)', borderColor: 'var(--color-accent)' }}>
            azaankhalfe@gmail.com <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

      <div
        className="p-6 md:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 16,
        }}
      >
        <div className="mb-8 flex items-center border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: 'var(--color-accent)' }}>Replies in 1–2 days</span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <p hidden>
            <label>
              Don't fill this out:{' '}
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </p>
          {fields.map((field, i) => {
            const error = touched[field.name] && validationErrors[field.name]
            const errorId = `${field.name}-error`

            return (
              <motion.div
                key={field.name}
                className="space-y-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <label
                  htmlFor={field.name}
                  className="block text-[0.7rem] tracking-[0.15em] uppercase font-light"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className={inputClassName}
                  style={{
                    color: 'var(--color-text)',
                    borderColor: error
                      ? 'var(--color-accent)'
                      : 'var(--color-border)',
                    transition: 'border-color 0.3s, outline-color 0.2s',
                  }}
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      id={errorId}
                      className="text-sm"
                      style={{ color: 'var(--color-accent)' }}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <label
              htmlFor="message"
              className="block text-[0.7rem] tracking-[0.15em] uppercase font-light"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              rows={4}
              maxLength={CONTACT_LIMITS.message}
              placeholder="Your message"
              aria-invalid={Boolean(messageError)}
              aria-describedby={messageError ? 'message-error' : undefined}
              className={`${inputClassName} resize-none [field-sizing:content] min-h-[calc(4lh+1.25rem)] max-h-[calc(14lh+1.25rem)]`}
              style={{
                color: 'var(--color-text)',
                borderColor: messageError
                  ? 'var(--color-accent)'
                  : 'var(--color-border)',
                transition: 'border-color 0.3s, outline-color 0.2s',
              }}
            />
            <AnimatePresence>
              {messageError && (
                <motion.p
                  id="message-error"
                  className="text-sm"
                  style={{ color: 'var(--color-accent)' }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                >
                  {messageError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              aria-describedby="contact-form-feedback"
              aria-busy={status === 'sending'}
              className="rounded-full px-8 py-3 text-[0.8rem] font-medium uppercase tracking-[0.15em] press hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer hover-accent-bg"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
                transition: 'transform 0.15s, scale 0.15s, opacity 0.2s, background-color 0.2s',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.span
                    key="idle"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Send size={14} strokeWidth={1.5} /> Send Message
                  </motion.span>
                )}
                {status === 'sending' && (
                  <motion.span
                    key="sending"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 size={14} className="animate-spin" /> Sending…
                  </motion.span>
                )}
                {status === 'success' && (
                  <motion.span
                    key="success"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Check size={14} /> Sent
                  </motion.span>
                )}
                {status === 'error' && (
                  <motion.span
                    key="error"
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Try Again
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>

          <div
            id="contact-form-feedback"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-5"
          >
            <AnimatePresence mode="wait">
              {feedbackMessage && (
                <motion.p
                  key={feedbackMessage}
                  className="text-sm"
                  style={{
                    color:
                      status === 'success'
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-accent)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {feedbackMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
      </div>
    </div>
  )
}
