// TEMP sprint 2: mock-backed. Components only import from here, so swapping
// to the real backend when BookingService lands is a single-file change.
import { mockBookings } from '../mocks/bookings.js'

const delay = () => new Promise((r) => setTimeout(r, 200))

let bookings = mockBookings.map((b) => ({ ...b }))

export async function getBookings() {
  await delay()
  return bookings.map((b) => ({ ...b }))
}

/* Sprint 3 swap — replace body above with:
import { apiGet } from './client.js'
export const getBookings = () => apiGet('/api/bookings')
*/
