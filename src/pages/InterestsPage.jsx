import { useEffect } from 'react'
import interests from '../data/interests.json'
import FantasySection from '../components/interests/FantasySection'
import GamingSection from '../components/interests/GamingSection'
import MediaSection from '../components/interests/MediaSection'

const MEDIA_SECTIONS = [
  { id: 'movies', label: 'Movies', tmdbType: 'movie', title: <>Now <em style={{ color: 'var(--color-accent)' }}>showing.</em></> },
  { id: 'shows', label: 'Shows', tmdbType: 'tv', title: <>On the <em style={{ color: 'var(--color-accent)' }}>queue.</em></> },
  { id: 'anime', label: 'Anime', tmdbType: 'tv', title: <>Next <em style={{ color: 'var(--color-accent)' }}>episode.</em></> },
].filter(({ id }) => interests[id].length > 0)

// Page order. Each section's number ("01") is its position here, shown both in its
// kicker and in the jump links, so they always agree.
const SECTIONS = [
  { id: 'football', label: 'Fantasy football' },
  { id: 'gaming', label: 'Gaming' },
  ...MEDIA_SECTIONS,
].map((section, index) => ({ ...section, number: String(index + 1).padStart(2, '0') }))
const numberOf = (id) => SECTIONS.find((section) => section.id === id).number

// Scrolls without touching the URL: a hash change fires `popstate`, which App treats
// as navigation (and would move focus back to the h1).
function scrollToSection(event, id) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  target.querySelector('h2')?.setAttribute('tabindex', '-1')
  target.querySelector('h2')?.focus({ preventScroll: true })
}

export default function InterestsPage() {
  // /interests#gaming (including the old /gaming URL, which 301s there) lands on that section.
  // Sleeper and Steam load above the later sections and push them down, so re-align
  // once they've had a moment to arrive.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const align = () => document.getElementById(id)?.scrollIntoView({ block: 'start' })
    align()
    const timer = setTimeout(align, 1200)
    // A scroll by the visitor in the meantime wins.
    const cancel = () => clearTimeout(timer)
    window.addEventListener('wheel', cancel, { once: true, passive: true })
    window.addEventListener('touchstart', cancel, { once: true, passive: true })
    return () => {
      cancel()
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
    }
  }, [])

  return (
    <div className="page-shell pb-16 pt-4 md:pt-8">
      {/* No kicker: the nav already says "Interests", and the title says the rest. */}
      <h1 className="display-heading page-title mb-5" style={{ color: 'var(--color-text)' }}>
        Off the <em style={{ color: 'var(--color-accent)' }}>clock.</em>
      </h1>
      <p className="mb-8 max-w-lg text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
        Fantasy football, games, and whatever I&apos;ve been watching, with live data from Sleeper and Steam.
      </p>

      <nav aria-label="Interests sections">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label, number }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => scrollToSection(event, id)}
                className="hover-text inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.7rem] uppercase tracking-[0.12em]"
                style={{ color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                <span className="kicker-number">{number}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <FantasySection number={numberOf('football')} />
      <GamingSection number={numberOf('gaming')} />
      {MEDIA_SECTIONS.map(({ id, label, tmdbType, title }, index) => (
        <MediaSection
          key={id}
          id={id}
          number={numberOf(id)}
          kicker={label}
          title={title}
          tmdbType={tmdbType}
          entries={interests[id]}
          reverse={index % 2 === 1}
        />
      ))}

      {MEDIA_SECTIONS.length > 0 && (
        <p className="mt-16 text-[0.7rem] leading-5" style={{ color: 'var(--color-text-secondary)' }}>
          Movie, show, and anime posters from{' '}
          <a className="hover-accent underline" href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      )}
    </div>
  )
}
