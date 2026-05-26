import { apiGet, apiPut } from './client.js'

export const getRooms = () => apiGet('/api/rooms')

export const updateRoomStatus = (id, status) =>
  apiPut(`/api/rooms/${id}/status`, { status })
/* Sprint 2 swap — replace bodies above with these:
import { apiGet, apiPut } from './client.js'
export const getRooms = () => apiGet('/api/rooms')
export const updateRoomStatus = (id, status) => apiPut(`/api/rooms/${id}/status`, { status })
*/
