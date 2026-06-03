import { getTasks } from '../../api/tasksApi.js';
import { useApiData } from './useApiData.js';

export function useTasks() {
  const { data, loading, error, refetch } = useApiData(getTasks, 'tasks:updated');
  return { tasks: data ?? [], loading, error, refetch };
}
