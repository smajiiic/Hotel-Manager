import { mockRequests } from '../mocks/requests.js'
import { apiGet, apiPost, apiPatch, apiDelete } from './client.js'

const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true'

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
      resolved: false,
      ...req,
    }
    requests = [created, ...requests]
    return created
  },
  async resolveRequest(id) {
    await delay()
    requests = requests.map((r) => (r._id === id ? { ...r, resolved: true } : r))
    return requests.find((r) => r._id === id)
  },
  async unresolveRequest(id) {
    await delay()
    requests = requests.map((r) => (r._id === id ? { ...r, resolved: false } : r))
    return requests.find((r) => r._id === id)
  },
  async deleteRequest(id) {
    await delay()
    requests = requests.filter((r) => r._id !== id)
  },
}

const realImpl = {
  getRequests: () => apiGet('/api/requests'),
  createRequest: (req) => apiPost('/api/requests', req),
  resolveRequest: (id) => apiPatch(`/api/requests/${id}/resolve`),
  unresolveRequest: (id) => apiPatch(`/api/requests/${id}/unresolve`),
  deleteRequest: (id) => apiDelete(`/api/requests/${id}`),
}

const impl = USE_REAL_API ? realImpl : mockImpl

export const { getRequests, createRequest, resolveRequest, unresolveRequest, deleteRequest } = impl
