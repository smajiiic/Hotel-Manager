// tasksApi — dual-mode wrapper. Env var `VITE_USE_REAL_API` chooses which
// implementation backs the exports. Default (false / unset) keeps the mock
// layer active so tests and offline dev work without the backend running.
// Flip to `true` in `.env` to point at the real `/api/tasks` routes.
//
// Routes documented at docs/api-contracts-tasks-requests.md.

import { mockTasks } from '../mocks/tasks.js'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client.js'

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'

// ---- Mock implementation (default) ----

const delay = () => new Promise((r) => setTimeout(r, 200))
let tasks = mockTasks.map((t) => ({ ...t }))

const mockImpl = {
  async getTasks() {
    await delay()
    return tasks.map((t) => ({ ...t }))
  },
  async createTask(task) {
    await delay()
    const created = {
      _id: `tsk_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...task,
    }
    tasks = [created, ...tasks]
    return created
  },
  async updateTask(id, patch) {
    await delay()
    tasks = tasks.map((t) => (t._id === id ? { ...t, ...patch } : t))
    return tasks.find((t) => t._id === id)
  },
  async completeTask(id) {
    await delay()
    tasks = tasks.map((t) => (t._id === id ? { ...t, status: 'completed' } : t))
    return tasks.find((t) => t._id === id)
  },
  async deleteTask(id) {
    await delay()
    tasks = tasks.filter((t) => t._id !== id)
  },
}

// ---- Real backend implementation (active when VITE_USE_REAL_API=true) ----

const realImpl = {
  getTasks: () => apiGet('/api/tasks'),
  createTask: (task) => apiPost('/api/tasks', task),
  updateTask: (id, patch) => apiPut(`/api/tasks/${id}`, patch),
  completeTask: (id) => apiPatch(`/api/tasks/${id}/complete`),
  deleteTask: (id) => apiDelete(`/api/tasks/${id}`),
}

const impl = USE_REAL_API ? realImpl : mockImpl

export const { getTasks, createTask, updateTask, completeTask, deleteTask } = impl
