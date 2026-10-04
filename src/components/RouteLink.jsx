import { routes } from '../lib/routes'

function isPlainLeftClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

// A real <a href> (so middle-click, "open in new tab", and crawlers work) that
// performs client-side navigation on a plain click.
// React 19 passes `ref` as a regular prop, so no forwardRef is needed.
export default function RouteLink({ to, onNavigate, onClick, children, ...props }) {
  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || !isPlainLeftClick(event)) return

    event.preventDefault()
    onNavigate(to)
  }

  return (
    <a href={routes[to].path} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}
