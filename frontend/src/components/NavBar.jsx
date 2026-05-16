import { NavLink } from 'react-router-dom'

const linksByRole = {
  reception: ['tasks', 'requests', 'rooms', 'bookings'],
  cleaning: ['tasks', 'rooms'],
  manager: ['tasks', 'requests', 'rooms', 'bookings'],
}

const labels = {
  tasks: 'Tasks',
  requests: 'Requests',
  rooms: 'Rooms',
  bookings: 'Bookings',
}

function NavBar({ role }) {
  const links = linksByRole[role] ?? []
  return (
    <nav className="layout-nav" aria-label="Main">
      {links.map((key) => (
        <NavLink key={key} to={`/${key}`}>{labels[key]}</NavLink>
      ))}
    </nav>
  )
}

export default NavBar
