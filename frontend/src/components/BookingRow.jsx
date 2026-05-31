import StatusBadge from './StatusBadge.jsx'

function formatBookingDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function isToday(iso) {
  const today = new Date().toLocaleDateString('sv-SE')
  return iso === today
}

const cancelBtnStyles = {
  alignSelf: 'flex-start',
  padding: '0.4rem 0.85rem',
  border: '1px solid #fecaca',
  backgroundColor: '#fff',
  color: '#b00020',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: '500',
  cursor: 'pointer',
  marginTop: '0.5rem',
}

function BookingRow({ booking, room, onCancel }) {
  const checkInToday = isToday(booking.checkIn)
  const checkOutToday = isToday(booking.checkOut)
  const highlightClass = checkInToday || checkOutToday ? 'is-today' : ''

  return (
    <article className={`booking-row ${highlightClass}`}>
      <div className="booking-row-header">
        <span className="booking-row-guest">{booking.guestName}</span>
        <span className="booking-row-room">Room {room?.roomNumber ?? '—'}</span>
        {room?.status && <StatusBadge status={room.status} />}
      </div>

      <div className="booking-row-dates">
        <span>{formatBookingDate(booking.checkIn)}</span>
        <span className="booking-row-arrow" aria-hidden="true">→</span>
        <span>{formatBookingDate(booking.checkOut)}</span>
      </div>

      <div className="booking-row-tags">
        {booking.occupancyStatus && (
          <span className={`booking-status booking-status-${booking.occupancyStatus}`}>
            {booking.occupancyStatus.replace('-', ' ')}
          </span>
        )}
        {checkInToday && (
          <span className="booking-tag booking-tag-today">Arriving today</span>
        )}
        {checkOutToday && (
          <span className="booking-tag booking-tag-today">Departing today</span>
        )}
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          style={cancelBtnStyles}
        >
          Cancel booking
        </button>
      )}
    </article>
  )
}

export default BookingRow
