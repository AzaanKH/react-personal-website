// Components that markdown renders as inside a post; lib/mdxComponents.js maps them.
// Typography lives in .post-prose (index.css).

// The post title is the page's one h1 (PageTransition focuses it), so `#` renders as h2.
export function Heading1(props) {
  return <h2 {...props} />
}

export function Link({ href = '', ...props }) {
  const external = /^https?:\/\//.test(href)
  return <a href={href} {...(external && { target: '_blank', rel: 'noopener noreferrer' })} {...props} />
}

export function Callout({ title, children }) {
  return (
    <aside className="post-callout">
      {title && <p className="post-callout-title">{title}</p>}
      {children}
    </aside>
  )
}
