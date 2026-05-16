// TEMP sprint 1: mock-backed. Components only import from here, so swapping
// to the real backend in sprint 2 is a single-file change.
import { mockRequests } from '../mocks/requests.js'

const delay = () => new Promise((r) => setTimeout(r, 200))

let requests = mockRequests.map((r) => ({ ...r }))

export async function getRequests() {
  await delay()
  return requests.map((r) => ({ ...r }))
}

export async function createRequest(req) {
  await delay()
  const created = {
    _id: `req_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req,
  }
  requests = [created, ...requests]
  return created
}

export async function deleteRequest(id) {
  await delay()
  requests = requests.filter((r) => r._id !== id)
}

/* Sprint 2 swap — replace bodies above with these:
import { apiGet, apiPost, apiDelete } from './client.js'
export const getRequests = () => apiGet('/api/requests')
export const createRequest = (req) => apiPost('/api/requests', req)
export const deleteRequest = (id) => apiDelete(`/api/requests/${id}`)
*/
