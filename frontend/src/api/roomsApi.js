import { apiGet, apiPut, apiPost } from './client.js'

export const getRooms = () => apiGet('/api/rooms')

export const updateRoomStatus = (id, status) =>
  apiPut(`/api/rooms/${id}/status`, { status })

// Checkout turnover. Hits the facade-backed POST route, which closes the active
// booking and leaves the room in needs-cleaning. Returns { room, booking }.
// `id` is the room's Mongo _id.
export const checkoutRoom = (id) => apiPost(`/api/rooms/${id}/checkout`)

// Check-in turnover. Hits the facade-backed POST route, which creates/activates
// the booking and flips the room to occupied. Returns { room, booking }.
// `id` is the room's Mongo _id; `payload` = { guestName, checkIn, checkOut }.
export const checkinRoom = (id, payload) => apiPost(`/api/rooms/${id}/checkin`, payload)
