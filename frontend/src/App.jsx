import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './components/AuthProvider.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './dashboard/components/AppShell.jsx'
import RoleHome from './dashboard/RoleHome.jsx'
import GuestsView from './dashboard/views/GuestsView.jsx'
import TasksView from './dashboard/views/TasksView.jsx'
import NotesView from './dashboard/views/NotesView.jsx'
import SettingsView from './dashboard/views/SettingsView.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// One shell for the whole app. Every section renders inside <AppShell> via the
// nested <Outlet>, so the sidebar + topbar never reload — only the content
// swaps. The old per-module pages (rooms/bookings/dashboard) fold into their
// dashboard equivalents below.
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<RoleHome />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/requests" element={<NotesView />} />
            <Route
              path="/guests"
              element={
                <ProtectedRoute roles={['reception', 'manager']}>
                  <GuestsView />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<SettingsView />} />
          </Route>

          {/* Retired surfaces fold into their dashboard equivalents:
              rooms → the floor plan, bookings → the guest roster, the old
              manager dashboard + reports → the role home (which is the
              manager's analytics view). */}
          <Route path="/rooms" element={<Navigate to="/" replace />} />
          <Route path="/bookings" element={<Navigate to="/guests" replace />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/reports" element={<Navigate to="/" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
