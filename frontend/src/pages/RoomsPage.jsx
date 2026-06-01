// src/pages/RoomsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import RoomRow from '../components/RoomRow';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import '../styles/dashboard.css';

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
    margin: '0 0 0.35rem 0',
    fontSize: '1.875rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.92rem',
    color: 'var(--color-text-secondary)',
  },
  summaryRow: {
    display: 'flex',
    gap: '0.85rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  summaryCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.85rem 1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '140px',
    boxShadow: 'var(--shadow-xs)',
  },
  summaryLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  summaryCount: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: 'var(--color-text-primary)',
    lineHeight: 1,
    letterSpacing: '-0.025em',
    fontVariantNumeric: 'tabular-nums',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-xs)',
  },
  errorWrap: { marginBottom: '1.25rem' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 1fr',
    backgroundColor: 'var(--color-surface-2)',
    borderBottom: '1px solid var(--color-border)',
    padding: '0.75rem 1.1rem',
  },
  tableHeaderCell: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  tableBody: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr 1fr',
  },
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

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

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
      setRowErrors((prev) => ({ ...prev, [roomId]: 'Failed to save. Try again.' }));
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

      <div style={styles.page} className="dashboard-page-enter">
        <div style={styles.header}>
          <h1 style={styles.title}>Room Overview</h1>
          <p style={styles.subtitle}>
            Isa Begov Hamam · {rooms.length} rooms total
          </p>
        </div>

        {!loading && !fetchError && (
          <div style={styles.summaryRow}>
            {[
              { key: 'available', label: 'Available' },
              { key: 'occupied', label: 'Occupied' },
              { key: 'needs-cleaning', label: 'Needs Cleaning' },
            ].map(({ key, label }) => (
              <div key={key} style={styles.summaryCard} className="app-card">
                <span style={styles.summaryLabel}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

        <div style={styles.card}>
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
