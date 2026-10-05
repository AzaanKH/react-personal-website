// Geometry for the endless poster carousel (components/interests/PosterCarousel.jsx).
// The row is rendered three times and scrolled within the middle copy.

// Keeps `position` within half a copy of the middle copy's start.
export function wrapPosition(position, copyWidth) {
  if (copyWidth <= 0) return position
  if (position < copyWidth * 0.5) return position + copyWidth
  if (position >= copyWidth * 1.5) return position - copyWidth
  return position
}

// Thumb geometry in % of the track. The thumb wraps around the end like the row does,
// so it can come back as a second piece on the left.
export function thumbGeometry(position, copyWidth, viewportWidth) {
  if (copyWidth <= 0) return { left: 0, width: 100, wrapWidth: 0, fraction: 0 }
  const fraction = ((((position - copyWidth) % copyWidth) + copyWidth) % copyWidth) / copyWidth
  const width = Math.min(100, Math.max(8, (viewportWidth / copyWidth) * 100))
  const left = fraction * 100
  return { left, width, wrapWidth: Math.max(0, left + width - 100), fraction }
}
