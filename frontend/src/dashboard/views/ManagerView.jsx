import './ManagerView.css';
import { useState } from 'react';
import FloorPlan from '../components/FloorPlan.jsx';
import MetricCards from '../components/MetricCards.jsx';
import CheckoutCrunchCard from '../components/CheckoutCrunchCard.jsx';
import LineChart from '../components/LineChart.jsx';
import ManagerRoomDetail from '../components/ManagerRoomDetail.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { useRooms } from '../hooks/useRooms.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRequests } from '../hooks/useRequests.js';
import { buildRoomViewModels } from '../lib/roomViewModel.js';
import { round, roundPct } from '../lib/format.js';
import { getManagerMetrics, getRoomStatusHistory } from '../data/managerMetrics.js';

// Manager read-only analytics. Metrics + chart come from the mock managerMetrics
// module (swappable for a real endpoint later); the heatmap is LIVE room data.
export default function ManagerView() {
  const { rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  const { tasks } = useTasks();
  const { requests } = useRequests();
  // No useBookings — manager analytics is read-only and the heatmap is status-only,
  // so no guest data is fetched.

  const [selectedNumber, setSelectedNumber] = useState(null);

  const metrics = getManagerMetrics();
  const roomViewModels = buildRoomViewModels(rooms, tasks, requests); // no bookings → no guest data
  const selectedRoom = roomViewModels.find((r) => r.roomNumber === selectedNumber) ?? null;
  const history = selectedRoom ? getRoomStatusHistory(selectedRoom.roomNumber) : [];

  // Cumulative tasks-completed line through the day (pure; series is tiny).
  const chartData = metrics.tasksByHour.map((p, i, arr) => ({
    label: p.hour.slice(0, 5),
    value: arr.slice(0, i + 1).reduce((sum, x) => sum + x.completed, 0),
  }));
  const chartTotal = chartData.length ? chartData[chartData.length - 1].value : 0;

  // Lead metrics — the manager-only insights reception can't see.
  const leadItems = [
    {
      key: 'turnaround',
      label: 'Avg turnaround',
      value: `${round(metrics.avgTurnaround.minutes)} min`,
      sub: 'checkout → available',
      tone: 'teal',
    },
    {
      key: 'tasks',
      label: 'Tasks today',
      value: `${round(metrics.tasks.completedToday)} done`,
      sub: `${round(metrics.tasks.outstanding)} outstanding · ${roundPct(metrics.tasks.completionRate)}% complete`,
      tone: 'available',
    },
    {
      key: 'requests',
      label: 'Outstanding notes',
      value: `${round(metrics.outstandingRequests)}`,
      sub: 'shift communication backlog',
      tone: 'cleaning',
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
    },
    {
      key: 'mix',
      label: 'Status mix',
      value: `${round(metrics.occupancy.occupied)} · ${round(metrics.occupancy.available)} · ${round(metrics.occupancy.needsCleaning)}`,
      sub: 'occupied · available · cleaning',
      tone: 'teal',
    },
  ];

  return (
    <section data-testid="manager-view" aria-labelledby="manager-heading">
      <h1 id="manager-heading">Operations overview</h1>
      <p className="muted">Read-only — the health of the operation at a glance.</p>

      <CheckoutCrunchCard {...metrics.checkoutCrunch} />

      <MetricCards items={leadItems} />

      <div className="ibh-chart-card">
        <LineChart
          data={chartData}
          title="Tasks completed through the day"
          ariaLabel={`Cumulative tasks completed through the day, reaching ${chartTotal} by end of day.`}
        />
      </div>

      <MetricCards items={secondaryItems} variant="secondary" />

      <h2 className="ibh-section-h">Floor plan</h2>
      <p className="muted">Status heatmap — tap a room to see its status history.</p>

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
