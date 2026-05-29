import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../hooks/useAuth'
import NavBar from '../components/NavBar'

// Inject AuthContext directly rather than going through AuthProvider — keeps
// tests fast (no fetch, no localStorage) and gives precise per-role control.
function renderNavBar({ role, logout = vi.fn() }) {
  const user = role ? { username: `${role}1`, role } : null
  const value = {
    user,
    role: role ?? null,
    isAuthenticated: Boolean(user),
    verifying: false,
    login: vi.fn(),
    logout,
  }
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={value}>
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

beforeEach(() => vi.clearAllMocks())

describe('NavBar — role-aware nav links', () => {
  test('reception sees Tasks, Requests, Rooms, Bookings (no Dashboard)', () => {
    renderNavBar({ role: 'reception' })

    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^rooms$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^bookings$/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })

  test('cleaning sees Tasks, Requests, Rooms (no Bookings, no Dashboard)', () => {
    renderNavBar({ role: 'cleaning' })

    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^rooms$/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^bookings$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^dashboard$/i })).not.toBeInTheDocument()
  })

  test('manager sees Dashboard, Tasks, Requests, Rooms, Bookings', () => {
    renderNavBar({ role: 'manager' })

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^rooms$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^bookings$/i })).toBeInTheDocument()
  })
})

describe('NavBar — logout', () => {
  test('logout button invokes useAuth().logout()', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderNavBar({ role: 'reception', logout })

    await userEvent.click(screen.getByRole('button', { name: /logout/i }))

    expect(logout).toHaveBeenCalled()
  })
})
