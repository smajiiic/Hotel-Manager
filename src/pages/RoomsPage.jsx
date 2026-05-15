// src/pages/RoomsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import RoomRow from '../components/RoomRow';
import StatusBadge from '../components/StatusBadge';

// Styles 

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8f7f4',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem 1.5rem',
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
  summaryRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  summaryCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '0.75rem 1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '120px',
  },
  summaryLabel: {
    fontSize: '0.72rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryCount: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1,
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
    gridTemplateColumns: '140px 1fr 1fr',
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
    gridTemplateColumns: '140px 1fr 1fr',
  },
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.9rem',
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
  refreshBtn: {
    marginLeft: '0.5rem',
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#991b1b',
    fontSize: '0.875rem',
    padding: 0,
  },
  loadingRow: {
    padding: '3rem',
    textAlign: 'center',
    color: '#9ca3af',
    gridColumn: '1 / -1',
  },
};

// Helper

function countByStatus(rooms) {
  return rooms.reduce(
    (acc, r) => {
      if (r.status in acc) acc[r.status]++;
      return acc;
    },
    { available: 0, occupied: 0, 'needs-cleaning': 0 }
  );
}

// Component 

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Per-room state: which rooms are mid request and which have errors
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [rowErrors, setRowErrors] = useState({}); // { [roomId]: errorString }

  // Fetch all rooms ────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load rooms');
      setRooms(data.data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Optimistic status update
  const handleStatusChange = useCallback(async (roomId, newStatus) => {
    // Save previous rooms for rollback
    const prevRooms = rooms;

    // Clear any existing row error for this room
    setRowErrors((prev) => ({ ...prev, [roomId]: null }));

    // Optimistically update UI immediately
    setRooms((prev) =>
      prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r))
    );

    // Mark this row as updating (disables the dropdown)
    setUpdatingIds((prev) => new Set(prev).add(roomId));

    try {
      const res = await fetch(`/api/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');
    } catch (err) {
      // Rollback to previous state
      setRooms(prevRooms);
      setRowErrors((prev) => ({ ...prev, [roomId]: 'Failed to save. Try again.' }));
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }
  }, [rooms]);

  // Derived data 
  const counts = countByStatus(rooms);

  // Render 
  return (
    <>
      {/* Google Font drop this if you're loading fonts globally */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Room Overview</h1>
          <p style={styles.subtitle}>
            IsaBegov Hamam Hotel · {rooms.length} rooms total
          </p>
        </div>

        {/* Status Summary Cards */}
        {!loading && !fetchError && (
          <div style={styles.summaryRow}>
            {[
              { key: 'available', label: 'Available' },
              { key: 'occupied', label: 'Occupied' },
              { key: 'needs-cleaning', label: 'Needs Cleaning' },
            ].map(({ key, label }) => (
              <div key={key} style={styles.summaryCard}>
                <span style={styles.summaryLabel}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.summaryCount}>{counts[key]}</span>
                  <StatusBadge status={key} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fetch Error Banner */}
        {fetchError && (
          <div style={styles.errorBanner}>
            Could not load rooms: {fetchError}
            <button style={styles.refreshBtn} onClick={fetchRooms}>
              Retry
            </button>
          </div>
        )}

        {/* Rooms Table */}
        <div style={styles.card}>
          {/* Table Header */}
          <div style={styles.tableHeader}>
            <span style={styles.tableHeaderCell}>Room</span>
            <span style={styles.tableHeaderCell}>Status</span>
            <span style={styles.tableHeaderCell}>Change Status</span>
          </div>

          {/* Table Body */}
          <div style={styles.tableBody}>
            {loading ? (
              <div style={styles.loadingRow}>Loading rooms…</div>
            ) : rooms.length === 0 ? (
              <div style={{ ...styles.emptyState, gridColumn: '1 / -1' }}>
                No rooms found.
              </div>
            ) : (
              rooms.map((room) => (
                <RoomRow
                  key={room._id}
                  room={room}
                  updating={updatingIds.has(room._id)}
                  error={rowErrors[room._id] ?? null}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
