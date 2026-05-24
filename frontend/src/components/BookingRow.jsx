// Absolute date formatter — 'Tue, May 24'. Bookings care about WHEN
// (planning), not how-long-ago, so this is distinct from formatRelative.
// If a second consumer ever needs the same shape, extract to utils/.
function formatBookingDate(iso) {
  // 'T00:00:00' forces local-midnight interpretation; without it, plain
  // 'YYYY-MM-DD' parses as UTC midnight and can shift a day backward in
  // negative timezone offsets.
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

function BookingRow({ booking, room }) {
  const checkInToday = isToday(booking.checkIn)
  const checkOutToday = isToday(booking.checkOut)
  const highlightClass = checkInToday || checkOutToday ? 'is-today' : ''

  return (
    <article className={`booking-row ${highlightClass}`}>
      <div className="booking-row-header">
        <span className="booking-row-guest">{booking.guestName}</span>
        <span className="booking-row-room">Room {room?.roomNumber ?? '—'}</span>
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
    </article>
  )
}

export default BookingRow
