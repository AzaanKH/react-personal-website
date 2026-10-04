import { useSyncExternalStore } from 'react'

// The contact form's draft and submission state live here, outside ContactPage.
// Switching pages unmounts the page while a send may still be in flight; keeping
// the state in a module-level store means the outcome (clearing the draft,
// showing "sent") is applied even if nobody is looking, and is still there on return.

const DRAFT_STORAGE_KEY = 'contact-draft'
export const EMPTY_FORM = { name: '', email: '', message: '' }

// Drafts are also mirrored to sessionStorage so they survive a reload, while
// nothing lingers after the tab closes.
function loadDraft() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_STORAGE_KEY))
    return saved && typeof saved === 'object' ? { ...EMPTY_FORM, ...saved } : EMPTY_FORM
  } catch {
    return EMPTY_FORM
  }
}

function saveDraft(draft) {
  try {
    if (Object.values(draft).some((value) => value.trim())) {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    } else {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  } catch {
    // Storage unavailable: the in-memory draft still survives page switches.
  }
}

let state = null
const listeners = new Set()

function getState() {
  state ??= { draft: loadDraft(), status: 'idle', errorMessage: '', serverErrors: {} }
  return state
}

function setState(patch) {
  state = { ...getState(), ...patch }
  if ('draft' in patch) saveDraft(state.draft)
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useContactForm() {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function updateField(name, value) {
  const { draft, serverErrors, status } = getState()
  const remainingServerErrors = { ...serverErrors }
  delete remainingServerErrors[name]
  setState({
    draft: { ...draft, [name]: value },
    serverErrors: remainingServerErrors,
    errorMessage: '',
    status: status === 'error' ? 'idle' : status,
  })
}

export function showValidationError(message) {
  setState({ status: 'idle', errorMessage: message })
}

// Return the button to idle a few seconds after success or failure.
export function resetStatus() {
  setState({ status: 'idle' })
}

const sameDraft = (a, b) => Object.keys(EMPTY_FORM).every((key) => a[key] === b[key])

// Resolves to `{ ok }` plus any server field errors so a mounted page can move focus.
export async function submitContact(data, honeypot) {
  setState({ status: 'sending', errorMessage: '' })

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, website: honeypot }),
    })
    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      // Netlify's platform rate limit answers 429 before the function runs, without a JSON body.
      setState({
        status: 'error',
        errorMessage:
          result.error ||
          (response.status === 429
            ? 'Too many messages. Please wait a few minutes and try again.'
            : 'Failed to send message. Please try again.'),
        ...(result.errors ? { serverErrors: result.errors } : {}),
      })
      return { ok: false, errors: result.errors }
    }

    // Clear the draft only if it is still the message that was sent. Edits made
    // while the request was in flight are a new draft and are kept.
    setState({
      status: 'success',
      serverErrors: {},
      ...(sameDraft(getState().draft, data) ? { draft: EMPTY_FORM } : {}),
    })
    return { ok: true }
  } catch {
    setState({ status: 'error', errorMessage: 'Failed to send message. Check your connection and try again.' })
    return { ok: false }
  }
}

// Tests only: drop in-memory state so the next read reloads from sessionStorage.
export function resetContactForm() {
  state = null
  listeners.forEach((listener) => listener())
}
