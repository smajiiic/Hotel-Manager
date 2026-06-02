import { useState } from 'react';
import FloorPlan from '../components/FloorPlan.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { useRooms } from '../hooks/useRooms.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRequests } from '../hooks/useRequests.js';
import { useBookings } from '../hooks/useBookings.js';
import { buildRoomViewModels } from '../lib/roomViewModel.js';

// Reception command center. Stage 2 wires the live floor plan end-to-end;
// metric cards, the room action panel, and checkout arrive in Stage 3.
export default function ReceptionView() {
  const { rooms, loading: lr, error: er, refetch: rr } = useRooms();
  const { tasks, loading: lt, error: et, refetch: rt } = useTasks();
  const { requests, loading: lq, error: eq, refetch: rq } = useRequests();
  const { bookings, loading: lb, error: eb, refetch: rb } = useBookings();
  const [selected, setSelected] = useState(null);

  const loading = lr || lt || lq || lb;
  const error = er || et || eq || eb;
  const refetchAll = () => { rr(); rt(); rq(); rb(); };

  const roomViewModels = buildRoomViewModels(rooms, tasks, requests, bookings);

  return (
    <section data-testid="reception-view" aria-labelledby="reception-heading">
      <h1 id="reception-heading">Command center</h1>
      <p className="muted">Live floor plan — tap a room to act on it.</p>

      {error && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState message={`Could not load the floor plan: ${error}`} onRetry={refetchAll} />
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading the hotel…" />
      ) : (
        <FloorPlan
          rooms={roomViewModels}
          mode="interactive"
          selectedRoomNumber={selected?.roomNumber ?? null}
          onRoomSelect={setSelected}
          title="Reception floor plan"
        />
      )}
    </section>
  );
}
