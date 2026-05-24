import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function ProtectedRoute({ children, roles }) {
  const { user, role, verifying } = useAuth()
  const location = useLocation()

  if (verifying) {
    return <div style={{ padding: 24, color: '#6b7280' }}>Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/tasks" replace />
  }

  return children
}

export default ProtectedRoute
