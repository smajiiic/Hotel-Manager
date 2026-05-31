import { formatRelative } from '../utils/formatRelative.js'

const resolvedBadge = {
  display: 'inline-block',
  padding: '0.2rem 0.55rem',
  marginLeft: '0.5rem',
  borderRadius: '999px',
  fontSize: '0.7rem',
  fontWeight: '700',
  backgroundColor: '#dcfce7',
  color: '#166534',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const resolveBtn = {
  marginRight: '0.5rem',
  padding: '0.4rem 0.85rem',
  border: '1px solid #86efac',
  backgroundColor: '#fff',
  color: '#166534',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
}

const unresolveBtn = {
  marginRight: '0.5rem',
  padding: '0.4rem 0.85rem',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  color: '#374151',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
}

function RequestRow({ request, room, canDelete, onDelete, onResolve, onUnresolve }) {
  const isResolved = !!request.resolved
  const noteStyles = isResolved
    ? { textDecoration: 'line-through', color: '#9ca3af' }
    : {}

  return (
    <article className="request-row">
      <div className="request-row-meta">
        <span className="request-row-room">Room {room?.roomNumber ?? '—'}</span>
        <span className="request-row-time">{formatRelative(request.createdAt)}</span>
        {request.createdBy && (
          <span className="request-row-author">by {request.createdBy}</span>
        )}
        {isResolved && <span style={resolvedBadge}>Resolved</span>}
      </div>
      <p className="request-row-note" style={noteStyles}>{request.note}</p>
      {(canDelete || onResolve || onUnresolve) && (
        <div className="request-row-actions">
          {!isResolved && onResolve && (
            <button
              type="button"
              onClick={() => onResolve(request._id)}
              style={resolveBtn}
            >
              Mark resolved
            </button>
          )}
          {isResolved && onUnresolve && (
            <button
              type="button"
              onClick={() => onUnresolve(request._id)}
              style={unresolveBtn}
            >
              Reopen
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="request-row-delete"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default RequestRow
