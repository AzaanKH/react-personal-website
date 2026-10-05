import { createContext } from 'react'

// True inside PosterCarousel's two duplicate copies of a row. Those copies scroll into
// view, so their posters must stay clickable (not `inert`); they're only hidden from
// screen readers (aria-hidden on the list) and taken out of the Tab order.
export const CarouselCopyContext = createContext(false)
