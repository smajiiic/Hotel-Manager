import { formatRelative } from '../utils/formatRelative.js'

function RequestRow({ request, room, canDelete, onDelete }) {
  return (
    <article className="request-row">
      <div className="request-row-meta">
        <span className="request-row-room">Room {room?.roomNumber ?? '—'}</span>
        <span className="request-row-time">{formatRelative(request.createdAt)}</span>
        {request.createdBy && (
          <span className="request-row-author">by {request.createdBy}</span>
        )}
      </div>
      <p className="request-row-note">{request.note}</p>
      {canDelete && (
        <div className="request-row-actions">
          <button
            type="button"
            className="request-row-delete"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  )
}

export default RequestRow
