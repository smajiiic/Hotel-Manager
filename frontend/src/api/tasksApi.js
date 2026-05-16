// TEMP sprint 1: mock-backed. Components only import from here, so swapping
// to the real backend in sprint 2 is a single-file change.
import { mockTasks } from '../mocks/tasks.js'

const delay = () => new Promise((r) => setTimeout(r, 200))

let tasks = mockTasks.map((t) => ({ ...t }))

export async function getTasks() {
  await delay()
  return tasks.map((t) => ({ ...t }))
}

export async function createTask(task) {
  await delay()
  const created = {
    _id: `tsk_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...task,
  }
  tasks = [created, ...tasks]
  return created
}

export async function updateTask(id, patch) {
  await delay()
  tasks = tasks.map((t) => (t._id === id ? { ...t, ...patch } : t))
  return tasks.find((t) => t._id === id)
}

export async function completeTask(id) {
  await delay()
  tasks = tasks.map((t) => (t._id === id ? { ...t, status: 'completed' } : t))
  return tasks.find((t) => t._id === id)
}

export async function deleteTask(id) {
  await delay()
  tasks = tasks.filter((t) => t._id !== id)
}

/* Sprint 2 swap — replace bodies above with these:
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client.js'
export const getTasks = () => apiGet('/api/tasks')
export const createTask = (task) => apiPost('/api/tasks', task)
export const updateTask = (id, patch) => apiPut(`/api/tasks/${id}`, patch)
export const completeTask = (id) => apiPatch(`/api/tasks/${id}/complete`)
export const deleteTask = (id) => apiDelete(`/api/tasks/${id}`)
*/
