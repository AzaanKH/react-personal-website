import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPage from '../../src/pages/ContactPage'

async function fillForm(user, { name = 'Ada Lovelace', email = 'ada@example.com', message = 'I would love to chat about a role.' } = {}) {
  if (name) await user.type(screen.getByLabelText('Name'), name)
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (message) await user.type(screen.getByLabelText('Message'), message)
}

const submit = () => screen.getByRole('button', { name: /send message/i })

describe('ContactPage', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn(async () => Response.json({ ok: true }))
    vi.stubGlobal('fetch', fetchMock)
  })

  it('shows field errors, focuses the first invalid field, and does not submit', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    await user.click(submit())

    expect(await screen.findByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a message.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus())
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('validates the email format on blur', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.tab()

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('submits JSON to the contact function and clears the form on success', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)

    await fillForm(user)
    await user.click(submit())

    expect(await screen.findByText(/your message was sent/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/contact')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would love to chat about a role.',
      website: '',
    })
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(sessionStorage.getItem('contact-draft')).toBeNull()
  })

  it('shows the server message when rate limited', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ error: 'Too many messages. Please try again in a few minutes.' }, { status: 429 }),
    )
    const user = userEvent.setup()
    render(<ContactPage />)

    await fillForm(user)
    await user.click(submit())

    expect(await screen.findByText(/too many messages/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveValue('I would love to chat about a role.')
  })

  it('shows server-side field errors', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json(
        { error: 'Please fix the highlighted fields.', errors: { email: 'Enter a valid email address.' } },
        { status: 400 },
      ),
    )
    const user = userEvent.setup()
    render(<ContactPage />)

    await fillForm(user)
    await user.click(submit())

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('reports network failures without losing the message', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    render(<ContactPage />)

    await fillForm(user)
    await user.click(submit())

    expect(await screen.findByText(/check your connection/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveValue('I would love to chat about a role.')
  })

  it('preserves a draft when the page is left and revisited', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<ContactPage />)

    await fillForm(user, { email: '', message: 'Half-written thought' })
    unmount()

    render(<ContactPage />)
    expect(screen.getByLabelText('Name')).toHaveValue('Ada Lovelace')
    expect(screen.getByLabelText('Message')).toHaveValue('Half-written thought')
  })
})
