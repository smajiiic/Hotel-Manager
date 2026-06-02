// src/pages/RoomsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import RoomRow from '../components/RoomRow';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { useSocketEvent } from '../hooks/useSocket';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem 1.5rem',
    boxSizing: 'border-box',
  },
  header: { marginBottom: '1.75rem' },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.6rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em',
    textShadow: '0 2px 12px rgba(0,0,0,0.55)',
  },
  subtitle: { margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' },
  summaryRow: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  summaryCard: {
    padding: '0.75rem 1.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: '120px',
  },
  summaryLabel: {
    fontSize: '0.72rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryCount: { fontSize: '1.5rem', fontWeight: '800', color: '#111827', lineHeight: 1 },
  card: {
    overflow: 'hidden',
  },
  errorWrap: { marginBottom: '1.25rem' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 1fr',
    backgroundColor: 'rgba(249, 250, 251, 0.6)',
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
  tableBody: { display: 'grid', gridTemplateColumns: '140px 1fr 1fr' },
};

function countByStatus(rooms) {
  return rooms.reduce(
    (acc, r) => {
      if (r.status in acc) acc[r.status]++;
      return acc;
    },
    { available: 0, occupied: 0, 'needs-cleaning': 0 }
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [rowErrors, setRowErrors] = useState({});

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE}/api/rooms`, { credentials: 'include' });
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

  useSocketEvent("rooms:updated", fetchRooms);

  const handleStatusChange = useCallback(async (roomId, newStatus) => {
    const prevRooms = rooms;
    setRowErrors((prev) => ({ ...prev, [roomId]: null }));
    setRooms((prev) =>
      prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r))
    );
    setUpdatingIds((prev) => new Set(prev).add(roomId));

    try {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');
    } catch (err) {
      setRooms(prevRooms);
      setRowErrors((prev) => ({ ...prev, [roomId]: err.message || 'Failed to save. Try again.' }));
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }
  }, [rooms]);

  const counts = countByStatus(rooms);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div style={styles.page}>
        <div style={styles.header}>
          <h1 style={styles.title}>Room Overview</h1>
          <p style={styles.subtitle}>
            IsaBegov Hamam Hotel · {rooms.length} rooms total
          </p>
        </div>

        {!loading && !fetchError && (
          <div style={styles.summaryRow}>
            {[
              { key: 'available', label: 'Available' },
              { key: 'occupied', label: 'Occupied' },
              { key: 'needs-cleaning', label: 'Needs Cleaning' },
            ].map(({ key, label }) => (
              <div key={key} className="app-card" style={styles.summaryCard}>
                <span style={styles.summaryLabel}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.summaryCount}>{counts[key]}</span>
                  <StatusBadge status={key} />
                </div>
              </div>
            ))}
          </div>
        )}

        {fetchError && (
          <div style={styles.errorWrap}>
            <ErrorState
              message={`Could not load rooms: ${fetchError}`}
              onRetry={fetchRooms}
            />
          </div>
        )}

        <div className="app-card" style={styles.card}>
          {loading ? (
            <LoadingState message="Loading rooms…" />
          ) : rooms.length === 0 && !fetchError ? (
            <EmptyState message="No rooms found." />
          ) : !fetchError ? (
            <>
              <div style={styles.tableHeader}>
                <span style={styles.tableHeaderCell}>Room</span>
                <span style={styles.tableHeaderCell}>Status</span>
                <span style={styles.tableHeaderCell}>Change Status</span>
              </div>
              <div style={styles.tableBody}>
                {rooms.map((room) => (
                  <RoomRow
                    key={room._id}
                    room={room}
                    updating={updatingIds.has(room._id)}
                    error={rowErrors[room._id] ?? null}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
