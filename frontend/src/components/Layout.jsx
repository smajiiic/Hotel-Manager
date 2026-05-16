import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import NavBar from './NavBar.jsx'
import '../styles/layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">Isa Begov Hamam</div>
        <div className="layout-user">
          <span className="layout-username">{user.username}</span>
          <span className="layout-role">{user.role}</span>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <NavBar role={user.role} />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
