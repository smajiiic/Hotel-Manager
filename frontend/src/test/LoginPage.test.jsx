import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import AuthProvider from '../components/AuthProvider'

function ok(payload) {
  return { ok: true, status: 200, json: async () => payload }
}

function unauthorized(payload) {
  return { ok: false, status: 401, json: async () => payload }
}

function mockLoginSuccess(user = { username: 'reception1', role: 'reception' }) {
  global.fetch = vi.fn(() => Promise.resolve(ok({ success: true, data: user })))
}

function mockLoginFailure() {
  global.fetch = vi.fn(() =>
    Promise.resolve(unauthorized({ success: false, error: 'Invalid credentials' })),
  )
}

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('LoginPage', () => {
  test('renders username and password input fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  test('renders the Sign in submit button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('calls /api/auth/login with submitted credentials on submit', async () => {
    mockLoginSuccess()
    renderLogin()

    await userEvent.type(screen.getByLabelText(/username/i), 'reception1')
    await userEvent.type(screen.getByLabelText(/password/i), 'test1234')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const loginCall = global.fetch.mock.calls.find((call) =>
        String(call[0]).includes('/api/auth/login'),
      )
      expect(loginCall).toBeTruthy()
      expect(JSON.parse(loginCall[1].body)).toEqual({
        username: 'reception1',
        password: 'test1234',
      })
    })
  })

  test('shows the masked "Invalid username or password" message on 401', async () => {
    mockLoginFailure()
    renderLogin()

    await userEvent.type(screen.getByLabelText(/username/i), 'reception1')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument(),
    )
  })
})
