function formatRelative(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`

  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)
  if (date >= startOfYesterday && date < startOfToday) return 'yesterday'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

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
