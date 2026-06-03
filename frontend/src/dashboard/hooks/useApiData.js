import { useState, useEffect, useCallback } from 'react';
import { useSocketEvent } from '../../hooks/useSocket.js';

// Generic data hook over the existing api wrappers (which already use client.js:
// session cookie + { success, data, error } envelope + 401 handling). Tracks
// loading/error and re-fetches live when the given socket event fires.
//
// `fetcher` must be stable (a module-level api function), so `load` is stable.
export function useApiData(fetcher, socketEvent) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  // Fetch on mount. load() only setState after its await, so there's no
  // synchronous cascading render — the lint rule can't see past the call.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Live updates — refetch when the backend broadcasts a change.
  useSocketEvent(socketEvent, load);

  return { data, loading, error, refetch: load };
}
