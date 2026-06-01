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

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
  },
  header: { marginBottom: '2rem' },
  title: {
    margin: '0 0 0.35rem 0',
    fontSize: '1.875rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.1rem',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.4rem 1.5rem',
    boxShadow: 'var(--shadow-xs)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.85rem',
  },
  cardTitle: {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  },
  bigNumber: {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    lineHeight: 1,
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.03em',
    fontVariantNumeric: 'tabular-nums',
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: '0.85rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid var(--color-border)',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.88rem',
    color: 'var(--color-text-primary)',
  },
  breakdownLabel: {
    color: 'var(--color-text-secondary)',
  },
  breakdownValue: {
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
}

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

  useEffect(() => {
    load()
  }, [load])

  const roomCounts = countByRoomStatus(rooms)
  const todayBookings = bookingsForToday(bookings)
  const taskCounts = countTasksByStatus(tasks)

  return (
    <div style={styles.page} className="dashboard-page-enter">
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome back{user ? `, ${user.username}` : ''} · Overview of all modules
        </p>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={error} onRetry={load} />}

      {status === 'loaded' && (
        <div style={styles.grid}>
          <div style={styles.card} className="app-card">
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Rooms</h2>
              <Link to="/rooms" className="dashboard-link">View</Link>
            </div>
            <p style={styles.bigNumber}>{rooms.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Available</span>
                <strong style={styles.breakdownValue}>{roomCounts.available}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Occupied</span>
                <strong style={styles.breakdownValue}>{roomCounts.occupied}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Needs cleaning</span>
                <strong style={styles.breakdownValue}>{roomCounts['needs-cleaning']}</strong>
              </div>
            </div>
          </div>

          <div style={styles.card} className="app-card">
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Bookings</h2>
              <Link to="/bookings" className="dashboard-link">View</Link>
            </div>
            <p style={styles.bigNumber}>{bookings.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Currently checked in</span>
                <strong style={styles.breakdownValue}>{todayBookings.checkedIn}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Arriving today</span>
                <strong style={styles.breakdownValue}>{todayBookings.arriving}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Departing today</span>
                <strong style={styles.breakdownValue}>{todayBookings.departing}</strong>
              </div>
            </div>
          </div>

          <div style={styles.card} className="app-card">
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Tasks</h2>
              <Link to="/tasks" className="dashboard-link">View</Link>
            </div>
            <p style={styles.bigNumber}>{tasks.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Pending</span>
                <strong style={styles.breakdownValue}>{taskCounts.pending}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Completed</span>
                <strong style={styles.breakdownValue}>{taskCounts.completed}</strong>
              </div>
            </div>
          </div>

          <div style={styles.card} className="app-card">
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Requests</h2>
              <Link to="/requests" className="dashboard-link">View</Link>
            </div>
            <p style={styles.bigNumber}>{requests.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Open notes</span>
                <strong style={styles.breakdownValue}>{requests.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
