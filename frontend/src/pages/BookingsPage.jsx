import { useEffect, useState, useCallback } from 'react'
import { getBookings } from '../api/bookingsApi.js'
import { getRooms } from '../api/roomsApi.js'
import BookingRow from '../components/BookingRow.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/bookings.css'

function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setLoadError(null)
    try {
      const [bookingList, roomList] = await Promise.all([getBookings(), getRooms()])
      const sorted = [...bookingList].sort((a, b) =>
        a.checkIn.localeCompare(b.checkIn),
      )
      setBookings(sorted)
      setRooms(roomList)
      setStatus(sorted.length === 0 ? 'empty' : 'populated')
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load bookings')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const roomById = Object.fromEntries(rooms.map((r) => [r._id, r]))

  return (
    <section className="bookings-page">
      <header className="bookings-header">
        <h1>Bookings</h1>
      </header>

      {status === 'loading' && <LoadingState />}

      {status === 'error' && <ErrorState message={loadError} onRetry={load} />}

      {status === 'empty' && <EmptyState message="No upcoming bookings." />}

      {status === 'populated' && (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking._id}>
              <BookingRow booking={booking} room={roomById[booking.roomId]} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default BookingsPage