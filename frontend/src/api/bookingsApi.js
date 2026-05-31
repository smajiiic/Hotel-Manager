import { apiGet, apiPost } from './client.js'

export const getBookings = () => apiGet('/api/bookings')

export const createBooking = (booking) => apiPost('/api/bookings', booking)
