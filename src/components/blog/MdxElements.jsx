// Components that markdown renders as inside a post; lib/mdxComponents.js maps them.
// Typography lives in .post-prose (index.css).
import { headingId } from '../../lib/headingId'

// A heading's plain text, through any inline code or emphasis inside it.
const textOf = (node) => {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  return textOf(node.props?.children)
}

// The post title is the page's one h1 (PageTransition focuses it), so `#` renders as h2,
// the same as `##`. Its id comes from its text, matching the post's `headings` list
// (lib/postMeta.js), which the "In this post" links point at.
export function SectionHeading({ children, ...props }) {
  return <h2 id={headingId(textOf(children))} {...props}>{children}</h2>
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
