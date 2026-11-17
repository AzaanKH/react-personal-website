import { Component } from 'react'

// Contains a render error to the part of the page that threw, so one broken section
// (the Interests page leans on third-party APIs) can't blank the whole app. Around a
// page it shows a heading (every page needs its h1); `compact` is for a section.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    if (this.props.compact) {
      return (
        <p role="alert" className="pt-16 text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
          This section failed to load. Reloading the page usually fixes it.
        </p>
      )
    }

    return (
      <div className="page-shell pb-16 pt-4 md:pt-8" role="alert">
        <h1 className="display-heading page-title" style={{ color: 'var(--color-text)' }}>
          Something <em style={{ color: 'var(--color-accent)' }}>broke.</em>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
          This page hit an error while rendering. The rest of the site still works.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="press hover-accent-bg mt-8 inline-flex items-center rounded-full px-6 py-3 text-[0.75rem] font-medium uppercase tracking-[0.15em]"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
        >
          Reload the page
        </button>
      </div>
    )
  }
}
