import { apiGet } from './client.js'

export const getBookings = () => apiGet('/api/bookings')