<<<<<<< Updated upstream
import { useEffect, useState, useCallback } from 'react'
import { getBookings } from '../api/bookingsApi.js'
import { getRooms } from '../api/roomsApi.js'
import BookingRow from '../components/BookingRow.jsx'
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

      {status === 'loading' && <div className="bookings-status">Loading…</div>}

      {status === 'error' && (
        <div className="bookings-status bookings-status-error">
          <span>{loadError}</span>
          <button type="button" onClick={load}>Retry</button>
        </div>
      )}

      {status === 'empty' && (
        <div className="bookings-status">No upcoming bookings.</div>
      )}

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
=======
// src/pages/BookingsPage.jsx
import { useState, useEffect, useCallback } from 'react';

const styles = {
  page: {
    padding: '2rem 1.5rem',
    backgroundColor: '#f8f7f4',
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '1.75rem',
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  filterRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#6b7280',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    backgroundColor: '#111827',
    color: '#fff',
    borderColor: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 120px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    padding: '0.65rem 1rem',
  },
  tableHeaderCell: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tableBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 120px',
  },
  cell: {
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.9rem',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  guestName: {
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.9rem',
    gridColumn: '1 / -1',
  },
  loadingRow: {
    padding: '3rem',
    textAlign: 'center',
    color: '#9ca3af',
    gridColumn: '1 / -1',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem',
    color: '#991b1b',
    fontSize: '0.875rem',
  },
  retryBtn: {
    marginLeft: '0.5rem',
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#991b1b',
    fontSize: '0.875rem',
    padding: 0,
  },
};

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' },
  active: { label: 'Active', backgroundColor: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' },
  completed: { label: 'Completed', backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#d1d5db' },
  cancelled: { label: 'Cancelled', backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderColor: '#d1d5db',
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      border: `1px solid ${config.borderColor}`,
      backgroundColor: config.backgroundColor,
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </span>
  );
>>>>>>> Stashed changes
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const FILTERS = ['all', 'upcoming', 'active', 'completed', 'cancelled'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const filtered = activeFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>Bookings</h1>
          <p style={styles.subtitle}>IsaBegov Hamam Hotel · {bookings.length} total bookings</p>
        </div>

        {/* Filter Buttons */}
        <div style={styles.filterRow}>
          {FILTERS.map(f => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                ...(activeFilter === f ? styles.filterBtnActive : {}),
              }}
              onClick={() => setActiveFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {fetchError && (
          <div style={styles.errorBanner}>
            Could not load bookings: {fetchError}
            <button style={styles.retryBtn} onClick={fetchBookings}>Retry</button>
          </div>
        )}

        <div style={styles.card}>
          <div style={styles.tableHeader}>
            <span style={styles.tableHeaderCell}>Guest</span>
            <span style={styles.tableHeaderCell}>Room</span>
            <span style={styles.tableHeaderCell}>Check-in</span>
            <span style={styles.tableHeaderCell}>Check-out</span>
            <span style={styles.tableHeaderCell}>Status</span>
          </div>

          <div style={styles.tableBody}>
            {loading ? (
              <div style={styles.loadingRow}>Loading bookings…</div>
            ) : filtered.length === 0 ? (
              <div style={styles.emptyState}>No bookings found.</div>
            ) : (
              filtered.map(booking => (
                <>
                  <div key={`${booking._id}-guest`} style={styles.cell}>
                    <span style={styles.guestName}>{booking.guestName}</span>
                  </div>
                  <div key={`${booking._id}-room`} style={styles.cell}>
                    Room {booking.roomNumber ?? booking.roomId}
                  </div>
                  <div key={`${booking._id}-in`} style={styles.cell}>
                    {formatDate(booking.checkIn)}
                  </div>
                  <div key={`${booking._id}-out`} style={styles.cell}>
                    {formatDate(booking.checkOut)}
                  </div>
                  <div key={`${booking._id}-status`} style={styles.cell}>
                    <StatusBadge status={booking.status} />
                  </div>
                </>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}