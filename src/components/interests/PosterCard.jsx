import { useState } from 'react'
import { Star } from 'lucide-react'
import PosterCarousel from './PosterCarousel'

// One card for every shelf: movies, shows, anime, and games. Posters sit in a 2:3
// frame; IGDB's ~3:4 covers are cropped slightly at the sides by object-cover.
// Image stages: 0 = src, 1 = fallbackSrc (a landscape image, letterboxed), 2 = text tile.
export default function PosterCard({ title, subtitle, src, fallbackSrc, href, badge, meta, rating, note }) {
  const [stage, setStage] = useState(src ? 0 : fallbackSrc ? 1 : 2)
  const imageSrc = stage === 0 ? src : stage === 1 ? fallbackSrc : null

  const poster = (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '2 / 3',
        borderRadius: 10,
        backgroundColor: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setStage((previous) => (previous === 0 && fallbackSrc ? 1 : 2))}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] ${stage === 1 ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <div className="flex h-full items-end p-3">
          <span className="display-heading text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            {title}
          </span>
        </div>
      )}

      {badge && (
        <span
          className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em]"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.72)', color: '#f5f0eb' }}
        >
          {badge}
        </span>
      )}
      {meta && (
        <span
          className="absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[0.65rem] font-medium tabular-nums"
          style={{ backgroundColor: 'rgba(15, 15, 15, 0.72)', color: '#f5f0eb' }}
        >
          {meta}
        </span>
      )}
    </div>
  )

  return (
    <li className="group min-w-0">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} (opens in a new tab)`}>
          {poster}
        </a>
      ) : (
        poster
      )}
      <div className="mt-2.5 min-w-0">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--color-text)' }} title={title}>
          {title}
        </p>
        {(subtitle || rating != null) && (
          <p className="mt-0.5 flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {subtitle && <span className="truncate">{subtitle}</span>}
            {rating != null && (
              <span className="inline-flex flex-shrink-0 items-center gap-0.5" style={{ color: 'var(--color-accent)' }}>
                <Star size={11} strokeWidth={0} fill="currentColor" aria-hidden="true" />
                <span className="sr-only">Rated </span>
                {rating}
                <span className="sr-only"> out of 5</span>
              </span>
            )}
          </p>
        )}
        {note && (
          <p className="mt-1.5 line-clamp-3 text-xs leading-5" style={{ color: 'var(--color-text-secondary)' }}>
            {note}
          </p>
        )}
      </div>
    </li>
  )
}

// Shelves with more posters than fit in a row become a PosterCarousel: slow auto-scroll,
// hover/focus pauses, drag and a scrollbar to browse. "Show all" swaps to the full grid,
// which also covers WCAG 2.2.2 (moving content needs a way to stop it).
const ROTATE_MIN_ITEMS = 7

const GRID_CLASSES = 'grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-6'

// `title` names a shelf when a section has several (Gaming); `label` names it for screen
// readers when it has no visible title.
export function PosterShelf({ title, label, description, children, footer, rotate = false, reverse = false }) {
  const [showAll, setShowAll] = useState(false)
  const count = Array.isArray(children) ? children.length : 1
  const rotating = rotate && count >= ROTATE_MIN_ITEMS && !showAll

  return (
    <div className="mt-10 first:mt-0">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        {title ? (
          <h3 className="eyebrow" style={{ color: 'var(--color-text-secondary)' }}>
            {title}
          </h3>
        ) : (
          <span />
        )}
        <div className="flex items-baseline gap-4">
          {description && (
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {description}
            </p>
          )}
          {rotate && count >= ROTATE_MIN_ITEMS && (
            <button
              type="button"
              onClick={() => setShowAll((previous) => !previous)}
              aria-expanded={showAll}
              className="hover-accent cursor-pointer text-[0.7rem] uppercase tracking-[0.12em] underline-offset-4 hover:underline"
              style={{ color: 'var(--color-text)' }}
            >
              {showAll ? 'Collapse' : `Show all ${count}`}
            </button>
          )}
        </div>
      </div>

      {rotating ? (
        <PosterCarousel reverse={reverse} label={`${title ?? label}, ${count} posters`}>
          {children}
        </PosterCarousel>
      ) : (
        <ul className={GRID_CLASSES}>{children}</ul>
      )}
      {footer}
    </div>
  )
}
