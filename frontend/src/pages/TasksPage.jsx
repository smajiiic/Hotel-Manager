import { useEffect, useState, useCallback } from 'react'
import { getTasks, completeTask, createTask } from '../api/tasksApi.js'
import { getRooms } from '../api/roomsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import TaskCard from '../components/TaskCard.jsx'
import NewTaskForm from '../components/NewTaskForm.jsx'
import '../styles/tasks.css'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

const addButtonStyles = {
  alignSelf: 'flex-start',
  padding: '0.55rem 1rem',
  border: 'none',
  backgroundColor: '#111827',
  color: '#fff',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: '600',
  cursor: 'pointer',
  marginBottom: '0.5rem',
}

function TasksPage() {
  const { role } = useAuth()
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [filter, setFilter] = useState('pending')
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const canCreate = role === 'manager' || role === 'reception'

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

  const handleComplete = async (id) => {
    setActionError(null)
    try {
      await completeTask(id)
      await load()
    } catch (err) {
      setActionError(err?.message ?? 'Failed to mark task complete')
    }
  }

  const handleCreate = async (data) => {
    await createTask(data)
    setShowForm(false)
    await load()
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
          style={addButtonStyles}
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
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default TasksPage
