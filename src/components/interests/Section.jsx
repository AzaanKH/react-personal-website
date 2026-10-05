import Kicker from '../Kicker'

// `kicker` says plainly what the section is (the heading is wordplay); `number` gives
// its place on the page, matching the jump links.
export default function Section({ id, number, kicker, title, children, aside }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 pt-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <Kicker number={number} className="mb-4">
            {kicker}
          </Kicker>
          <h2
            id={`${id}-heading`}
            className="display-heading"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'var(--color-text)' }}
          >
            {title}
          </h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function UpdatedAt({ timestamp, prefix = 'Updated' }) {
  if (!timestamp) return null
  return `${prefix} ${new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}
