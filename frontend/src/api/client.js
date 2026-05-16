// Fetch wrapper for the real backend (used in sprint 2+ when the API goes live).
// Handles the `{ success, data, error }` envelope, sends the session cookie, and
// redirects to /login on 401. Per-module files (tasksApi.js, requestsApi.js,
// roomsApi.js) currently return mocks, but will swap to these helpers later.

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const init = {
    method,
    credentials: 'include',
    headers: {},
  }
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, init)

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.assign('/login')
    }
    throw new ApiError('Unauthorized', 401)
  }

  let payload = null
  try {
    payload = await res.json()
  } catch {
    throw new ApiError(`Invalid JSON from ${path}`, res.status)
  }

  if (!res.ok || payload?.success === false) {
    throw new ApiError(payload?.error || `Request failed (${res.status})`, res.status)
  }

  return payload.data
}

export const apiGet = (path) => request(path)
export const apiPost = (path, body) => request(path, { method: 'POST', body })
export const apiPut = (path, body) => request(path, { method: 'PUT', body })
export const apiPatch = (path, body) => request(path, { method: 'PATCH', body })
export const apiDelete = (path) => request(path, { method: 'DELETE' })
