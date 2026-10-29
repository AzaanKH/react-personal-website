// A row of headline numbers for a post. A description list, so each value is read with
// its label: <Stats><Stat value="43" label="merged PRs">detail</Stat></Stats>.
export function Stats({ children }) {
  return <dl className="post-stats">{children}</dl>
}

export function Stat({ value, label, children }) {
  return (
    <div className="post-stat">
      <dt className="post-stat-label">{label}</dt>
      <dd className="post-stat-value">{value}</dd>
      {children && <dd className="post-stat-detail">{children}</dd>}
    </div>
  )
}
