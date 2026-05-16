// TEMP sprint 1: mock-backed. Components only import from here, so swapping
// to the real backend in sprint 2 is a single-file change.
import { mockRooms } from '../mocks/rooms.js'

const delay = () => new Promise((r) => setTimeout(r, 200))

let rooms = mockRooms.map((r) => ({ ...r }))

export async function getRooms() {
  await delay()
  return rooms.map((r) => ({ ...r }))
}

export async function updateRoomStatus(id, status) {
  await delay()
  rooms = rooms.map((r) => (r._id === id ? { ...r, status } : r))
  return rooms.find((r) => r._id === id)
}

/* Sprint 2 swap — replace bodies above with these:
import { apiGet, apiPut } from './client.js'
export const getRooms = () => apiGet('/api/rooms')
export const updateRoomStatus = (id, status) => apiPut(`/api/rooms/${id}/status`, { status })
*/
