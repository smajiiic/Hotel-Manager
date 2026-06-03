import './ManagerView.css';
import FloorPlan from '../components/FloorPlan.jsx';
import MetricCards from '../components/MetricCards.jsx';
import CheckoutCrunchCard from '../components/CheckoutCrunchCard.jsx';
import ManagerRoomDetail from '../components/ManagerRoomDetail.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { useRooms } from '../hooks/useRooms.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRequests } from '../hooks/useRequests.js';
import { buildRoomViewModels } from '../lib/roomViewModel.js';
import { round, roundPct } from '../lib/format.js';
import { getManagerMetrics, getRoomStatusHistory } from '../data/managerMetrics.js';
import { IconReports, IconClipboard, IconChat, IconBed, IconFloorPlan } from '../components/icons.jsx';
import { useDashboard } from '../DashboardContext.jsx';

// Manager read-only analytics. Metrics + chart come from the mock managerMetrics
// module (swappable for a real endpoint later); the heatmap is LIVE room data.
export default function ManagerView() {
  const { rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  const { tasks } = useTasks();
  const { requests } = useRequests();
  // No useBookings — manager analytics is read-only and the heatmap is status-only,
  // so no guest data is fetched.

  const { selectedNumber, setSelectedNumber, fullscreen, setFullscreen } = useDashboard();

  const metrics = getManagerMetrics();
  const roomViewModels = buildRoomViewModels(rooms, tasks, requests); // no bookings → no guest data
  const selectedRoom = roomViewModels.find((r) => r.roomNumber === selectedNumber) ?? null;
  const history = selectedRoom ? getRoomStatusHistory(selectedRoom.roomNumber) : [];

  // Lead metrics — the manager-only insights reception can't see.
  const leadItems = [
    {
      key: 'turnaround',
      label: 'Avg turnaround',
      value: `${round(metrics.avgTurnaround.minutes)} min`,
      sub: 'checkout → available',
      tone: 'teal',
      Icon: IconReports,
    },
    {
      key: 'tasks',
      label: 'Tasks today',
      value: `${round(metrics.tasks.completedToday)} done`,
      sub: `${round(metrics.tasks.outstanding)} outstanding · ${roundPct(metrics.tasks.completionRate)}% complete`,
      tone: 'available',
      Icon: IconClipboard,
    },
    {
      key: 'requests',
      label: 'Outstanding notes',
      value: `${round(metrics.outstandingRequests)}`,
      sub: 'shift communication backlog',
      tone: 'cleaning',
      Icon: IconChat,
    },
  ];

  // Secondary — restated spatially by the heatmap, so demoted to small tiles.
  const secondaryItems = [
    {
      key: 'occupancy',
      label: 'Occupancy',
      value: `${roundPct(metrics.occupancy.ratePct)}%`,
      sub: `${round(metrics.occupancy.occupied)} of ${round(metrics.occupancy.total)} rooms`,
      tone: 'occupied',
      Icon: IconBed,
    },
    {
      key: 'mix',
      label: 'Status mix',
      value: `${round(metrics.occupancy.occupied)} · ${round(metrics.occupancy.available)} · ${round(metrics.occupancy.needsCleaning)}`,
      sub: 'occupied · available · cleaning',
      tone: 'teal',
      Icon: IconFloorPlan,
    },
  ];

  return (
    <section className="ibh-role-view ibh-manager-view" data-testid="manager-view" aria-labelledby="manager-heading">
      <h1 id="manager-heading" className="ibh-sr-only">Operations overview</h1>

      {!fullscreen && (
        <>
          <CheckoutCrunchCard {...metrics.checkoutCrunch} />

          <MetricCards items={leadItems} />

          <MetricCards items={secondaryItems} variant="secondary" />

          <h2 className="ibh-section-h">Floor plan</h2>
          <p className="muted">Status heatmap — tap a room to see its status history.</p>
        </>
      )}

      {roomsError && (
        <div style={{ marginBottom: 16 }}>
          <ErrorState message={`Could not load the floor plan: ${roomsError}`} onRetry={refetchRooms} />
        </div>
      )}

      {roomsLoading ? (
        <LoadingState message="Loading the floor plan…" />
      ) : (
        <FloorPlan
          rooms={roomViewModels}
          mode="readonly"
          selectedRoomNumber={selectedNumber}
          onRoomSelect={(room) => setSelectedNumber(room.roomNumber)}
          title="Manager floor plan (read-only heatmap)"
          fullscreen={fullscreen}
          onFullscreen={() => setFullscreen((f) => !f)}
        />
      )}

      {selectedRoom && (
        <ManagerRoomDetail
          room={selectedRoom}
          history={history}
          onClose={() => setSelectedNumber(null)}
        />
      )}
    </section>
  );
}
