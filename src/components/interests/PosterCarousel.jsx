import { Children, useEffect, useRef } from 'react'
import { thumbGeometry, wrapPosition } from '../../lib/carousel'
import { CarouselCopyContext } from './carouselCopy'

// An endless poster row built on a real horizontal scroll container, so trackpad
// swipes, touch momentum, Shift+wheel, and Tab-to-focus all work natively. On top:
//   - slow auto-scroll that eases to a stop on hover/focus/drag and back up on leave
//   - mouse drag to browse (touch uses native scrolling)
//   - a hairline scrollbar that wraps like a ring, plus an "07 / 23" position counter
// The list is rendered three times; the scroll position is kept within the middle
// copy and jumps by exactly one copy when it drifts too far, which is invisible.
// Reduced motion: no auto-scroll; dragging and the scrollbar still work.

const SPEED_PX_PER_S = 30
const EASE_PER_S = 3 // how quickly speed approaches its target (pause/resume glide)
const DRAG_THRESHOLD_PX = 5
const TOUCH_RESUME_MS = 2000

export default function PosterCarousel({ children, reverse = false, label }) {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const thumbRef = useRef(null)
  const thumbWrapRef = useRef(null)
  const counterRef = useRef(null)
  const count = Children.count(children)

  useEffect(() => {
    const viewport = viewportRef.current
    const copies = viewport.querySelectorAll('[data-copy]')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    let copyWidth = 0
    let position = 0
    let velocity = 0
    let lastFrame = performance.now()
    let frame = 0
    const pause = { hover: false, drag: false, touch: false, offscreen: false }
    let touchTimer = 0

    const measure = () => {
      const previous = copyWidth
      copyWidth = copies[1].offsetLeft - copies[0].offsetLeft
      // First measure (or a resize): land on the same spot within the middle copy.
      position = previous ? copyWidth + ((viewport.scrollLeft - previous) / previous) * copyWidth : copyWidth
      viewport.scrollLeft = position
      paint()
    }

    const paint = () => {
      const { left, width, wrapWidth, fraction } = thumbGeometry(position, copyWidth, viewport.clientWidth)
      thumbRef.current.style.left = `${left}%`
      thumbRef.current.style.width = `${Math.min(width, 100 - left)}%`
      thumbWrapRef.current.style.width = `${wrapWidth}%`
      counterRef.current.textContent = `${String(Math.floor(fraction * count) + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`
    }

    // While a poster has keyboard focus the row never wraps: wrapping jumps the view by
    // one copy, which would leave the focused link offscreen. Three copies leave enough
    // room to scroll to any poster in the middle copy without wrapping.
    // Checked directly rather than tracked via focusin/focusout, which aren't fired in
    // every case (e.g. programmatic focus while the window itself isn't focused).
    const hasFocusInside = () => viewport.contains(document.activeElement)

    const setPosition = (next) => {
      position = wrapPosition(next, copyWidth, hasFocusInside())
      viewport.scrollLeft = position
      paint()
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000)
      lastFrame = now
      const paused = reducedMotion.matches || hasFocusInside() || Object.values(pause).some(Boolean)
      const target = paused ? 0 : SPEED_PX_PER_S * (reverse ? -1 : 1)
      velocity += (target - velocity) * Math.min(1, dt * EASE_PER_S)
      if (Math.abs(velocity) > 0.5 && copyWidth) setPosition(position + velocity * dt)
      frame = requestAnimationFrame(tick)
    }

    // Native scrolling (trackpad, touch, keyboard focus) moves the row: adopt it.
    const onScroll = () => {
      if (Math.abs(viewport.scrollLeft - position) > 1) setPosition(viewport.scrollLeft)
    }

    // Mouse drag. Pointer capture only starts once it's really a drag, so plain clicks
    // still reach the poster links; a click right after a drag is swallowed.
    let drag = null
    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      drag = { x: event.clientX, start: position, moved: false }
    }
    const onPointerMove = (event) => {
      if (!drag) return
      const dx = event.clientX - drag.x
      if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD_PX) return
      if (!drag.moved) {
        drag.moved = true
        pause.drag = true
        // Best effort: throws if the pointer is already gone, and dragging works without it.
        try { viewport.setPointerCapture(event.pointerId) } catch { /* ignore */ }
        viewport.dataset.dragging = ''
      }
      setPosition(drag.start - dx)
    }
    const endDrag = () => {
      if (!drag) return
      if (drag.moved) {
        delete viewport.dataset.dragging
        // Let the click that ends this drag be cancelled, then forget the drag.
        setTimeout(() => { drag = null }, 0)
      } else {
        drag = null
      }
      pause.drag = false
    }
    const onClickCapture = (event) => {
      if (drag?.moved) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const onEnter = () => { pause.hover = true }
    const onLeave = () => { pause.hover = false }
    const onTouchStart = () => {
      clearTimeout(touchTimer)
      pause.touch = true
    }
    const onTouchEnd = () => {
      touchTimer = setTimeout(() => { pause.touch = false }, TOUCH_RESUME_MS)
    }

    const visibility = new IntersectionObserver(([entry]) => { pause.offscreen = !entry.isIntersecting })
    visibility.observe(viewport)
    const resize = new ResizeObserver(measure)
    resize.observe(copies[1])

    viewport.addEventListener('scroll', onScroll, { passive: true })
    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', endDrag)
    viewport.addEventListener('pointercancel', endDrag)
    viewport.addEventListener('click', onClickCapture, true)
    viewport.addEventListener('pointerenter', onEnter)
    viewport.addEventListener('pointerleave', onLeave)
    viewport.addEventListener('touchstart', onTouchStart, { passive: true })
    viewport.addEventListener('touchend', onTouchEnd, { passive: true })

    // The scrollbar shares the row's hover pause and maps its width to one copy.
    const track = trackRef.current
    let barDrag = null
    const positionFromTrack = (clientX, grabOffset) => {
      const rect = track.getBoundingClientRect()
      const thumbFraction = thumbGeometry(position, copyWidth, viewport.clientWidth).width / 100
      const fraction = (clientX - rect.left) / rect.width - grabOffset * thumbFraction
      return copyWidth + fraction * copyWidth
    }
    const onBarDown = (event) => {
      if (event.button !== 0) return
      event.preventDefault()
      const onThumb = event.target === thumbRef.current
      const rect = thumbRef.current.getBoundingClientRect()
      const grabOffset = onThumb ? (event.clientX - rect.left) / rect.width : 0.5
      barDrag = { grabOffset }
      pause.drag = true
      try { track.setPointerCapture(event.pointerId) } catch { /* ignore */ }
      setPosition(positionFromTrack(event.clientX, grabOffset))
    }
    const onBarMove = (event) => {
      if (barDrag) setPosition(positionFromTrack(event.clientX, barDrag.grabOffset))
    }
    const onBarUp = () => {
      barDrag = null
      pause.drag = false
    }
    track.addEventListener('pointerdown', onBarDown)
    track.addEventListener('pointermove', onBarMove)
    track.addEventListener('pointerup', onBarUp)
    track.addEventListener('pointercancel', onBarUp)

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(touchTimer)
      visibility.disconnect()
      resize.disconnect()
      viewport.removeEventListener('scroll', onScroll)
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', endDrag)
      viewport.removeEventListener('pointercancel', endDrag)
      viewport.removeEventListener('click', onClickCapture, true)
      viewport.removeEventListener('pointerenter', onEnter)
      viewport.removeEventListener('pointerleave', onLeave)
      viewport.removeEventListener('touchstart', onTouchStart)
      viewport.removeEventListener('touchend', onTouchEnd)
      track.removeEventListener('pointerdown', onBarDown)
      track.removeEventListener('pointermove', onBarMove)
      track.removeEventListener('pointerup', onBarUp)
      track.removeEventListener('pointercancel', onBarUp)
    }
  }, [count, reverse])

  const listClasses = 'flex flex-shrink-0 gap-4 pr-4 [&>li]:w-[132px] [&>li]:flex-shrink-0 sm:[&>li]:w-[156px]'

  return (
    <div className="carousel">
      <div
        ref={viewportRef}
        className="carousel-viewport"
        role="region"
        aria-label={label}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="flex w-max">
          {/* The copies scroll into view, so they stay clickable; they're hidden from
              screen readers and their links leave the Tab order (CarouselCopyContext). */}
          <CarouselCopyContext value={true}>
            <ul data-copy className={listClasses} aria-hidden="true">{children}</ul>
          </CarouselCopyContext>
          <ul data-copy className={listClasses}>{children}</ul>
          <CarouselCopyContext value={true}>
            <ul data-copy className={listClasses} aria-hidden="true">{children}</ul>
          </CarouselCopyContext>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4" aria-hidden="true">
        <div ref={trackRef} className="carousel-track group relative h-4 flex-1 cursor-pointer touch-none">
          <div className="carousel-rail absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden">
            <div ref={thumbRef} className="carousel-thumb absolute inset-y-0" />
            <div ref={thumbWrapRef} className="carousel-thumb absolute inset-y-0 left-0" />
          </div>
        </div>
        <span ref={counterRef} className="eyebrow tabular-nums" style={{ color: 'var(--color-text-secondary)' }} />
      </div>
    </div>
  )
}
