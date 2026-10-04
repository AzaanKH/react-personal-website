import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactPage from '../../src/pages/ContactPage'
import { resetContactForm } from '../../src/lib/contactForm'

async function fillForm(user, { name = 'Ada Lovelace', email = 'ada@example.com', message = 'I would love to chat about a role.' } = {}) {
  if (name) await user.type(screen.getByLabelText('Name'), name)
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (message) await user.type(screen.getByLabelText('Message'), message)
}

const submit = () => screen.getByRole('button', { name: /send message/i })

describe('ContactPage', () => {
  let fetchMock

  beforeEach(() => {
    resetContactForm()
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

  it("explains Netlify's platform rate limit, which has no JSON body", async () => {
    fetchMock.mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }))
    const user = userEvent.setup()
    render(<ContactPage />)

    await fillForm(user)
    await user.click(submit())

    expect(await screen.findByText(/wait a few minutes/i)).toBeInTheDocument()
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

  it('restores a draft from sessionStorage after a reload', () => {
    sessionStorage.setItem('contact-draft', JSON.stringify({ name: 'Grace', email: '', message: 'Saved' }))
    resetContactForm() // a reload starts with empty in-memory state

    render(<ContactPage />)
    expect(screen.getByLabelText('Name')).toHaveValue('Grace')
    expect(screen.getByLabelText('Message')).toHaveValue('Saved')
  })

  describe('when the page is left while a message is sending', () => {
    let respond

    beforeEach(() => {
      fetchMock.mockImplementationOnce(() => new Promise((resolve) => { respond = resolve }))
    })

    async function submitAndLeave() {
      const user = userEvent.setup()
      const view = render(<ContactPage />)
      await fillForm(user)
      await user.click(submit())
      view.unmount()
    }

    it('clears the submitted draft and shows success on return', async () => {
      await submitAndLeave()
      await act(async () => respond(Response.json({ ok: true })))

      expect(sessionStorage.getItem('contact-draft')).toBeNull()
      render(<ContactPage />)
      expect(screen.getByLabelText('Message')).toHaveValue('')
      expect(screen.getByText(/your message was sent/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sent/i })).toBeDisabled()
    })

    it('shows the send in progress on return instead of offering a duplicate', async () => {
      await submitAndLeave()

      render(<ContactPage />)
      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()

      await act(async () => respond(Response.json({ ok: true })))
      expect(await screen.findByText(/your message was sent/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toHaveValue('')
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('keeps the draft and reports the failure on return', async () => {
      await submitAndLeave()
      await act(async () => respond(Response.json({ error: 'Failed to send message.' }, { status: 502 })))

      render(<ContactPage />)
      expect(screen.getByLabelText('Message')).toHaveValue('I would love to chat about a role.')
      expect(screen.getByText('Failed to send message.')).toBeInTheDocument()
    })

    it('keeps edits made while the message was in flight', async () => {
      await submitAndLeave()
      const user = userEvent.setup()
      render(<ContactPage />)
      await user.type(screen.getByLabelText('Message'), ' Also, one more thing.')

      await act(async () => respond(Response.json({ ok: true })))
      expect(screen.getByLabelText('Message')).toHaveValue('I would love to chat about a role. Also, one more thing.')
    })
  })
})
