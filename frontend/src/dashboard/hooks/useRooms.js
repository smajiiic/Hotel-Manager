import { getRooms } from '../../api/roomsApi.js';
import { useApiData } from './useApiData.js';

export function useRooms() {
  const { data, loading, error, refetch } = useApiData(getRooms, 'rooms:updated');
  return { rooms: data ?? [], loading, error, refetch };
}
