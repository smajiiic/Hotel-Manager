import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthProvider from '../components/AuthProvider'
import { useAuth } from '../hooks/useAuth'

function ok(payload) {
  return { ok: true, status: 200, json: async () => payload }
}

// Test consumer renders the hook's state and exposes login/logout buttons.
function AuthConsumer() {
  const { user, role, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="role">{role ?? 'null'}</div>
      <div data-testid="isAuth">{isAuthenticated ? 'yes' : 'no'}</div>
      <button onClick={() => login('reception1', 'test1234')}>do-login</button>
      <button onClick={logout}>do-logout</button>
    </div>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('useAuth (via AuthProvider)', () => {
  test('starts logged out when localStorage is empty', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('user')).toHaveTextContent('null')
    expect(screen.getByTestId('role')).toHaveTextContent('null')
    expect(screen.getByTestId('isAuth')).toHaveTextContent('no')
  })

  test('login sets the user', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        ok({ success: true, data: { username: 'reception1', role: 'reception' } }),
      ),
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'do-login' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('"username":"reception1"')
      expect(screen.getByTestId('role')).toHaveTextContent('reception')
      expect(screen.getByTestId('isAuth')).toHaveTextContent('yes')
    })
  })

  test('login persists user to localStorage under ibh_user key', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        ok({ success: true, data: { username: 'cleaning1', role: 'cleaning' } }),
      ),
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'do-login' }))

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('ibh_user'))
      expect(stored).toEqual({ username: 'cleaning1', role: 'cleaning' })
    })
  })

  test('restores user from localStorage on mount (persists across remounts)', () => {
    localStorage.setItem(
      'ibh_user',
      JSON.stringify({ username: 'manager1', role: 'manager' }),
    )

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('user')).toHaveTextContent('"username":"manager1"')
    expect(screen.getByTestId('role')).toHaveTextContent('manager')
    expect(screen.getByTestId('isAuth')).toHaveTextContent('yes')
  })

  test('logout clears the user and the localStorage entry', async () => {
    localStorage.setItem(
      'ibh_user',
      JSON.stringify({ username: 'reception1', role: 'reception' }),
    )
    global.fetch = vi.fn(() => Promise.resolve(ok({ success: true })))

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    )

    expect(screen.getByTestId('user')).toHaveTextContent('"username":"reception1"')

    await userEvent.click(screen.getByRole('button', { name: 'do-logout' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('isAuth')).toHaveTextContent('no')
      expect(localStorage.getItem('ibh_user')).toBeNull()
    })
  })
})
