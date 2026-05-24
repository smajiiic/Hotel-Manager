import { Outlet } from 'react-router-dom'
import NavBar from './NavBar.jsx'
import '../styles/layout.css'

function Layout() {
  return (
    <div className="layout">
      <NavBar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
