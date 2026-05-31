import { useEffect, useState, useCallback } from 'react'
import { getBookings, createBooking } from '../api/bookingsApi.js'
import { getRooms } from '../api/roomsApi.js'
import BookingRow from '../components/BookingRow.jsx'
import NewBookingForm from '../components/NewBookingForm.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/bookings.css'

const addButtonStyles = {
  alignSelf: 'flex-start',
  padding: '0.55rem 1rem',
  border: 'none',
  backgroundColor: '#111827',
  color: '#fff',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: '600',
  cursor: 'pointer',
}

function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [showForm, setShowForm] = useState(false)

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

  const handleCreate = async (data) => {
    await createBooking(data)
    setShowForm(false)
    await load()
  }

  const roomById = Object.fromEntries(
    rooms.flatMap((r) => [[r._id, r], [r.roomNumber, r]]),
  )

  return (
    <section className="bookings-page">
      <header className="bookings-header">
        <h1>Bookings</h1>
      </header>

      {!showForm && status !== 'loading' && status !== 'error' && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={addButtonStyles}
        >
          + New booking
        </button>
      )}

      {showForm && (
        <NewBookingForm
          rooms={rooms}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

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
