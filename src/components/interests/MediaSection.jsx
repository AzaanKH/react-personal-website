import { tmdbPoster } from '../../lib/posters'
import PosterCard, { PosterShelf } from './PosterCard'
import Section from './Section'

// `entries` come from src/data/interests.json (movies, shows, or anime), in display order.
// Written by `npm run add`; rating (0.5–5) and review are filled in by hand.
// One shelf per section, so the shelf has no title of its own: the kicker already says
// what it is, and "Show all 23" carries the count.
export default function MediaSection({ id, number, kicker, title, tmdbType, entries, reverse }) {
  return (
    <Section id={id} number={number} kicker={kicker} title={title}>
      <PosterShelf label={kicker} rotate reverse={reverse}>
        {entries.map((entry) => (
          <PosterCard
            key={entry.tmdbId}
            title={entry.title}
            subtitle={entry.year}
            src={tmdbPoster(entry.poster)}
            href={`https://www.themoviedb.org/${tmdbType}/${entry.tmdbId}`}
            rating={entry.rating}
            note={entry.review}
          />
        ))}
      </PosterShelf>
    </Section>
  )
}
