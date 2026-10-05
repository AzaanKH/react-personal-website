// The small label above a heading. Use one only when it adds something the heading
// doesn't say (what a playful heading is about, or why the page exists); never to
// repeat the nav or the heading. `number` marks sections on long pages ("01").
export default function Kicker({ number, children, className = '' }) {
  return (
    <p className={`kicker ${className}`}>
      {number && <span className="kicker-number">{number}</span>}
      <span className="kicker-rule" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}
