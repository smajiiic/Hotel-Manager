import { useEffect, useState, useCallback } from 'react'
import { useSocketEvent } from '../hooks/useSocket'
import { getBookings, createBooking, deleteBooking } from '../api/bookingsApi.js'
import { getRooms } from '../api/roomsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import BookingRow from '../components/BookingRow.jsx'
import NewBookingForm from '../components/NewBookingForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
import '../styles/bookings.css'


function BookingsPage() {
  const { role } = useAuth()
  const [bookings, setBookings] = useState([])
  const [rooms, setRooms] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingCancel, setPendingCancel] = useState(null)

  const canCancel = role === 'reception' || role === 'manager'

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

  useSocketEvent("bookings:updated", load)

  const handleCreate = async (data) => {
    await createBooking(data)
    setShowForm(false)
    await load()
  }

  const handleConfirmCancel = async () => {
    if (!pendingCancel) return
    setActionError(null)
    try {
      await deleteBooking(pendingCancel._id)
      setPendingCancel(null)
      await load()
    } catch (err) {
      setActionError(err?.message ?? 'Failed to cancel booking')
      setPendingCancel(null)
    }
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
          className="btn-brass"
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

      {actionError && <div className="bookings-status bookings-status-error">{actionError}</div>}

      {status === 'loading' && <LoadingState />}

      {status === 'error' && <ErrorState message={loadError} onRetry={load} />}

      {status === 'empty' && <EmptyState message="No upcoming bookings." />}

      {status === 'populated' && (
        <ul className="bookings-list">
          {bookings.map((booking) => (
            <li key={booking._id}>
              <BookingRow
                booking={booking}
                room={roomById[booking.roomId]}
                onCancel={canCancel ? setPendingCancel : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingCancel}
        title="Cancel booking?"
        message={
          pendingCancel
            ? `Are you sure you want to cancel the booking for ${pendingCancel.guestName}? This cannot be undone.`
            : ''
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep"
        destructive
        onConfirm={handleConfirmCancel}
        onCancel={() => setPendingCancel(null)}
      />
    </section>
  )
}

export default BookingsPage
