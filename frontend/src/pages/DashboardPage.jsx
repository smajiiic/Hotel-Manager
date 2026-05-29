import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getRooms } from '../api/roomsApi.js'
import { getBookings } from '../api/bookingsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

const todayLocal = () => new Date().toLocaleDateString('sv-SE')

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f7f4',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
  },
  header: { marginBottom: '2rem' },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.02em',
  },
  subtitle: { margin: 0, fontSize: '0.95rem', color: '#6b7280' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1.25rem 1.4rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    margin: 0,
  },
  cardLink: {
    fontSize: '0.78rem',
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
  },
  bigNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1,
    margin: '0 0 0.5rem 0',
  },
  breakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    marginTop: '0.5rem',
  },
  breakdownRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    color: '#374151',
  },
  breakdownLabel: { color: '#6b7280' },
  placeholderNote: {
    fontSize: '0.825rem',
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: '0.5rem',
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

export default function DashboardPage() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const [roomList, bookingList] = await Promise.all([getRooms(), getBookings()])
      setRooms(roomList)
      setBookings(bookingList)
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

  return (
    <div style={styles.page}>
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
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Rooms</h2>
              <Link to="/rooms" style={styles.cardLink}>View →</Link>
            </div>
            <p style={styles.bigNumber}>{rooms.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Available</span>
                <strong>{roomCounts.available}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Occupied</span>
                <strong>{roomCounts.occupied}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Needs cleaning</span>
                <strong>{roomCounts['needs-cleaning']}</strong>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Bookings</h2>
              <Link to="/bookings" style={styles.cardLink}>View →</Link>
            </div>
            <p style={styles.bigNumber}>{bookings.length}</p>
            <div style={styles.breakdown}>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Currently checked in</span>
                <strong>{todayBookings.checkedIn}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Arriving today</span>
                <strong>{todayBookings.arriving}</strong>
              </div>
              <div style={styles.breakdownRow}>
                <span style={styles.breakdownLabel}>Departing today</span>
                <strong>{todayBookings.departing}</strong>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Tasks</h2>
              <Link to="/tasks" style={styles.cardLink}>View →</Link>
            </div>
            <p style={styles.bigNumber}>—</p>
            <p style={styles.placeholderNote}>
              Wiring in progress — counts will populate once <code>/api/tasks</code> ships.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Requests</h2>
              <Link to="/requests" style={styles.cardLink}>View →</Link>
            </div>
            <p style={styles.bigNumber}>—</p>
            <p style={styles.placeholderNote}>
              Wiring in progress — counts will populate once <code>/api/requests</code> ships.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}