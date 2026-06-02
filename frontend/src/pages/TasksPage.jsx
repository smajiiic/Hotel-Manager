import { useEffect, useState, useCallback } from 'react'
import { useSocketEvent } from '../hooks/useSocket'
import { getTasks, completeTask, createTask, reopenTask, deleteTask } from '../api/tasksApi.js'
import { getRooms } from '../api/roomsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import TaskCard from '../components/TaskCard.jsx'
import NewTaskForm from '../components/NewTaskForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import '../styles/tasks.css'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]


function TasksPage() {
  const { role } = useAuth()
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [filter, setFilter] = useState('pending')
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const canCreate = role === 'manager' || role === 'reception'
  const canManage = role === 'manager' || role === 'reception'

  const load = useCallback(async () => {
    setStatus('loading')
    setLoadError(null)
    try {
      const [taskList, roomList] = await Promise.all([getTasks(), getRooms()])
      setTasks(taskList)
      setRooms(roomList)
      setStatus(taskList.length === 0 ? 'empty' : 'populated')
    } catch (err) {
      setLoadError(err?.message ?? 'Failed to load tasks')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useSocketEvent("tasks:updated", load)

  const handleComplete = async (id) => {
    setActionError(null)
    try {
      await completeTask(id)
      await load()
    } catch (err) {
      setActionError(err?.message ?? 'Failed to mark task complete')
    }
  }

  const handleReopen = async (id) => {
    setActionError(null)
    try {
      await reopenTask(id)
      await load()
    } catch (err) {
      setActionError(err?.message ?? 'Failed to reopen task')
    }
  }

  const handleCreate = async (data) => {
    await createTask(data)
    setShowForm(false)
    await load()
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    setActionError(null)
    try {
      await deleteTask(target._id)
      await load()
    } catch (err) {
      setActionError(err?.message ?? 'Failed to delete task')
    }
  }

  const roomById = Object.fromEntries(rooms.flatMap((r) => [[r._id, r], [r.roomNumber, r]]))
  const visibleTasks = tasks.filter((t) => filter === 'all' || t.status === filter)

  return (
    <section className="tasks-page">
      <h1>Tasks</h1>

      {canCreate && !showForm && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="btn-brass"
        >
          + New task
        </button>
      )}

      {canCreate && showForm && (
        <NewTaskForm
          rooms={rooms}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="tasks-filters" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            className={`tasks-filter ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && <div className="tasks-banner">{actionError}</div>}

      {status === 'loading' && <div className="tasks-status">Loading…</div>}

      {status === 'error' && (
        <div className="tasks-status tasks-status-error">
          <span>{loadError}</span>
          <button type="button" onClick={load}>Retry</button>
        </div>
      )}

      {status === 'empty' && <div className="tasks-status">No tasks yet.</div>}

      {status === 'populated' && visibleTasks.length === 0 && (
        <div className="tasks-status">No {filter} tasks.</div>
      )}

      {status === 'populated' && visibleTasks.length > 0 && (
        <ul className="tasks-list">
          {visibleTasks.map((task) => (
            <li key={task._id}>
              <TaskCard
                task={task}
                room={roomById[task.roomId]}
                role={role}
                onComplete={handleComplete}
                onReopen={canManage ? handleReopen : undefined}
                onDelete={canManage ? setPendingDelete : undefined}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete task?"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.description}"? This cannot be undone.`
            : ''
        }
        confirmLabel="Yes, delete"
        cancelLabel="Keep"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}

export default TasksPage
