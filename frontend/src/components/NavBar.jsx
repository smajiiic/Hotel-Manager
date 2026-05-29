import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import '../styles/navbar.css'

const linksByRole = {
  reception: ['tasks', 'requests', 'rooms', 'bookings'],
  cleaning: ['tasks', 'requests', 'rooms'],
  manager: ['dashboard', 'tasks', 'requests', 'rooms', 'bookings'],
}

const labels = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  requests: 'Requests',
  rooms: 'Rooms',
  bookings: 'Bookings',
}

function NavBar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  const handleLogout = async () => {
    close()
    await logout()
    navigate('/login', { replace: true })
  }

  const links = linksByRole[role] ?? []

  return (
    <>
      <header className="navbar">
        <NavLink to="/" className="navbar-brand" onClick={close}>
          Isa Begov Hamam
        </NavLink>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="navbar-collapse"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div
          id="navbar-collapse"
          className={`navbar-collapse ${menuOpen ? 'is-open' : ''}`}
        >
          <nav className="navbar-links" aria-label="Main">
            {links.map((key) => (
              <NavLink
                key={key}
                to={`/${key}`}
                className="navbar-link"
                onClick={close}
              >
                {labels[key]}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="navbar-user">
              <span className="navbar-username">{user.username}</span>
              <span className="navbar-role">{user.role}</span>
              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div
          className="navbar-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  )
}

export default NavBar
