import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getRooms } from '../api/roomsApi.js'
import { getBookings } from '../api/bookingsApi.js'
import { getTasks } from '../api/tasksApi.js'
import { getRequests } from '../api/requestsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import '../styles/dashboard.css'

const todayLocal = () => new Date().toLocaleDateString('sv-SE')

function countByRoomStatus(rooms) {
  return rooms.reduce(
    (acc, r) => {
      if (r.status in acc) acc[r.status]++
      return acc
    },
    { available: 0, occupied: 0, 'needs-cleaning': 0 }
  )
}

function bookingsForToday(bookings) {
  const today = todayLocal()
  return {
    arriving: bookings.filter((b) => b.checkIn === today).length,
    departing: bookings.filter((b) => b.checkOut === today).length,
    checkedIn: bookings.filter((b) => b.occupancyStatus === 'checked-in').length,
  }
}

function countTasksByStatus(tasks) {
  return tasks.reduce(
    (acc, t) => {
      if (t.status === 'pending') acc.pending++
      else if (t.status === 'completed') acc.completed++
      return acc
    },
    { pending: 0, completed: 0 }
  )
}

function StatNumber({ value, delay = 1 }) {
  return (
    <span className={`dash-card-number stat-number stat-number-${delay}`}>
      {value}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [tasks, setTasks] = useState([])
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [roomList, bookingList, taskList, requestList] = await Promise.all([
        getRooms(),
        getBookings(),
        getTasks(),
        getRequests(),
      ])
      setRooms(roomList)
      setBookings(bookingList)
      setTasks(taskList)
      setRequests(requestList)
      setStatus('loaded')
    } catch (err) {
      setError(err?.message ?? 'Failed to load dashboard')
      setStatus('error')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const roomCounts = countByRoomStatus(rooms)
  const todayBookings = bookingsForToday(bookings)
  const taskCounts = countTasksByStatus(tasks)

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back{user ? `, ${user.username}` : ''}
        </h1>
        <p className="dashboard-subtitle">
          Overview of all modules
          {user?.role && <span className="dashboard-role-pill">{user.role}</span>}
        </p>
      </header>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}

      {status === 'loaded' && (
        <div className="dashboard-grid">
          <article className="dash-card dash-card-rooms">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Rooms</h2>
              <Link to="/rooms" className="dash-card-link">View</Link>
            </div>
            <StatNumber value={rooms.length} delay={1} />
            <div className="dash-card-breakdown">
              <div className="dash-card-row">
                <span className="dash-card-row-label">Available</span>
                <span className="dash-card-row-value">{roomCounts.available}</span>
              </div>
              <div className="dash-card-row">
                <span className="dash-card-row-label">Occupied</span>
                <span className="dash-card-row-value">{roomCounts.occupied}</span>
              </div>
              <div className="dash-card-row">
                <span className="dash-card-row-label">Needs cleaning</span>
                <span className="dash-card-row-value">{roomCounts['needs-cleaning']}</span>
              </div>
            </div>
          </article>

          <article className="dash-card dash-card-bookings">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Bookings</h2>
              <Link to="/bookings" className="dash-card-link">View</Link>
            </div>
            <StatNumber value={bookings.length} delay={2} />
            <div className="dash-card-breakdown">
              <div className="dash-card-row">
                <span className="dash-card-row-label">Currently checked in</span>
                <span className="dash-card-row-value">{todayBookings.checkedIn}</span>
              </div>
              <div className="dash-card-row">
                <span className="dash-card-row-label">Arriving today</span>
                <span className="dash-card-row-value">{todayBookings.arriving}</span>
              </div>
              <div className="dash-card-row">
                <span className="dash-card-row-label">Departing today</span>
                <span className="dash-card-row-value">{todayBookings.departing}</span>
              </div>
            </div>
          </article>

          <article className="dash-card dash-card-tasks">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Tasks</h2>
              <Link to="/tasks" className="dash-card-link">View</Link>
            </div>
            <StatNumber value={tasks.length} delay={3} />
            <div className="dash-card-breakdown">
              <div className="dash-card-row">
                <span className="dash-card-row-label">Pending</span>
                <span className="dash-card-row-value">{taskCounts.pending}</span>
              </div>
              <div className="dash-card-row">
                <span className="dash-card-row-label">Completed</span>
                <span className="dash-card-row-value">{taskCounts.completed}</span>
              </div>
            </div>
          </article>

          <article className="dash-card dash-card-requests">
            <div className="dash-card-header">
              <h2 className="dash-card-title">Requests</h2>
              <Link to="/requests" className="dash-card-link">View</Link>
            </div>
            <StatNumber value={requests.length} delay={4} />
            <div className="dash-card-breakdown">
              <div className="dash-card-row">
                <span className="dash-card-row-label">Open notes</span>
                <span className="dash-card-row-value">{requests.length}</span>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  )
}
