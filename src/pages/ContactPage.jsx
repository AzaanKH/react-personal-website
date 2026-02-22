import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Check, Loader2 } from 'lucide-react'
import emailjs from '@emailjs/browser'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    try {
      // Rate limit check (fail-safe)
      try {
        const rateResponse = await fetch('/.netlify/functions/rate-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ check: true }),
        })
        if (rateResponse.status === 429) {
          const result = await rateResponse.json()
          setErrorMessage(
            result.message || 'Too many submissions. Please wait.'
          )
          setStatus('error')
          setTimeout(() => setStatus('idle'), 4000)
          return
        }
      } catch {
        // Rate limit unavailable, continue
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_name: 'Azaan Khalfe',
          from_name: formData.from_name,
          from_email: formData.from_email,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setStatus('success')
      setFormData({ from_name: '', from_email: '', message: '' })
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setErrorMessage('Failed to send message. Please try again.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const fields = [
    {
      name: 'from_name',
      type: 'text',
      label: 'Name',
      placeholder: 'Your name',
    },
    {
      name: 'from_email',
      type: 'email',
      label: 'Email',
      placeholder: 'your@email.com',
    },
  ]

  return (
    <div className="w-full max-w-[520px] mx-auto pt-4 md:pt-8 pb-8 px-6">
      <h2
        className="font-bold mb-3 tracking-[-0.02em]"
        style={{
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: 'var(--color-text)',
        }}
      >
        Say Hello
      </h2>

      <p
        className="mb-10"
        style={{
          fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
          color: 'var(--color-text-secondary)',
        }}
      >
        Have a question or want to work together?
      </p>

      <div
        className="rounded-xl p-6 md:p-8"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field, i) => (
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
                required
                placeholder={field.placeholder}
                autoComplete={field.type === 'email' ? 'email' : 'name'}
                className="w-full bg-transparent border-0 border-b px-0 py-2.5 focus:outline-none"
                style={{
                  fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                  transition: 'border-color 0.3s',
                }}
              />
            </motion.div>
          ))}

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
              required
              rows={4}
              placeholder="Your message"
              className="w-full bg-transparent border-0 border-b px-0 py-2.5 focus:outline-none resize-none"
              style={{
                fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
                transition: 'border-color 0.3s',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              className="rounded-full px-8 py-3 text-[0.8rem] font-medium uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer hover-accent-bg"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
                transition: 'transform 0.15s, opacity 0.2s, background-color 0.2s',
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
                    <Loader2 size={14} className="animate-spin" /> Sending...
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
                    <Check size={14} /> Sent!
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

          <AnimatePresence>
            {errorMessage && (
              <motion.p
                className="text-sm"
                style={{ color: 'var(--color-accent)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {errorMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
