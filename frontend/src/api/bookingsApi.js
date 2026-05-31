import { apiGet, apiPost, apiDelete } from './client.js'

export const getBookings = () => apiGet('/api/bookings')

export const createBooking = (booking) => apiPost('/api/bookings', booking)

export const deleteBooking = (id) => apiDelete(`/api/bookings/${id}`)
