import { locationPath } from '../lib/routes'

function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

// A real <a href> (so middle-click, "open in new tab", and crawlers work) that
// performs client-side navigation on a plain click. Pass `slug` with to="blog" to link a post.
// React 19 passes `ref` as a regular prop, so no forwardRef is needed.
export default function RouteLink({ to, slug, onNavigate, onClick, children, ...props }) {
  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || !isPlainLeftClick(event)) return

    event.preventDefault()
    onNavigate(to, slug)
  }

  return (
    <a href={locationPath({ page: to, slug })} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
