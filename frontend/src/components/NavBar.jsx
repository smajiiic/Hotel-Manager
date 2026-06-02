import { useState, useEffect, useRef } from 'react'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [userMenuOpen])

  const close = () => setMenuOpen(false)

  const handleLogout = async () => {
    close()
    setUserMenuOpen(false)
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
            <div
              className="navbar-user-menu"
              ref={userMenuRef}
              data-open={userMenuOpen}
            >
              <button
                type="button"
                className="navbar-user-trigger"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <span className="navbar-user-avatar" aria-hidden="true">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="navbar-user-name">{user.username}</span>
                <span className="navbar-user-chevron" aria-hidden="true">▾</span>
              </button>

              {userMenuOpen && (
                <div className="navbar-user-dropdown" role="menu">
                  <div className="navbar-user-info">
                    <div className="navbar-user-info-name">{user.username}</div>
                    <div className="navbar-user-info-role">{user.role}</div>
                  </div>
                  <button
                    type="button"
                    className="navbar-user-action"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span className="navbar-user-action-icon" aria-hidden="true">↪</span>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {menuOpen && (
        <div className="navbar-backdrop" onClick={close} aria-hidden="true" />
      )}
    </>
  )
}

export default NavBar
