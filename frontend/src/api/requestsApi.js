// requestsApi — dual-mode wrapper. Env var `VITE_USE_REAL_API` chooses which
// implementation backs the exports. Default (false / unset) keeps the mock
// layer active so tests and offline dev work without the backend running.
// Flip to `true` in `.env` to point at the real `/api/requests` routes.
//
// Routes documented at docs/api-contracts-tasks-requests.md.

import { mockRequests } from '../mocks/requests.js'
import { apiGet, apiPost, apiDelete } from './client.js'

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'

// ---- Mock implementation (default) ----

const delay = () => new Promise((r) => setTimeout(r, 200))
let requests = mockRequests.map((r) => ({ ...r }))

const mockImpl = {
  async getRequests() {
    await delay()
    return requests.map((r) => ({ ...r }))
  },
  async createRequest(req) {
    await delay()
    const created = {
      _id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req,
    }
    requests = [created, ...requests]
    return created
  },
  async deleteRequest(id) {
    await delay()
    requests = requests.filter((r) => r._id !== id)
  },
}

// ---- Real backend implementation (active when VITE_USE_REAL_API=true) ----

const realImpl = {
  getRequests: () => apiGet('/api/requests'),
  createRequest: (req) => apiPost('/api/requests', req),
  deleteRequest: (id) => apiDelete(`/api/requests/${id}`),
}

const impl = USE_REAL_API ? realImpl : mockImpl

export const { getRequests, createRequest, deleteRequest } = impl
