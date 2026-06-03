import './ReceptionView.css';
import { useState, useCallback } from 'react';
import FloorPlan from '../components/FloorPlan.jsx';
import MetricCards from '../components/MetricCards.jsx';
import RoomDetailPanel from '../components/RoomDetailPanel.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import { IconBed, IconPerson, IconBroom, IconClipboard } from '../components/icons.jsx';
import { useDashboard } from '../DashboardContext.jsx';
import { useRooms } from '../hooks/useRooms.js';
import { useTasks } from '../hooks/useTasks.js';
import { useRequests } from '../hooks/useRequests.js';
import { useBookings } from '../hooks/useBookings.js';
import { buildRoomViewModels } from '../lib/roomViewModel.js';
import { computeReceptionMetrics } from '../lib/metrics.js';
import { updateRoomStatus, checkoutRoom, checkinRoom } from '../../api/roomsApi.js';
import { createTask } from '../../api/tasksApi.js';
import { createRequest } from '../../api/requestsApi.js';

// Reception command center: live floor plan + metrics, with a room action panel
// for status changes, facade-backed checkout, and task/note creation.
export default function ReceptionView() {
  const { rooms, loading: lr, error: er, refetch: rr } = useRooms();
  const { tasks, loading: lt, error: et, refetch: rt } = useTasks();
  const { requests, loading: lq, error: eq, refetch: rq } = useRequests();
  const { bookings, loading: lb, error: eb, refetch: rb } = useBookings();

  const { selectedNumber, setSelectedNumber, fullscreen, setFullscreen } = useDashboard();
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [confirmCheckout, setConfirmCheckout] = useState(false);

  const loading = lr || lt || lq || lb;
  const error = er || et || eq || eb;
  const refetchAll = () => { rr(); rt(); rq(); rb(); };

  const roomViewModels = buildRoomViewModels(rooms, tasks, requests, bookings);
  const metrics = computeReceptionMetrics(rooms, tasks);
  const selectedRoom = roomViewModels.find((r) => r.roomNumber === selectedNumber) ?? null;

  // Honest metrics — just the live numbers (no fabricated trend %). Open tasks
  // links through to the full list.
  const metricItems = [
    { key: 'available', label: 'Available', value: metrics.available, tone: 'available', Icon: IconBed },
    { key: 'occupied', label: 'Occupied', value: metrics.occupied, tone: 'occupied', Icon: IconPerson },
    { key: 'needs-cleaning', label: 'Needs cleaning', value: metrics.needsCleaning, tone: 'cleaning', Icon: IconBroom },
    { key: 'open-tasks', label: 'Open tasks', value: metrics.openTasks, tone: 'teal', Icon: IconClipboard, link: { label: 'View all', to: '/tasks' } },
  ];

  const closePanel = useCallback(() => {
    setSelectedNumber(null);
    setActionError(null);
  }, [setSelectedNumber]);

  // Each handler performs a single backend call (no multi-service orchestration
  // in the component — checkout goes through the facade endpoint).
  const runAction = async (fn, refetchers) => {
    setActionBusy(true);
    setActionError(null);
    try {
      await fn();
      refetchers.forEach((f) => f());
    } catch (err) {
      setActionError(err?.message || 'Action failed. Please try again.');
      throw err;
    } finally {
      setActionBusy(false);
    }
  };

  const handleSetStatus = (status) =>
    runAction(() => updateRoomStatus(selectedRoom._id, status), [rr, rt]).catch(() => {});

  const handleConfirmCheckout = async () => {
    if (actionBusy) return; // guard the irreversible turnover against double-submit
    try {
      await runAction(() => checkoutRoom(selectedRoom._id), [rr, rb, rt]);
      setConfirmCheckout(false);
    } catch {
      setConfirmCheckout(false); // error already surfaced in the panel
    }
  };

  // Check-in goes through the same facade pattern as checkout (one backend call,
  // then refetch). No ConfirmModal — the form itself is the deliberate step.
  const handleCheckin = (payload) =>
    runAction(() => checkinRoom(selectedRoom._id, payload), [rr, rb]);

  const handleAddTask = (description) =>
    runAction(() => createTask({ description, roomId: selectedRoom.roomNumber }), [rt]);

  const handleAddNote = (note) =>
    runAction(() => createRequest({ note, roomId: selectedRoom.roomNumber }), [rq]);

  return (
    <section className="ibh-role-view" data-testid="reception-view" aria-labelledby="reception-heading">
      <h1 id="reception-heading" className="ibh-sr-only">Reception command center</h1>

      {error && (
        <ErrorState message={`Could not load the floor plan: ${error}`} onRetry={refetchAll} />
      )}

      {loading ? (
        <LoadingState message="Loading the hotel…" />
      ) : (
        <>
          {!fullscreen && <MetricCards items={metricItems} />}
          <FloorPlan
            rooms={roomViewModels}
            mode="interactive"
            selectedRoomNumber={selectedNumber}
            onRoomSelect={(room) => {
              setActionError(null);
              setSelectedNumber(room.roomNumber);
            }}
            title="Reception floor plan"
            fullscreen={fullscreen}
            onFullscreen={() => setFullscreen((f) => !f)}
          />
        </>
      )}

      {selectedRoom && (
        <RoomDetailPanel
          key={selectedRoom.roomNumber}
          room={selectedRoom}
          onClose={closePanel}
          onSetStatus={handleSetStatus}
          onCheckout={() => setConfirmCheckout(true)}
          onCheckin={handleCheckin}
          onAddTask={handleAddTask}
          onAddNote={handleAddNote}
          busy={actionBusy}
          actionError={actionError}
        />
      )}

      <ConfirmModal
        isOpen={confirmCheckout}
        title="Check out room?"
        message={
          selectedRoom
            ? `Check out Room ${selectedRoom.roomNumber}${selectedRoom.guestName ? ` (${selectedRoom.guestName})` : ''}? This closes the booking and marks the room for cleaning.`
            : ''
        }
        confirmLabel="Check out"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCheckout}
        onCancel={() => setConfirmCheckout(false)}
      />
    </section>
  );
}
