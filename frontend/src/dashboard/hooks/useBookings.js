import { getBookings } from '../../api/bookingsApi.js';
import { useApiData } from './useApiData.js';

// Only reception + manager may call this (backend enforces; cleaning views must
// not mount it, so no guest data ever reaches the cleaning role).
export function useBookings() {
  const { data, loading, error, refetch } = useApiData(getBookings, 'bookings:updated');
  return { bookings: data ?? [], loading, error, refetch };
}
