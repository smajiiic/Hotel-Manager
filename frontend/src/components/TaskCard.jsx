import { formatRelative } from '../utils/formatRelative.js'

function TaskCard({ task, room, role, onComplete }) {
  const canComplete = task.status === 'pending' && role !== 'manager'

  return (
    <article className="task-card">
      <div className="task-card-main">
        <p className="task-description">{task.description}</p>
        <div className="task-meta">
          <span className="task-room">Room {room?.roomNumber ?? '—'}</span>
          <span className={`task-status task-status-${task.status}`}>{task.status}</span>
          <span className="task-date">{formatRelative(task.createdAt)}</span>
          {task.assignedTo && (
            // TODO sprint 2: backend may return an object; adapt then.
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
    </article>
  )
}

export default TaskCard
