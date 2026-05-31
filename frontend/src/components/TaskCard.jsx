import { formatRelative } from '../utils/formatRelative.js'

const reopenBtnStyles = {
  alignSelf: 'flex-end',
  marginLeft: '0.3rem',
  padding: '0.15rem 0.5rem',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  color: '#6b7280',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
  width: 'fit-content',
}

const deleteBtnStyles = {
  alignSelf: 'flex-end',
  marginLeft: '0.3rem',
  padding: '0.15rem 0.5rem',
  border: '1px solid #fecaca',
  backgroundColor: '#fff',
  color: '#b00020',
  borderRadius: '4px',
  fontSize: '0.7rem',
  fontFamily: "'DM Sans', sans-serif",
  cursor: 'pointer',
  width: 'fit-content',
}

const actionsRowStyles = {
  display: 'flex',
  gap: '0.3rem',
  justifyContent: 'flex-end',
  marginTop: '0.4rem',
}

function TaskCard({ task, room, role, onComplete, onReopen, onDelete }) {
  const canComplete = task.status === 'pending' && role !== 'manager'
  const canReopen = task.status === 'completed' && !!onReopen
  const canDelete = !!onDelete

  return (
    <article className="task-card">
      <div className="task-card-main">
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <span className="task-room">Room {room?.roomNumber ?? '—'}</span>
          <span className={`task-status task-status-${task.status}`}>{task.status}</span>
          <span className="task-date">{formatRelative(task.createdAt)}</span>
          {task.assignedTo && (
            <span className="task-assigned">assigned: {String(task.assignedTo)}</span>
          )}
        </div>
      </div>
      {canComplete && (
        <button
          type="button"
          className="primary task-card-action"
          onClick={() => onComplete(task._id)}
        >
          Mark complete
        </button>
      )}
      {(canReopen || canDelete) && (
        <div style={actionsRowStyles}>
          {canReopen && (
            <button
              type="button"
              onClick={() => onReopen(task._id)}
              style={reopenBtnStyles}
            >
              Undo
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              style={deleteBtnStyles}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  )
}

export default TaskCard
