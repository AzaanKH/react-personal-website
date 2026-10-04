import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'

// Finish animations instantly so AnimatePresence page swaps complete synchronously-ish.
MotionGlobalConfig.skipAnimations = true

function installMatchMedia(matches = false) {
  window.matchMedia = vi.fn((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  installMatchMedia(false)
  globalThis.ResizeObserver = ResizeObserverStub
  localStorage.clear()
  sessionStorage.clear()
  document.documentElement.classList.remove('dark')
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

export { installMatchMedia }
