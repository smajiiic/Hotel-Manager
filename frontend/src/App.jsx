import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './components/AuthProvider.jsx'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppShell from './dashboard/components/AppShell.jsx'
import RoleHome from './dashboard/RoleHome.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import RequestsPage from './pages/RequestsPage.jsx'
import RoomsPage from './pages/RoomsPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Role-aware dashboard home — shared AppShell wraps all three roles */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<RoleHome />} />
          </Route>

          {/* Legacy module pages — drill-in targets keep the original NavBar layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['manager']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute roles={['reception', 'manager']}>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
