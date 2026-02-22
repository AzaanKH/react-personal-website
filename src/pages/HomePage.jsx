import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Github, Linkedin, Mail, FileText } from 'lucide-react'
import StatusCorner from '../components/StatusCorner'

let hasPlayedIntro = false

const firstName = 'AZAAN'.split('')
const lastName = 'KHALFE'.split('')

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/AzaanKH',
    label: 'GitHub',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/azaan-khalfe-43b90b221/',
    label: 'LinkedIn',
  },
]

export default function HomePage({ onNavigate }) {
  const isFirstVisit = !hasPlayedIntro

  useEffect(() => {
    hasPlayedIntro = true
  }, [])

  const totalLetters = firstName.length + lastName.length
  const letterDelay = 0.06
  const nameAnimDuration = totalLetters * letterDelay + 0.5
  const subtitleDelay = nameAnimDuration
  const socialDelay = subtitleDelay + 0.3

  return (
    <div className="flex flex-col items-center text-center justify-center min-h-[calc(100vh-5rem)] pb-24 px-8 md:px-16 lg:px-24 max-w-[1200px] mx-auto">
      <h1
        className="leading-[0.85] font-bold select-none tracking-[-0.03em]"
        aria-label="Azaan Khalfe"
      >
        <span
          className="block"
          style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}
        >
          {firstName.map((letter, i) => (
            <motion.span
              key={`f-${i}`}
              className="inline-block"
              initial={isFirstVisit ? { opacity: 0, y: 50, scale: 0.9 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={isFirstVisit ? {
                delay: i * letterDelay,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              } : { duration: 0 }}
              style={{ color: 'var(--color-text)' }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
        <span
          className="block"
          style={{ fontSize: 'clamp(4rem, 12vw, 10rem)' }}
        >
          {lastName.map((letter, i) => (
            <motion.span
              key={`l-${i}`}
              className="inline-block"
              initial={isFirstVisit ? { opacity: 0, y: 50, scale: 0.9 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={isFirstVisit ? {
                delay: firstName.length * letterDelay + i * letterDelay,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              } : { duration: 0 }}
              style={{ color: 'var(--color-text)' }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      </h1>

      <motion.p
        className="mt-6 uppercase tracking-[0.25em] font-light"
        style={{
          fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
          color: 'var(--color-text-secondary)',
        }}
        initial={isFirstVisit ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={isFirstVisit ? { delay: subtitleDelay, duration: 0.5 } : { duration: 0 }}
      >
        Software Engineer
      </motion.p>

      {/* Terracotta accent line */}
      <motion.div
        className="mt-6 h-[2px] w-12 rounded-full mx-auto"
        style={{ backgroundColor: 'var(--color-accent)' }}
        initial={isFirstVisit ? { opacity: 0, scaleX: 0 } : false}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={isFirstVisit ? { delay: subtitleDelay + 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      />

      <motion.div
        className="mt-8 flex items-center justify-center gap-5"
        initial={isFirstVisit ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={isFirstVisit ? { delay: socialDelay, duration: 0.5 } : { duration: 0 }}
      >
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="hover:scale-110 active:scale-95 hover-accent"
            style={{
              color: 'var(--color-text-secondary)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
            }}
          >
            <Icon size={20} strokeWidth={1.5} />
          </a>
        ))}

        <button
          onClick={() => onNavigate('contact')}
          aria-label="Send email"
          className="hover:scale-110 active:scale-95 cursor-pointer hover-accent"
          style={{
            color: 'var(--color-text-secondary)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease',
          }}
        >
          <Mail size={20} strokeWidth={1.5} />
        </button>

        <span
          className="w-px h-4"
          style={{ backgroundColor: 'var(--color-border)' }}
          aria-hidden="true"
        />

        <a
          href="/Azaan_Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover-accent"
          style={{
            color: 'var(--color-text-secondary)',
            transition: 'color 0.2s ease',
            fontSize: 'clamp(0.75rem, 1vw, 0.85rem)',
          }}
        >
          <FileText size={16} strokeWidth={1.5} />
          <span className="tracking-[0.15em] uppercase font-light">Resume</span>
        </a>
      </motion.div>

      <StatusCorner enterDelay={socialDelay + 0.5} animate={isFirstVisit} />
    </div>
  )
}
