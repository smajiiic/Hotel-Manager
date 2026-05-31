import { mockTasks } from '../mocks/tasks.js'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client.js'

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'

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
  async reopenTask(id) {
    await delay()
    tasks = tasks.map((t) => (t._id === id ? { ...t, status: 'pending' } : t))
    return tasks.find((t) => t._id === id)
  },
  async deleteTask(id) {
    await delay()
    tasks = tasks.filter((t) => t._id !== id)
  },
}

const realImpl = {
  getTasks: () => apiGet('/api/tasks'),
  createTask: (task) => apiPost('/api/tasks', task),
  updateTask: (id, patch) => apiPut(`/api/tasks/${id}`, patch),
  completeTask: (id) => apiPatch(`/api/tasks/${id}/complete`),
  reopenTask: (id) => apiPatch(`/api/tasks/${id}/reopen`),
  deleteTask: (id) => apiDelete(`/api/tasks/${id}`),
}

const impl = USE_REAL_API ? realImpl : mockImpl

export const { getTasks, createTask, updateTask, completeTask, reopenTask, deleteTask } = impl
