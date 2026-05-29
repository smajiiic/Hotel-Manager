import { useEffect, useState, useCallback } from 'react'
import { getTasks, completeTask } from '../api/tasksApi.js'
import { getRooms } from '../api/roomsApi.js'
import { useAuth } from '../hooks/useAuth.js'
import TaskCard from '../components/TaskCard.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'
import EmptyState from '../components/EmptyState.jsx'
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

  const roomById = Object.fromEntries(rooms.map((r) => [r._id, r]))
  const visibleTasks = tasks.filter((t) => filter === 'all' || t.status === filter)

  return (
    <section className="tasks-page">
      <h1>Tasks</h1>

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

      {status === 'loading' && <LoadingState />}

      {status === 'error' && <ErrorState message={loadError} onRetry={load} />}

      {status === 'empty' && <EmptyState message="No tasks yet." />}

      {status === 'populated' && visibleTasks.length === 0 && (
        <EmptyState message={`No ${filter} tasks.`} />
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
