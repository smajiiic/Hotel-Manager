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
  test('reception sees Dashboard, Tasks, Requests, Rooms, Bookings', () => {
    renderNavBar({ role: 'reception' })

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^rooms$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^bookings$/i })).toBeInTheDocument()
  })

  test('cleaning sees Dashboard, Tasks, Requests, Rooms (no Bookings)', () => {
    renderNavBar({ role: 'cleaning' })

    expect(screen.getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^tasks$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^requests$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^rooms$/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^bookings$/i })).not.toBeInTheDocument()
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
  test('sign out invokes useAuth().logout() via user dropdown', async () => {
    const logout = vi.fn().mockResolvedValue(undefined)
    renderNavBar({ role: 'reception', logout })

    // 1. Open the user dropdown by clicking the trigger button (named after username)
    await userEvent.click(screen.getByRole('button', { name: /reception1/i }))
    // 2. Click "Sign out" inside the dropdown
    await userEvent.click(screen.getByRole('menuitem', { name: /sign out/i }))

    expect(logout).toHaveBeenCalled()
  })
})
