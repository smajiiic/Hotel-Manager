// src/components/RoomRow.jsx
import StatusBadge from './StatusBadge';

const STATUSES = ['available', 'occupied', 'needs-cleaning'];

const styles = {
  row: {
    display: 'contents', // participates in parent CSS grid
  },
  cell: {
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.9rem',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fff',
    transition: 'background-color 0.15s',
  },
  roomNumber: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#111827',
    fontVariantNumeric: 'tabular-nums',
  },
  select: {
    padding: '0.45rem 0.75rem',
    borderRadius: '7px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    color: '#374151',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    maxWidth: '180px',
    width: '100%',
  },
  selectUpdating: {
    opacity: 0.6,
    pointerEvents: 'none',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '2px',
  },
};

/**
 * RoomRow renders a single room inside the RoomsPage grid/table.
 *
 * Props:
 *  - room ( _id, roomNumber, status )
 *  - updating boolean — true while the PUT request is in-flight
 *  - error    string | null — shown below the dropdown on failure
 *  - onStatusChange(roomId, newStatus) — called when dropdown changes
 */
export default function RoomRow({ room, updating, error, onStatusChange }) {
  const { _id, roomNumber, status } = room;

  return (
    <>
      {/* Room Number */}
      <div style={{ ...styles.cell }}>
        <span style={styles.roomNumber}>Room {roomNumber}</span>
      </div>

      {/* Status Badge */}
      <div style={styles.cell}>
        <StatusBadge status={status} />
      </div>

      {/* Status Dropdown */}
      <div style={{ ...styles.cell, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <select
          style={{
            ...styles.select,
            ...(updating ? styles.selectUpdating : {}),
          }}
          value={status}
          disabled={updating}
          onChange={(e) => onStatusChange(_id, e.target.value)}
          aria-label={`Change status for room ${roomNumber}`}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === 'needs-cleaning' ? 'Needs Cleaning' : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        {error && <span style={styles.errorText}>{error}</span>}
        {updating && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Saving…</span>}
      </div>
    </>
  );
}
