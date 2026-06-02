import { getRequests } from '../../api/requestsApi.js';
import { useApiData } from './useApiData.js';

export function useRequests() {
  const { data, loading, error, refetch } = useApiData(getRequests, 'requests:updated');
  return { requests: data ?? [], loading, error, refetch };
}
