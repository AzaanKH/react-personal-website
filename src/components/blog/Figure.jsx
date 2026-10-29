import { useRef } from 'react'
import { Maximize2, X } from 'lucide-react'

// Figures for posts: an image (or a light/dark pair), an optional caption, and a full-size
// view in a modal <dialog>, since dense diagrams are unreadable when shrunk to a phone.
//
// Pass `src`, or `light` and `dark` for a themed pair. Both variants render and CSS shows
// one by the `.dark` class on <html> (.post-themed-*, index.css), so an SVG follows the
// site toggle rather than the OS setting an <img> SVG would see. The hidden variant is
// display:none and lazy, so the browser doesn't fetch it. `width`/`height` are CSS pixels:
// they reserve space before load and size the full-size view.

function Picture({ src, light, dark, alt, width, height, className = '', style }) {
  const common = { alt, width, height, loading: 'lazy', decoding: 'async', style }
  if (!light) return <img src={src} className={className} {...common} />
  return (
    <>
      <img src={light} className={`${className} post-themed-light`} {...common} />
      <img src={dark} className={`${className} post-themed-dark`} {...common} />
    </>
  )
}

// The inline image plus its zoom button and dialog. Clicking the image also opens it; the
// button is the keyboard and screen reader path. Esc, the close button, or a click
// anywhere in the dialog closes it, and the browser returns focus to the opener.
function Zoomable({ image, label }) {
  const dialog = useRef(null)
  const open = () => dialog.current?.showModal?.()
  const close = () => dialog.current?.close?.()

  return (
    <div className="post-zoomable">
      <Picture
        {...image}
        className="post-figure-img"
        style={{ maxWidth: `${image.width}px`, aspectRatio: `${image.width} / ${image.height}` }}
      />
      {/* The image is a mouse/touch shortcut only; the button below is the accessible control. */}
      <span className="post-zoom-hit" aria-hidden="true" onClick={open} />
      <button type="button" className="post-zoom-button" onClick={open} aria-label={`View full size: ${label}`}>
        <Maximize2 size={14} aria-hidden="true" />
      </button>
      <dialog ref={dialog} className="post-lightbox" aria-label={label} onClick={close}>
        <button type="button" className="post-lightbox-close" onClick={close} aria-label="Close full-size image" autoFocus>
          <X size={18} aria-hidden="true" />
        </button>
        <div className="post-lightbox-body">
          <Picture {...image} style={{ width: `${image.width}px`, maxWidth: 'none', height: 'auto' }} />
        </div>
      </dialog>
    </div>
  )
}

// <Figure src width height alt label?>caption</Figure>. `wide` lets a diagram use more
// than the text column on large screens. `label` names the zoom controls; it defaults to
// a plain-text caption, else the alt text's first sentence.
export function Figure({ children, wide = false, label, ...image }) {
  const name = label ?? (typeof children === 'string' ? children : image.alt?.split('. ')[0] || 'image')
  return (
    <figure className={`post-figure${wide ? ' post-figure-wide' : ''}`}>
      <Zoomable image={image} label={name} />
      {children && <figcaption className="post-figcaption">{children}</figcaption>}
    </figure>
  )
}

// Two screenshots of the same spot, labelled. Side by side when there's room, stacked on
// phones (or always, with `stack`, for wide crops), so each stays near its real size
// instead of shrinking into one composite. `before`/`after` are { src, width, height, alt }.
export function BeforeAfter({ before, after, beforeLabel = 'Before', afterLabel = 'After', stack = false, label = 'screenshot', children }) {
  return (
    <figure className="post-figure">
      <div className={`post-before-after${stack ? ' is-stacked' : ''}`}>
        {[[beforeLabel, before], [afterLabel, after]].map(([tag, image]) => (
          <div key={tag} className="post-before-after-panel">
            <p className="post-before-after-label">{tag}</p>
            <Zoomable image={image} label={`${tag}: ${label}`} />
          </div>
        ))}
      </div>
      {children && <figcaption className="post-figcaption">{children}</figcaption>}
    </figure>
  )
}
